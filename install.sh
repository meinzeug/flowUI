#!/bin/bash
set -euo pipefail

LOGFILE=/var/log/flowui-install.log
exec > >(tee -a "$LOGFILE") 2>&1

if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    echo "This script requires root privileges or sudo." >&2
    exit 1
  fi
else
  SUDO=""
fi

CONFIG_FILE="$(dirname "$0")/install.json"

# Optionally remove almost all packages to start from a clean system
echo -e "\n### Preparing clean system (optional)" 
read -rp "Strip packages leaving only SSH and base system? (y/n): " CLEAN_CONFIRM
if [[ $CLEAN_CONFIRM =~ ^[Yy]$ ]]; then
  KEEP_PKGS="openssh-server openssh-client sudo curl wget ufw vim nano lsb-release gnupg iproute2 net-tools"
  ESSENTIAL_PKGS=$(dpkg-query -Wf '${Package} ${Priority} ${Essential}\n' | awk '$2=="required" || $2=="important" || $3=="yes" {print $1}')
  # retain apt and all of its dependencies with installed architecture suffixes
  APT_DEPS=$(apt-cache depends --recurse --installed apt 2>/dev/null | awk '/Depends:/{print $2}' | sort -u)
  APT_DEPS_ARCH=""
  for pkg in $APT_DEPS; do
    arch_pkg=$(dpkg -l "$pkg" 2>/dev/null | awk '/^ii/{print $2}')
    APT_DEPS_ARCH="$APT_DEPS_ARCH $arch_pkg"
  done
  KEEP_LIST="$KEEP_PKGS $ESSENTIAL_PKGS $APT_DEPS_ARCH apt"
  REMOVE_LIST=$(comm -23 <(dpkg --get-selections | awk '{print $1}' | sort) <(echo "$KEEP_LIST" | tr ' ' '\n' | sort))
  if [ -n "$REMOVE_LIST" ]; then
    echo "Removing packages: $REMOVE_LIST"
    if echo "$REMOVE_LIST" | xargs -r $SUDO apt-get -s purge >/dev/null; then
      echo "$REMOVE_LIST" | xargs -r $SUDO apt-get purge -y
      $SUDO apt-get autoremove -y
      $SUDO apt-get clean
    else
      echo "Package removal simulation failed. Skipping clean step." >&2
    fi
  fi
fi

if [ -f "$CONFIG_FILE" ]; then
  DOMAIN=$(grep -oP '"domain"\s*:\s*"\K[^"]+' "$CONFIG_FILE" || true)
  EMAIL=$(grep -oP '"email"\s*:\s*"\K[^"]+' "$CONFIG_FILE" || true)
  NAME=$(grep -oP '"name"\s*:\s*"\K[^"]+' "$CONFIG_FILE" || true)
  echo "Existing configuration found:"
  echo "  Domain: $DOMAIN"
  echo "  Email:  $EMAIL"
  echo "  Name:   $NAME"
  read -rp "Use these values? (y/n): " USE_OLD
  if [[ ! $USE_OLD =~ ^[Yy]$ ]]; then
    DOMAIN=""
    EMAIL=""
    NAME=""
  fi
fi

while [ -z "${DOMAIN:-}" ]; do
  read -rp "Domain for the app (e.g. myapp.example.com): " DOMAIN
done
while [ -z "${EMAIL:-}" ]; do
  read -rp "E-mail for Let's Encrypt: " EMAIL
done
while [ -z "${NAME:-}" ]; do
  read -rp "Your name: " NAME
done

cat > "$CONFIG_FILE" <<EOF
{
  "domain": "$DOMAIN",
  "email": "$EMAIL",
  "name": "$NAME"
}
EOF

echo "\n### Installing required packages..."
$SUDO apt-get update

# Remove Ubuntu's containerd package if it exists to avoid conflicts with Docker's containerd.io
if dpkg -s containerd >/dev/null 2>&1; then
  echo "Removing conflicting package 'containerd'..."
  $SUDO apt-get remove -y containerd
fi

# Base packages
$SUDO apt-get install -y curl git ufw nginx certbot python3-certbot-nginx ca-certificates gnupg lsb-release

# Set up Docker repository and install official packages
$SUDO install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | $SUDO gpg --dearmor -o /etc/apt/keyrings/docker.gpg
$SUDO chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | $SUDO tee /etc/apt/sources.list.d/docker.list > /dev/null

$SUDO apt-get update
$SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
$SUDO systemctl enable --now docker

echo "\n### Configuring firewall..."
$SUDO ufw allow OpenSSH
$SUDO ufw allow http
$SUDO ufw allow https
$SUDO ufw --force enable

APP_DIR=/opt/flowUI
if [ ! -d "$APP_DIR" ]; then
  echo "\n### Cloning repository..."
  $SUDO git clone https://github.com/meinzeug/flowUI.git "$APP_DIR"
else
  echo "\n### Repository already exists. Updating..."
  $SUDO git -C "$APP_DIR" pull
fi
cd "$APP_DIR"

if [ ! -f .env ]; then
  echo "\n### Creating environment file..."
  cat <<EENV | $SUDO tee .env
FRONTEND_PORT=8080
BACKEND_PORT=3008
EENV
fi

$SUDO sed -i '/"443:443"/d' docker-compose.yml

echo "\n### Building and starting Docker containers..."
$SUDO docker compose up -d --build

NGCONF="/etc/nginx/sites-available/${DOMAIN}"
if [ ! -f "$NGCONF" ]; then
  echo "\n### Creating NGINX configuration..."
  $SUDO tee "$NGCONF" >/dev/null <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX
  $SUDO ln -sf "$NGCONF" /etc/nginx/sites-enabled/${DOMAIN}
fi

$SUDO nginx -t
$SUDO systemctl reload nginx

echo "\n### Obtaining SSL certificate..."
$SUDO certbot --nginx --redirect --non-interactive --agree-tos -m "$EMAIL" -d "$DOMAIN"
$SUDO systemctl enable certbot.timer

echo "\n### Deployment complete"
echo "Application is available at https://${DOMAIN}"
echo "Installation performed by ${NAME}"

#!/bin/bash
# FlowUI deploys a web based interface for orchestrating AI workflows.
# This installer sets up Docker, obtains SSL certificates and configures
# Nginx as a reverse proxy for the application.
# After installation browse to your domain for the frontend and use
# https://<domain>/api for API requests.
# Use update.sh to upgrade later; configuration lives under /opt/flowUI.
set -euo pipefail

LOGFILE="$HOME/flowui-install.log"
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
$SUDO apt-get update && $SUDO apt-get upgrade -y

# Remove Ubuntu's containerd package if it exists to avoid conflicts with Docker's containerd.io
if dpkg -s containerd >/dev/null 2>&1; then
  echo "Removing conflicting package 'containerd'..."
  $SUDO apt-get remove -y containerd
fi

# Base packages
$SUDO apt-get install -y curl git lsof ufw nginx certbot python3-certbot-nginx ca-certificates gnupg lsb-release

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
  if ! $SUDO git -C "$APP_DIR" pull; then
    if [ -f "$APP_DIR/.env" ] && ! $SUDO git -C "$APP_DIR" ls-files --error-unmatch .env >/dev/null 2>&1; then
      echo "Untracked .env detected, backing up during update..."
      $SUDO mv "$APP_DIR/.env" "$APP_DIR/.env.bak"
      $SUDO git -C "$APP_DIR" pull
      $SUDO mv "$APP_DIR/.env.bak" "$APP_DIR/.env"
      echo "Restored original .env file"
    else
      echo "Failed to update repository." >&2
      exit 1
    fi
  fi
fi
cd "$APP_DIR"

if [ ! -f .env ]; then
  echo "\n### Creating environment file..."
  JWT_SECRET=$(openssl rand -hex 32)
  cat <<EENV | $SUDO tee .env
FRONTEND_PORT=8080
BACKEND_PORT=3008
JWT_SECRET=$JWT_SECRET
EENV
  echo "Generated JWT_SECRET stored in .env"
fi

# Read ports from environment file for nginx configuration
FRONTEND_PORT="$(grep -oP '^FRONTEND_PORT=\K.*' .env 2>/dev/null || echo 8080)"
BACKEND_PORT="$(grep -oP '^BACKEND_PORT=\K.*' .env 2>/dev/null || echo 3008)"



# ensure compose file doesn't publish HTTPS port from the frontend container
if grep -q '"443:443"' docker-compose.yml 2>/dev/null; then
  echo "Removing obsolete HTTPS port mapping from docker-compose.yml"
  $SUDO sed -i '/"443:443"/d' docker-compose.yml
fi

echo "\n### Pulling Docker images and starting containers..."
$SUDO docker compose pull
$SUDO docker compose up -d

NGCONF="/etc/nginx/sites-available/${DOMAIN}"
if [ ! -f "$NGCONF" ]; then
  echo "\n### Creating NGINX configuration..."
  $SUDO tee "$NGCONF" >/dev/null <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://localhost:${FRONTEND_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/ {
        proxy_pass http://localhost:${BACKEND_PORT}/;
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

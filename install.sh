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
  if ! $SUDO git -C "$APP_DIR" pull --rebase --autostash; then
    if [ -f "$APP_DIR/.env" ] && ! $SUDO git -C "$APP_DIR" ls-files --error-unmatch .env >/dev/null 2>&1; then
      echo "Untracked .env detected, backing up during update..."
      $SUDO mv "$APP_DIR/.env" "$APP_DIR/.env.bak"
      $SUDO git -C "$APP_DIR" pull --rebase --autostash
      $SUDO mv "$APP_DIR/.env.bak" "$APP_DIR/.env"
      echo "Restored original .env file"
    elif [ -f "$APP_DIR/.env" ]; then
      echo "Preserving local .env changes during update..."
      $SUDO cp "$APP_DIR/.env" "$APP_DIR/.env.bak"
      $SUDO git -C "$APP_DIR" checkout -- .env
      if $SUDO git -C "$APP_DIR" pull --rebase --autostash; then
        $SUDO mv "$APP_DIR/.env.bak" "$APP_DIR/.env"
        echo "Restored local .env file"
      else
        echo "Failed to update repository." >&2
        $SUDO mv "$APP_DIR/.env.bak" "$APP_DIR/.env"
        exit 1
      fi
    else
      echo "Failed to update repository." >&2
      exit 1
    fi
  fi
fi
cd "$APP_DIR"
echo "### Installing Node dependencies..."
$SUDO npm --prefix backend install
$SUDO npm --prefix mcp install
$SUDO npm --prefix frontend install

# Determine repository slug for GHCR image defaults
REPO_SLUG="$($SUDO git config --get remote.origin.url | \
  sed -E 's#.*/([^/]+/[^/.]+)(\.git)?$#\1#')"
# Docker image names must be lowercase
REPO_SLUG="$(echo "$REPO_SLUG" | tr '[:upper:]' '[:lower:]')"

if [ ! -f .env ]; then
  echo "\n### Creating environment file..."
  JWT_SECRET=$(openssl rand -hex 32)
  cat <<EENV | $SUDO tee .env
FRONTEND_PORT=8080
BACKEND_PORT=4000
MCP_PORT=3008
DATABASE_URL=postgres://flowuser:flowpass@postgres:5432/flowdb
JWT_SECRET=$JWT_SECRET
BACKEND_IMAGE=ghcr.io/${REPO_SLUG}-backend:latest
MCP_IMAGE=ghcr.io/${REPO_SLUG}-mcp:latest
FRONTEND_IMAGE=ghcr.io/${REPO_SLUG}-frontend:latest
EENV
  echo "Generated JWT_SECRET stored in .env"
else
  JWT_SECRET=$(grep -oP '^JWT_SECRET=\K.*' .env 2>/dev/null || openssl rand -hex 32)
  if ! grep -q '^JWT_SECRET=' .env; then
    echo "JWT_SECRET=$JWT_SECRET" | $SUDO tee -a .env
  fi
fi

DATABASE_URL_VALUE="postgres://flowuser:flowpass@postgres:5432/flowdb"
if grep -q '^DATABASE_URL=' .env; then
  $SUDO sed -i "s#^DATABASE_URL=.*#DATABASE_URL=${DATABASE_URL_VALUE}#" .env
else
  echo "DATABASE_URL=${DATABASE_URL_VALUE}" | $SUDO tee -a .env
fi

# Ensure image variables exist if .env was present
if grep -q '^BACKEND_IMAGE=' .env; then
  $SUDO sed -i "s#^BACKEND_IMAGE=.*#BACKEND_IMAGE=ghcr.io/${REPO_SLUG}-backend:latest#" .env
else
  echo "BACKEND_IMAGE=ghcr.io/${REPO_SLUG}-backend:latest" | $SUDO tee -a .env
fi
if grep -q '^MCP_IMAGE=' .env; then
  $SUDO sed -i "s#^MCP_IMAGE=.*#MCP_IMAGE=ghcr.io/${REPO_SLUG}-mcp:latest#" .env
else
  echo "MCP_IMAGE=ghcr.io/${REPO_SLUG}-mcp:latest" | $SUDO tee -a .env
fi

if grep -q '^FRONTEND_IMAGE=' .env; then
  $SUDO sed -i "s#^FRONTEND_IMAGE=.*#FRONTEND_IMAGE=ghcr.io/${REPO_SLUG}-frontend:latest#" .env
else
  echo "FRONTEND_IMAGE=ghcr.io/${REPO_SLUG}-frontend:latest" | $SUDO tee -a .env
fi

# Read ports from environment file, falling back to defaults if absent
FRONTEND_PORT="$(grep -oP '^FRONTEND_PORT=\K.*' .env 2>/dev/null || echo 8080)"
BACKEND_PORT="$(grep -oP '^BACKEND_PORT=\K.*' .env 2>/dev/null || echo 3008)"

# Ensure port variables exist or are updated
if grep -q '^FRONTEND_PORT=' .env; then
  $SUDO sed -i "s#^FRONTEND_PORT=.*#FRONTEND_PORT=${FRONTEND_PORT}#" .env
else
  echo "FRONTEND_PORT=${FRONTEND_PORT}" | $SUDO tee -a .env
fi

if grep -q '^BACKEND_PORT=' .env; then
  $SUDO sed -i "s#^BACKEND_PORT=.*#BACKEND_PORT=${BACKEND_PORT}#" .env
else
  echo "BACKEND_PORT=${BACKEND_PORT}" | $SUDO tee -a .env
fi

# Create service environment files for local development
if [ ! -f backend/.env ]; then
  echo "### Creating backend/.env"
  cp backend/.env.example backend/.env
  $SUDO sed -i "s#JWT_SECRET=.*#JWT_SECRET=${JWT_SECRET}#" backend/.env
  $SUDO sed -i "s#DATABASE_URL=.*#DATABASE_URL=${DATABASE_URL_VALUE}#" backend/.env
fi

if [ ! -f mcp/.env ]; then
  echo "### Creating mcp/.env"
  cp mcp/.env.example mcp/.env
  $SUDO sed -i "s#JWT_SECRET=.*#JWT_SECRET=${JWT_SECRET}#" mcp/.env
fi

# Read GHCR credentials for private images
GHCR_USERNAME="$(grep -oP '^GHCR_USERNAME=\K.*' .env 2>/dev/null || true)"
GHCR_PAT="$(grep -oP '^GHCR_PAT=\K.*' .env 2>/dev/null || true)"

if [ -z "$GHCR_USERNAME" ] || [ -z "$GHCR_PAT" ]; then
  read -rp "GitHub username for GHCR (leave empty to build locally): " INPUT_USER
  if [ -n "$INPUT_USER" ]; then
    GHCR_USERNAME="$INPUT_USER"
    read -rsp "Personal Access Token (read:packages): " INPUT_PAT
    echo
    GHCR_PAT="$INPUT_PAT"
  fi
fi

LOGIN_SUCCESS=0
if [ -n "$GHCR_USERNAME" ] && [ -n "$GHCR_PAT" ]; then
  if echo "$GHCR_PAT" | $SUDO docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin; then
    LOGIN_SUCCESS=1
    if grep -q '^GHCR_USERNAME=' .env; then
      $SUDO sed -i "s#^GHCR_USERNAME=.*#GHCR_USERNAME=$GHCR_USERNAME#" .env
    else
      echo "GHCR_USERNAME=$GHCR_USERNAME" | $SUDO tee -a .env
    fi
    if grep -q '^GHCR_PAT=' .env; then
      $SUDO sed -i "s#^GHCR_PAT=.*#GHCR_PAT=$GHCR_PAT#" .env
    else
      echo "GHCR_PAT=$GHCR_PAT" | $SUDO tee -a .env
    fi
  else
    echo "GHCR login failed, will build images locally"
  fi
else
  echo "No GHCR credentials provided, will build images locally"
fi



# ensure compose file doesn't publish HTTPS port from the frontend container
if grep -q '"443:443"' docker-compose.yml 2>/dev/null; then
  echo "Removing obsolete HTTPS port mapping from docker-compose.yml"
  $SUDO sed -i '/"443:443"/d' docker-compose.yml
fi

echo "\n### Pulling Docker images and starting containers..."
if [ "$LOGIN_SUCCESS" -eq 1 ]; then
  if ! $SUDO docker compose pull; then
    echo "Pull failed, building images locally..."
    $SUDO docker compose build
  fi
else
  $SUDO docker compose build
fi
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
$SUDO systemctl stop nginx
$SUDO systemctl start nginx

echo "\n### Obtaining SSL certificate..."
$SUDO certbot --nginx --redirect --non-interactive --agree-tos -m "$EMAIL" -d "$DOMAIN"
$SUDO systemctl enable certbot.timer

echo "\n### Deployment complete"
echo "Application is available at https://${DOMAIN}"
echo "Installation performed by ${NAME}"

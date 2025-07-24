#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root." >&2
  exit 1
fi

# Determine script location and ensure repository is present
WORKDIR="/opt/flowUI"
if [ ! -f docker-compose.yml ]; then
  echo "docker-compose.yml not found. Cloning repository to $WORKDIR..."
  apt-get update
  apt-get install -y git
  rm -rf "$WORKDIR"
  git clone https://github.com/meinzeug/flowUI.git "$WORKDIR"
  cd "$WORKDIR"
else
  WORKDIR="$(pwd)"
fi

read -p "Domain name for HTTPS: " DOMAIN
read -p "Email for LetsEncrypt: " EMAIL
read -p "Linux user for Docker: " USERNAME
read -p "OpenRouter API Key: " OPENROUTER_API_KEY

# validate username
if [[ "$USERNAME" =~ [[:space:]] ]]; then
  echo "Invalid username: spaces are not allowed." >&2
  exit 1
fi

if ! id -u "$USERNAME" >/dev/null 2>&1; then
  echo "User '$USERNAME' does not exist. Please create it before running this script." >&2
  exit 1
fi

FRONTEND_PORT=8080
BACKEND_PORT=3008

# write configuration for docker compose
cat > .env <<EOF
DOMAIN=$DOMAIN
FRONTEND_PORT=$FRONTEND_PORT
BACKEND_PORT=$BACKEND_PORT
OPENROUTER_API_KEY=$OPENROUTER_API_KEY
EOF

echo "Updating package lists..."
apt update

if ! command -v docker >/dev/null; then
    echo "Installing Docker and Compose plugin..."
    apt-get install -y ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg |
        gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" \
      > /etc/apt/sources.list.d/docker.list
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
else
    echo "Docker already installed"
fi

if ! command -v nginx >/dev/null; then
    echo "Installing NGINX..."
    apt install -y nginx
else
    echo "NGINX already installed"
fi

apt install -y certbot python3-certbot-nginx

echo "Adding $USERNAME to docker group..."
usermod -aG docker "$USERNAME"

echo "Enabling and starting Docker service..."
systemctl enable docker
systemctl start docker

# Build and start containers
echo "Building Docker images..."
export FRONTEND_PORT BACKEND_PORT DOMAIN
docker compose build
echo "Starting containers..."
docker compose up -d

# Configure nginx
tee /etc/nginx/sites-available/claude-flow <<NGINX
server {
    listen 80;
    server_name $DOMAIN;

    location ~ ^/(session|tools|health) {
        proxy_pass http://localhost:${BACKEND_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location / {
        proxy_pass http://localhost:${FRONTEND_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        try_files \$uri \$uri/ /index.html;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/claude-flow /etc/nginx/sites-enabled/claude-flow
nginx -t && systemctl reload nginx

certbot --nginx -d "$DOMAIN" -m "$EMAIL" --non-interactive --agree-tos

echo "Frontend running on port $FRONTEND_PORT"
echo "Backend running on port $BACKEND_PORT"
echo "Installation complete. Access your instance at https://$DOMAIN"
echo "Repository cloned to $WORKDIR"

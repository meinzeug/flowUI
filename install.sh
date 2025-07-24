#!/bin/bash
set -e

read -p "Domain name for HTTPS: " DOMAIN
read -p "Email for LetsEncrypt: " EMAIL
read -p "Linux user for Docker: " USERNAME
read -p "Frontend port [80]: " FRONTEND_PORT
FRONTEND_PORT=${FRONTEND_PORT:-80}
read -p "Backend port [3008]: " BACKEND_PORT
BACKEND_PORT=${BACKEND_PORT:-3008}

echo "Updating package lists..."
sudo apt update

if ! command -v docker >/dev/null; then
    echo "Installing Docker and Compose plugin..."
    sudo apt install -y docker.io docker-compose-plugin
else
    echo "Docker already installed"
fi

if ! command -v nginx >/dev/null; then
    echo "Installing NGINX..."
    sudo apt install -y nginx
else
    echo "NGINX already installed"
fi

sudo apt install -y certbot python3-certbot-nginx

echo "Adding $USERNAME to docker group..."
sudo usermod -aG docker "$USERNAME"

echo "Enabling and starting Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

# Build and start containers
echo "Building Docker images..."
export FRONTEND_PORT BACKEND_PORT
sudo docker compose build
echo "Starting containers..."
sudo docker compose up -d

# Configure nginx
sudo tee /etc/nginx/sites-available/claude-flow <<NGINX
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:${FRONTEND_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/claude-flow /etc/nginx/sites-enabled/claude-flow
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d "$DOMAIN" -m "$EMAIL" --non-interactive --agree-tos

echo "Frontend running on port $FRONTEND_PORT"
echo "Backend running on port $BACKEND_PORT"
echo "Installation complete. Access your instance at https://$DOMAIN"

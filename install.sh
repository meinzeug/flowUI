#!/bin/bash
set -e

read -p "Domain name for HTTPS: " DOMAIN
read -p "Email for LetsEncrypt: " EMAIL
read -p "Linux user for Docker: " USERNAME

# Install dependencies
sudo apt update
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx

sudo usermod -aG docker "$USERNAME"

sudo systemctl enable docker
sudo systemctl start docker

# Build and start containers
sudo docker-compose build
sudo docker-compose up -d

# Configure nginx
sudo tee /etc/nginx/sites-available/claude-flow <<NGINX
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/claude-flow /etc/nginx/sites-enabled/claude-flow
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d "$DOMAIN" -m "$EMAIL" --non-interactive --agree-tos

echo "Installation complete. Access your instance at https://$DOMAIN"

#!/bin/bash
set -e

if [ "$EUID" -eq 0 ]; then
  echo "Please run this script as a regular user, not as root." >&2
  exit 1
fi

REPO_URL=${REPO_URL:-https://github.com/meinzeug/flowUI.git}
REPO_DIR=${REPO_DIR:-flowUI}

if [ ! -f docker-compose.yml ]; then
  echo "docker-compose.yml not found. Cloning repository..."
  if [ ! -d "$REPO_DIR" ]; then
    git clone "$REPO_URL" "$REPO_DIR"
  else
    echo "Using existing directory $REPO_DIR" >&2
  fi
  cd "$REPO_DIR"
fi

FRONTEND_PORT=8080
BACKEND_PORT=3008

read -p "Enter your domain for HTTPS (e.g. example.com): " DOMAIN

if [ -n "$DOMAIN" ]; then
  docker volume inspect letsencrypt >/dev/null 2>&1 || docker volume create letsencrypt
  if docker run --rm -v letsencrypt:/etc/letsencrypt alpine sh -c "test -d /etc/letsencrypt/live/$DOMAIN"; then
    read -p "Existing certificate found for $DOMAIN. Reuse it? [y/N]: " REUSE
    if [ "$REUSE" != "y" ]; then
      CERT_NEEDED=yes
    fi
  else
    CERT_NEEDED=yes
  fi

  if [ "$CERT_NEEDED" = "yes" ]; then
    read -p "Your name: " CERT_NAME
    read -p "Email for Let's Encrypt: " CERT_EMAIL
    docker run --rm -p 80:80 -v letsencrypt:/etc/letsencrypt certbot/certbot certonly --standalone -n --agree-tos -m "$CERT_EMAIL" -d "$DOMAIN"
  fi

  sed "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" nginx/default.conf.template > nginx/default.conf
else
  cp nginx/default.conf.template nginx/default.conf
fi

cat > .env <<EOF
FRONTEND_PORT=$FRONTEND_PORT
BACKEND_PORT=$BACKEND_PORT
OPENROUTER_API_KEY=$OPENROUTER_API_KEY
EOF

if ! command -v docker >/dev/null; then
  echo "Docker not found. Installing rootless Docker..."
  curl -fsSL https://get.docker.com/rootless | sh
  export PATH="$HOME/bin:$PATH"
fi

if ! command -v docker >/dev/null; then
  echo "Docker installation failed or not in PATH. Please install Docker manually." >&2
  exit 1
fi

# Docker command exists but might not be usable (e.g. permission denied)
if ! docker info >/dev/null 2>&1; then
  echo "Docker installed but not accessible for the current user. Attempting rootless Docker..."
  curl -fsSL https://get.docker.com/rootless | sh
  export PATH="$HOME/bin:$PATH"
fi

if ! docker info >/dev/null 2>&1; then
  echo "Unable to access Docker. Adding '$USER' to the docker group (sudo required)..."
  sudo groupadd -f docker
  if sudo usermod -aG docker "$USER"; then
    echo "User added to docker group. Please log out and log back in or run 'newgrp docker' and re-run this script."
    exit 0
  else
    echo "Failed to add user to docker group." >&2
    exit 1
  fi
fi

echo "Building Docker images..."
docker compose build
echo "Starting containers..."
docker compose up -d

echo "Frontend running on port $FRONTEND_PORT"
echo "Backend running on port $BACKEND_PORT"
if [ -n "$DOMAIN" ]; then
  echo "Application available at https://$DOMAIN"
else
  echo "Application available at http://localhost:$FRONTEND_PORT"
fi
echo "Installation complete."

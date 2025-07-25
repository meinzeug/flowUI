#!/bin/bash
# Reinstall nginx and configure SSL using certbot for the given DOMAIN.
# Usage: DOMAIN=example.com [BACKEND_PORT=3008] [EMAIL=user@example.com] ./fixssl.sh
set -euo pipefail

DOMAIN="${DOMAIN:-${domain:-}}"
BACKEND_PORT="${BACKEND_PORT:-3008}"
EMAIL="${EMAIL:-${email:-}}"

while [ -z "$DOMAIN" ]; do
  read -rp "Domain for the app (e.g. myapp.example.com): " DOMAIN
done


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

# Remove and reinstall nginx
$SUDO systemctl stop nginx >/dev/null 2>&1 || true
$SUDO apt-get purge -y nginx nginx-common nginx-full >/dev/null 2>&1 || true
$SUDO apt-get install -y nginx

$SUDO rm -f /etc/nginx/sites-enabled/default

NGCONF="/etc/nginx/sites-available/${DOMAIN}"
cat <<NGINX | $SUDO tee "$NGCONF" >/dev/null
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
$SUDO nginx -t
$SUDO systemctl reload nginx

CERTBOT_ARGS="--nginx --non-interactive --agree-tos --redirect -d ${DOMAIN}"
if [ -n "$EMAIL" ]; then
  CERTBOT_ARGS="$CERTBOT_ARGS -m $EMAIL"
else
  CERTBOT_ARGS="$CERTBOT_ARGS --register-unsafely-without-email"
fi

$SUDO certbot $CERTBOT_ARGS
$SUDO systemctl enable certbot.timer

echo "SSL configuration for ${DOMAIN} completed."

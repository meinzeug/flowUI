#!/bin/bash
set -euo pipefail

# Colors for output
RED="\033[0;31m"
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[1;33m"
RESET="\033[0m"

info() { echo -e "${BLUE}$*${RESET}"; }
success() { echo -e "${GREEN}$*${RESET}"; }
warn() { echo -e "${YELLOW}$*${RESET}"; }
fail() { echo -e "${RED}$*${RESET}"; }

# Use sudo for privileged commands if not executed as root, similar to
# install.sh. Exit if sudo is unavailable.
if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    fail "This script requires root privileges or sudo"
    exit 1
  fi
else
  SUDO=""
fi


# Stop nginx if running to avoid port conflicts during update
stop_nginx() {
  if command -v systemctl >/dev/null 2>&1; then
    if $SUDO systemctl is-active --quiet nginx; then
      info "Stopping NGINX service..."
      $SUDO systemctl stop nginx
      NGINX_STOPPED=1
    fi
  fi
}

# Restart nginx if we stopped it earlier
start_nginx() {
  if [ "${NGINX_STOPPED:-0}" = 1 ] && command -v systemctl >/dev/null 2>&1; then
    info "Starting NGINX service..."
    $SUDO systemctl start nginx
  fi
}

# Determine application directory. When executed via curl pipe, $0 is "bash"
# and the script has no physical path. Default to /opt/flowUI which is used by
# install.sh. If the script resides inside the repository, prefer that location.
if [ -z "${APP_DIR:-}" ]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd)"
  if [ -d "$SCRIPT_DIR/.git" ]; then
    APP_DIR="$SCRIPT_DIR"
  else
    APP_DIR="/opt/flowUI"
  fi
fi

if [ ! -d "$APP_DIR/.git" ]; then
  fail "$APP_DIR is not a flowUI repository"
  exit 1
fi
cd "$APP_DIR"

# ensure nginx is not occupying ports used by docker
stop_nginx

create_env() {
  if [ ! -f .env ]; then
    info "Creating environment file..."
    cat <<EENV | $SUDO tee .env >/dev/null
FRONTEND_PORT=8080
BACKEND_PORT=3008
EENV
  fi
}

BACKUP_DIR="$APP_DIR/backups"
TIMESTAMP="$(date +%Y%m%d%H%M%S)"
BACKUP_FILE="$BACKUP_DIR/flowUI-${TIMESTAMP}.tar.gz"
CURRENT_COMMIT="$(git rev-parse HEAD)"

# Ensure environment file exists and read ports
create_env
# Ports used for health checks (fallback to defaults)
FRONTEND_PORT="$(grep -oP '^FRONTEND_PORT=\K.*' "$APP_DIR/.env" 2>/dev/null || echo 8080)"
BACKEND_PORT="$(grep -oP '^BACKEND_PORT=\K.*' "$APP_DIR/.env" 2>/dev/null || echo 3008)"

create_backup() {
  info "Creating backup at $BACKUP_FILE"
  $SUDO mkdir -p "$BACKUP_DIR"
  # Use sudo for the entire pipeline so the redirected file is created with
  # elevated privileges. Otherwise the redirection happens as the calling user
  # which may not have write permission.
  $SUDO bash -c "git archive --format=tar HEAD | gzip > \"$BACKUP_FILE\""
}

update_nginx_conf() {
  local conf="$APP_DIR/nginx/default.conf"
  local tmpl="$APP_DIR/nginx/default.conf.template"
  local config="$APP_DIR/install.json"
  local domain=""

  if [ -f "$config" ]; then
    domain=$(grep -oP '"domain"\s*:\s*"\K[^"]+' "$config" || true)
  fi

  if [ -n "$domain" ]; then
    info "Updating NGINX configuration for $domain"
    $SUDO sed "s/DOMAIN_PLACEHOLDER/$domain/g" "$tmpl" | $SUDO tee "$conf" >/dev/null
  else
    if [ ! -f "$conf" ]; then
      info "Creating default NGINX configuration..."
      $SUDO cp "$tmpl" "$conf"
    fi
  fi
}

cleanup() { $SUDO docker image prune -f >/dev/null; }

rollback() {
  warn "Rolling back to previous commit $CURRENT_COMMIT"
  $SUDO docker compose down
  $SUDO git reset --hard "$CURRENT_COMMIT"
  FRONTEND_PORT="$FRONTEND_PORT" BACKEND_PORT="$BACKEND_PORT" \
    $SUDO docker compose up -d
  start_nginx
  fail "Rollback finished"
}

trap rollback ERR

info "Updating repository..."
create_backup
$SUDO git pull --ff-only

# Remove legacy HTTPS port mapping if present
if grep -q '"443:443"' docker-compose.yml 2>/dev/null; then
  info "Removing obsolete HTTPS port mapping from docker-compose.yml"
  $SUDO sed -i '/"443:443"/d' docker-compose.yml
fi

update_nginx_conf

info "Updating containers..."
$SUDO docker compose down
if ! $SUDO docker compose pull; then
  warn "Pull failed, building images locally..."
  $SUDO docker compose build
fi

info "Restarting services..."
FRONTEND_PORT="$FRONTEND_PORT" BACKEND_PORT="$BACKEND_PORT" \
  $SUDO docker compose up -d

info "Performing health checks..."
sleep 5
curl -fs "http://localhost:${BACKEND_PORT}/health" >/dev/null
curl -fs "http://localhost:${FRONTEND_PORT}" >/dev/null

cleanup

start_nginx

success "Update complete"
trap - ERR

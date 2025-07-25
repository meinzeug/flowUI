#!/bin/bash
# Toggle between production and development Docker Compose setups.
# Usage: ./switch.sh [p|d]
set -euo pipefail

# Use sudo for privileged commands if not executed as root, mirroring the
# approach used in install.sh and update.sh.
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

# Ensure we operate on the repository. When executed via curl pipe, $0 is
# "bash" and the script has no physical path. Default to /opt/flowUI (used by
# install.sh). If the repository doesn't exist there, clone it.
REPO_URL="https://github.com/meinzeug/flowUI.git"

if [ -z "${APP_DIR:-}" ]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd)"
  if [ -d "$SCRIPT_DIR/.git" ]; then
    APP_DIR="$SCRIPT_DIR"
  else
    APP_DIR="/opt/flowUI"
  fi
fi

if [ ! -d "$APP_DIR/.git" ]; then
  echo "Repository not found at $APP_DIR, cloning..."
  $SUDO git clone "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

MODE="${1:-}"
if [ -z "$MODE" ]; then
  read -rp "Run environment in (p)roduction or (d)evelopment? " MODE
fi
case "$MODE" in
  p|P|prod|production)
    $SUDO rm -f docker-compose.override.yml
    echo "Switched to production mode.";;
  d|D|dev|development)
    $SUDO ln -sf docker-compose.dev.yml docker-compose.override.yml
    echo "Switched to development mode.";;
  *)
    echo "Usage: $0 [p|d]" >&2
    exit 1;;
esac

ENV_FILE="$APP_DIR/.env"
if [ -f "$ENV_FILE" ]; then
  FRONTEND_PORT="${FRONTEND_PORT:-$(grep -oP '^FRONTEND_PORT=\K.*' "$ENV_FILE" 2>/dev/null || echo 8080)}"
  BACKEND_PORT="${BACKEND_PORT:-$(grep -oP '^BACKEND_PORT=\K.*' "$ENV_FILE" 2>/dev/null || echo 3008)}"
else
  FRONTEND_PORT="${FRONTEND_PORT:-8080}"
  BACKEND_PORT="${BACKEND_PORT:-3008}"
fi

if command -v lsof >/dev/null 2>&1 && $SUDO lsof -iTCP -sTCP:LISTEN -P | grep -q ":$FRONTEND_PORT"; then
  echo "Port $FRONTEND_PORT is already in use. Stop the process or change FRONTEND_PORT in $ENV_FILE." >&2
  exit 1
fi

$SUDO docker compose down
FRONTEND_PORT="$FRONTEND_PORT" BACKEND_PORT="$BACKEND_PORT" $SUDO docker compose up -d

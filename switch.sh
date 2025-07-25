#!/bin/bash
# Toggle between production and development Docker Compose setups.
# Usage: ./switch.sh [p|d]
set -e

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
  git clone "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

MODE="$1"
if [ -z "$MODE" ]; then
  read -rp "Run environment in (p)roduction or (d)evelopment? " MODE
fi
case "$MODE" in
  p|P|prod|production)
    rm -f docker-compose.override.yml
    echo "Switched to production mode.";;
  d|D|dev|development)
    ln -sf docker-compose.dev.yml docker-compose.override.yml
    echo "Switched to development mode.";;
  *)
    echo "Usage: $0 [p|d]" >&2
    exit 1;;
esac

docker compose down
FRONTEND_PORT=${FRONTEND_PORT:-8080} BACKEND_PORT=${BACKEND_PORT:-3008} docker compose up -d

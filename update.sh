#!/bin/bash
set -euo pipefail

APP_DIR="/opt/flowUI"
REPO_URL="https://github.com/meinzeug/flowUI.git"
LOGFILE="$HOME/flowui-update.log"
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

if [ ! -d "$APP_DIR/.git" ]; then
  echo "\n### Cloning repository..."
  $SUDO git clone "$REPO_URL" "$APP_DIR"
else
  echo "\n### Pulling latest changes..."
  $SUDO git -C "$APP_DIR" pull
fi

cd "$APP_DIR"

echo "\n### Rebuilding containers..."
$SUDO docker compose build --no-cache

echo "\n### Restarting stack..."
$SUDO docker compose up -d

echo "\n### Update complete"

#!/bin/bash
# Toggle between production and development Docker Compose setups.
# Usage: ./switch.sh [p|d]
set -e
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

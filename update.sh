#!/bin/bash
set -e

echo "Pulling latest changes..."
git pull

echo "Rebuilding containers..."
docker-compose build --no-cache

echo "Restarting stack..."
docker-compose up -d

echo "Update complete"

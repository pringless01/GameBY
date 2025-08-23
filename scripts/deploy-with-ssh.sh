#!/bin/bash

# GameBY Deployment Script with SSH Agent Support
# Version: 2.0 - SSH Agent integrated

LOG_FILE="/var/log/sermaye-arena-deploy.log"
PROJECT_DIR="/srv/gameby/GameBY"

log() {
    echo "$(date): $1" | tee -a $LOG_FILE
}

log "Starting Sermaye Arena deployment (eski: GameBY)..."

# Navigate to project directory
cd $PROJECT_DIR

# Start SSH agent and add key (for SSH git operations)
log "Setting up SSH agent..."
eval $(ssh-agent -s) > /dev/null 2>&1
ssh-add ~/.ssh/id_ed25519 > /dev/null 2>&1

# Pull latest changes from GitHub
log "Pulling latest changes from GitHub..."
git pull origin main

# Stop containers
log "Stopping containers..."
docker compose down

# Start containers
log "Starting containers..."
docker compose up -d

# Wait for containers to be ready
log "Waiting for health checks..."
sleep 15

# Check container status
log "Checking container status..."
docker compose ps

# Kill SSH agent (cleanup)
ssh-agent -k > /dev/null 2>&1

log "Deployment completed!"

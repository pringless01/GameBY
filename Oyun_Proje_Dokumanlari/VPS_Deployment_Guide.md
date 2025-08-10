# 🚀 VPS Production Deployment Guide - 2D Online Ticaret Oyunu

## 📋 Deployment Özeti

**Platform:** Ubuntu 22.04 LTS VPS  
**Stack:** Node.js + SQLite + Docker + Nginx  
**Domain:** Opsiyonel (IP ile de çalışır)  
**Deployment Time:** 15-30 dakika  

---

## 🛠️ VPS Gereksinimler

### **Minimum Specs:**
- **RAM:** 1GB (2GB önerilen)
- **CPU:** 1 vCore (2 vCore önerilen)
- **Storage:** 20GB SSD
- **Bandwidth:** 1TB/ay
- **OS:** Ubuntu 22.04 LTS

### **Recommended VPS Providers:**
- **DigitalOcean:** $6/ay (1GB RAM, 25GB SSD)
- **Linode:** $5/ay (1GB RAM, 25GB SSD)
- **Vultr:** $5/ay (1GB RAM, 25GB SSD)
- **Hetzner:** €4.51/ay (4GB RAM, 40GB SSD) ⭐ En iyi değer

---

## 🔧 Initial Server Setup

### **1. SSH Bağlantısı**
```bash
# VPS'e bağlan
ssh root@YOUR_VPS_IP

# Yeni user oluştur (güvenlik)
adduser deployer
usermod -aG sudo deployer
su - deployer
```

### **2. System Update**
```bash
# System güncelle
sudo apt update && sudo apt upgrade -y

# Essential packages
sudo apt install -y curl wget git unzip software-properties-common
```

### **3. Node.js Installation**
```bash
# NodeSource repository ekle
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Node.js yükle
sudo apt install -y nodejs

# Versiyonları kontrol et
node --version  # v18.x.x
npm --version   # 9.x.x
```

### **4. Docker Installation**
```bash
# Docker repository ekle
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker yükle
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Docker permission
sudo usermod -aG docker deployer
newgrp docker

# Test docker
docker --version
docker compose version
```

---

## 📦 Project Deployment

### **1. Repository Clone**
```bash
# Project directory oluştur
mkdir -p /home/deployer/apps
cd /home/deployer/apps

# Git repository clone (örnek)
git clone https://github.com/your-username/ticaret-oyunu.git
cd ticaret-oyunu

# Dependencies yükle
npm install --production
```

### **2. Environment Configuration**
```bash
# .env dosyası oluştur
cat > .env << EOF
NODE_ENV=production
PORT=3000
JWT_SECRET=$(openssl rand -base64 32)
ALLOWED_ORIGINS=http://YOUR_VPS_IP:3000
DATABASE_PATH=./data/game.db
LOG_LEVEL=info
EOF

# Data directory oluştur
mkdir -p data
chmod 755 data
```

### **3. Docker Compose Setup**
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    container_name: ticaret-oyunu
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl:ro
    depends_on:
      - app
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### **4. Nginx Configuration**
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=chat:10m rate=200r/m;

    server {
        listen 80;
        server_name YOUR_VPS_IP;  # veya domain

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;

        # Static files
        location /static {
            alias /app/public;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

        # API endpoints
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Socket.io
        location /socket.io/ {
            limit_req zone=chat burst=50 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Main app
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### **5. Dockerfile**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# App source
COPY . .

# Create data directory
RUN mkdir -p data logs && chown -R node:node data logs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

USER node

EXPOSE 3000

CMD ["npm", "start"]
```

---

## 🚀 Deployment Execution

### **1. Build ve Start**
```bash
# Docker images build
docker compose build

# Containers başlat
docker compose up -d

# Logs kontrol
docker compose logs -f app
```

### **2. Database Migration**
```bash
# Database initialize
docker compose exec app npm run migrate

# Test data (opsiyonel)
docker compose exec app npm run seed
```

### **3. Health Check**
```bash
# Service status
docker compose ps

# Health endpoint test
curl http://YOUR_VPS_IP/health

# Chat test
curl -X POST http://YOUR_VPS_IP/api/chat/test \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

---

## 🔐 SSL Certificate (Domain İle)

### **Let's Encrypt SSL**
```bash
# Certbot yükle
sudo apt install certbot python3-certbot-nginx

# SSL certificate al
sudo certbot --nginx -d your-domain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

### **Nginx SSL Configuration**
```nginx
# SSL server block
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL optimization
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000" always;

    # Rest of configuration same as HTTP...
}

# HTTP redirect
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 📊 Monitoring & Logging

### **1. Log Management**
```bash
# Log files
mkdir -p /home/deployer/apps/ticaret-oyunu/logs

# Logrotate configuration
sudo tee /etc/logrotate.d/ticaret-oyunu << EOF
/home/deployer/apps/ticaret-oyunu/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF
```

### **2. System Monitoring**
```bash
# htop install
sudo apt install htop

# Disk usage monitoring
df -h
du -sh /home/deployer/apps/ticaret-oyunu/

# Memory usage
free -h

# Docker stats
docker stats
```

### **3. Application Monitoring**
```bash
# Health check script
cat > /home/deployer/health_check.sh << 'EOF'
#!/bin/bash

HEALTH_URL="http://localhost/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "$(date): App is healthy"
else
    echo "$(date): App is DOWN - HTTP $RESPONSE"
    # Restart containers
    cd /home/deployer/apps/ticaret-oyunu
    docker compose restart
fi
EOF

chmod +x /home/deployer/health_check.sh

# Crontab ekle (her 5 dakikada)
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/deployer/health_check.sh >> /home/deployer/health.log 2>&1") | crontab -
```

---

## 💾 Backup & Migration

### **1. Backup Script**
```bash
# backup.sh
cat > /home/deployer/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/home/deployer/backups"
APP_DIR="/home/deployer/apps/ticaret-oyunu"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "Starting backup at $(date)"

# Database backup
cp $APP_DIR/data/game.db $BACKUP_DIR/game_db_$DATE.db

# Full app backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .

# Keep only last 7 backups
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /home/deployer/backup.sh

# Daily backup crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /home/deployer/backup.sh >> /home/deployer/backup.log 2>&1") | crontab -
```

### **2. Quick Deploy Script**
```bash
# quick-deploy.sh
cat > /home/deployer/quick-deploy.sh << 'EOF'
#!/bin/bash

APP_DIR="/home/deployer/apps/ticaret-oyunu"

echo "🚀 Starting deployment..."

cd $APP_DIR

# Backup current state
./backup.sh

# Pull latest code
git pull origin main

# Update dependencies
npm install --production

# Rebuild containers
docker compose down
docker compose build
docker compose up -d

# Wait for health check
sleep 10

# Verify deployment
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health)

if [ $HEALTH -eq 200 ]; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed! Rolling back..."
    # Rollback logic here
fi
EOF

chmod +x /home/deployer/quick-deploy.sh
```

### **3. Migration Between VPS**
```bash
# migrate.sh
cat > /home/deployer/migrate.sh << 'EOF'
#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./migrate.sh backup_file.tar.gz"
    exit 1
fi

BACKUP_FILE=$1
APP_DIR="/home/deployer/apps/ticaret-oyunu"

echo "🔄 Starting migration from backup: $BACKUP_FILE"

# Create app directory
mkdir -p $APP_DIR
cd $APP_DIR

# Extract backup
tar -xzf $BACKUP_FILE

# Start services
docker compose up -d

echo "✅ Migration completed!"
EOF

chmod +x /home/deployer/migrate.sh
```

---

## 🔧 Troubleshooting

### **Common Issues**

#### **1. Port Already in Use**
```bash
# Port kullanımını kontrol et
sudo netstat -tulpn | grep :3000
sudo lsof -i :3000

# Process kill
sudo kill -9 PID
```

#### **2. Docker Permission Denied**
```bash
# Docker group ekle
sudo usermod -aG docker $USER
newgrp docker
```

#### **3. Database Lock Error**
```bash
# SQLite database unlock
cd /home/deployer/apps/ticaret-oyunu/data
sqlite3 game.db "PRAGMA journal_mode=WAL;"
```

#### **4. Memory Issues**
```bash
# Memory cleanup
docker system prune -a

# Swap enable (1GB)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 📋 Production Checklist

### **Pre-Deploy:**
- [ ] VPS specs minimum requirements
- [ ] SSH key authentication setup
- [ ] Domain DNS configured (opsiyonel)
- [ ] Environment variables set
- [ ] SSL certificate ready

### **Post-Deploy:**
- [ ] Health endpoint working
- [ ] Chat system functional
- [ ] Database writable
- [ ] Logs working
- [ ] Backup script scheduled
- [ ] Monitoring active

### **Security:**
- [ ] Firewall configured (ufw)
- [ ] SSH password login disabled
- [ ] Nginx rate limiting active
- [ ] SSL certificate valid
- [ ] Regular security updates scheduled

---

## 🎯 Performance Optimization

### **1. Nginx Tuning**
```nginx
# nginx.conf optimizations
worker_processes auto;
worker_connections 1024;

# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript;

# File caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### **2. Node.js Tuning**
```javascript
// server.js optimizations
process.env.UV_THREADPOOL_SIZE = 16;

// Cluster mode için PM2
npm install -g pm2
pm2 start server.js -i max --name "ticaret-oyunu"
```

---

## 💰 Cost Optimization

### **VPS Sizing Guide:**
- **0-50 users:** 1GB RAM, 1 vCore ($5-6/ay)
- **50-200 users:** 2GB RAM, 2 vCore ($10-12/ay)
- **200-500 users:** 4GB RAM, 4 vCore ($20-24/ay)
- **500+ users:** Load balancer + multiple servers

### **Backup Strategy:**
- **Local backups:** 7 gün (ücretsiz)
- **Cloud backup:** Weekly S3/DO Spaces ($1-2/ay)
- **Monitoring:** UptimeRobot ücretsiz plan

**Total Monthly Cost:** $5-10 (küçük oyuncu sayısı için)

---

Bu deployment guide ile 15-30 dakikada production-ready environment kurabilirsin! 🚀

**Hazırlayan:** Musa & GitHub Copilot  
**Tarih:** 5 Ağustos 2025  
**Versiyon:** 1.0 - Complete VPS Deployment Guide

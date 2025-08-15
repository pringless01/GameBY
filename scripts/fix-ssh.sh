#!/bin/bash

# SSH Agent ve Key Kurulumu Scripti
echo "=== SSH Agent ve Key Kurulum Başlatılıyor ==="

# 1. SSH agent'ı başlat
echo "1. SSH Agent başlatılıyor..."
eval $(ssh-agent -s)
echo "SSH Agent PID: $SSH_AGENT_PID"

# 2. SSH key'i ekle
echo "2. SSH Key ekleniyor..."
ssh-add ~/.ssh/id_ed25519

# 3. SSH agent'ı otomatik başlatmak için bashrc'ye ekle
echo "3. SSH Agent otomatik başlatma ayarlanıyor..."
if ! grep -q "ssh-agent -s" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# SSH Agent otomatik başlatma" >> ~/.bashrc
    echo "if [ -z \"\$SSH_AUTH_SOCK\" ]; then" >> ~/.bashrc
    echo "    eval \$(ssh-agent -s)" >> ~/.bashrc
    echo "    ssh-add ~/.ssh/id_ed25519 2>/dev/null" >> ~/.bashrc
    echo "fi" >> ~/.bashrc
    echo "SSH Agent otomatik başlatma ~/.bashrc'ye eklendi"
else
    echo "SSH Agent otomatik başlatma zaten mevcut"
fi

# 4. GitHub bağlantısını test et
echo "4. GitHub SSH bağlantısı test ediliyor..."
ssh -T git@github.com

# 5. Git pull test et
echo "5. Git pull test ediliyor..."
cd /srv/gameby/GameBY
git pull origin main

echo "=== SSH Kurulum Tamamlandı ==="

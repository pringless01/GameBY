# SSH Kurulum Komutları

## Yöntem 1: SSH Agent'ı manuel başlatma
```bash
# Sunucuda SSH agent başlat
eval $(ssh-agent -s)
ssh-add ~/.ssh/id_ed25519

# Test et
ssh -T git@github.com
```

## Yöntem 2: SSH Agent'ı otomatik başlatma
```bash
# ~/.bashrc dosyasına ekle
echo '
# SSH Agent otomatik başlatma
if [ -z "$SSH_AUTH_SOCK" ]; then
    eval $(ssh-agent -s)
    ssh-add ~/.ssh/id_ed25519 2>/dev/null
fi
' >> ~/.bashrc

# Yeni session'da aktif olması için
source ~/.bashrc
```

## Yöntem 3: Deploy script'i SSH için güncelle
```bash
# Deploy script'e SSH agent başlatma ekle
sudo nano /opt/gameby/deploy.sh

# Bu satırları git pull'dan önce ekle:
eval $(ssh-agent -s)
ssh-add ~/.ssh/id_ed25519 2>/dev/null
```

## Test Komutları
```bash
# SSH bağlantısını test et
ssh -T git@github.com

# Deploy script'i test et  
sudo /opt/gameby/deploy.sh

# Git pull'u test et
cd /srv/gameby/GameBY
git pull origin main
```

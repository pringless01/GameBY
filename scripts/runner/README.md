# Self-hosted Runner Kurulumu (GameBY)

Bu talimatla sunucunuza GitHub Actions self-hosted runner kurulur ve depodan otomatik deploy yapılır.

## 1) GitHub’dan Runner Token al
- Repo → Settings → Actions → Runners → New self-hosted runner
- Linux x64 seçin ve “Registration token”’ı kopyalayın.

## 2) Sunucuda kurulumu çalıştırın
```bash
# Gerekli paketler
sudo apt-get update && sudo apt-get install -y curl tar

# Script’i çağırın (token’i değiştirin)
export RUNNER_TOKEN="PASTE_TOKEN_HERE"
bash scripts/runner/install-runner.sh
```

Notlar:
- Varsayılan dizin: ~/actions-runner
- Etiketler: self-hosted, prod, gameby
- Servis olarak kurulur ve başlatılır (svc.sh)

## 3) Workflow’u kullanın
- .github/workflows/deploy-selfhosted.yml zaten repo’da.
- Runner “self-hosted” etiketiyle görünür hale gelince push’larda devreye girer.

## 4) Güncelleme/Servis yönetimi
```bash
cd ~/actions-runner
sudo ./svc.sh status
sudo ./svc.sh restart
sudo ./svc.sh stop
sudo ./svc.sh start
# Onarım (servis ayakta değilse)
bash scripts/runner/service-repair.sh
```

## 5) Güvenlik
- Runner, repo içeriğine erişir ve docker komutları çalıştırır. Sadece güvenilir sunucularda kullanın.
- Token tek seferliktir; sızarsa iptal edip yenisini oluşturun.

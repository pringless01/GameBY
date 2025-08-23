# Cloudflare Tunnel (cloudflared)

Bu dizin kalıcı Cloudflare Tunnel yapılandırması içindir.

## Gerekli Dosyalar
- `961f2bba-1f4b-43f4-af3c-a3dbbced3f7e.json`: Cloudflare panelinden indirdiğiniz tunnel credentials dosyası.

## config.yml Örneği
```yaml
tunnel: 961f2bba-1f4b-43f4-af3c-a3dbbced3f7e
credentials-file: /etc/cloudflared/961f2bba-1f4b-43f4-af3c-a3dbbced3f7e.json
metrics: 0.0.0.0: Metrics portu devre dışı bırakmak için yorum satırına alabilirsiniz
warp-routing:
  enabled: false
ingress:
  - hostname: tcrtsmlatronline.app
    service: http://nginx:80
  - hostname: www.tcrtsmlatronline.app
    service: http://nginx:80
  - service: http_status:404
```

Gerçek `config.yml` dosyası bu örneğe göre oluşturulmalıdır.

## Kullanım
1. Cloudflare panelinden credentials JSON indirin ve bu dizine koyun.
2. `config.yml` dosyasını oluşturun.
3. `docker compose up -d cloudflared` (veya tüm stack) çalıştırın.
4. DNS kayıtlarında `tcrtsmlatronline.app` ve `www` CNAME olarak tünelin otomatik oluşturduğu hedefe ayarlı olmalı (Cloudflare portal bunu yönetir). Eski A kayıtlarını kaldırın.

## Logları Görüntüleme
```bash
docker compose logs -f cloudflared
```

## Yeniden Başlatma
```bash
docker compose restart cloudflared
```

## Credentials Rotate
Yeni JSON indirilir, eski silinir, container restart.

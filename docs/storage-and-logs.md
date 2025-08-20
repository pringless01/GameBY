# Veri Depolama ve Log Mimarisinin Özeti

Bu doküman, GameBY backend’inin veriyi nerede tuttuğunu ve logların nasıl kalıcı hale geldiğini özetler.

## Veritabanı ve Kalıcılık
- Motor: SQLite
- Yol: `DB_PATH` env değişkeni (varsayılan `./server/data/game.db`). Docker ortamında compose ile `DB_PATH=/data/game.db` ayarlı.
- Kalıcılık: `docker-compose.yml` içinde `api` servisine `api-data` isimli volume mount edilir. DB dosyası konteyner içinde `/data/game.db` olduğundan host’ta volume ile kalıcıdır.
- Migrasyonlar: Uygulama başlangıcında (`MIGRATIONS_AUTO_APPLY=1`) `server/migrations/*.sql` sıralı uygulanır. Idempotent çalışır.

### Ana Tablolar
- `users`: Oyuncu kayıtları ve temel kaynak alanları.
  - Kolonlar: `username`, `password_hash`, `trust_score`, `reputation`, `roles`, `money`, `wood`, `grain`, `business`, `created_at`.
- `audit_log`: Güvenlik/işlem denetim kayıtları.
- `chat_messages`, `reputation_events`, `mentorships`, `transactions`: Oyun/komünite verileri.
- `marketplace_listings`: Pazar yeri ilanları (satıcı, item, price).
- `user_login_events`: Giriş olayları (IP, UA, fingerprint, ts) — fraud analizinde kullanılır.

## Envanter/Nakit (Inventory)
- Kullanıcı varlıkları `users` tablosundaki kolonlardadır: `money`, `wood`, `grain`, `business`.
- İşlemler:
  - Marketplace satın alma/satma `users.money` üzerinde işlem yapar, atomik olarak `BEGIN IMMEDIATE` ile korunur.
  - Yeni kullanıcı oluşturulurken başlangıç kaynakları atanır (`userService.createUser`).

## Audit Log Saklama/Temizlik
- Sınır: `AUDIT_MAX` (compose’ta 20000). Uygulama 10 dakikada bir, `audit_log` kaydını en eski N kaydı silerek bu üst sınıra trim eder.
- İsteğe bağlı script: `server/scripts/trim-audit.js` (ENV: `AUDIT_KEEP`).

## Loglama (Uygulama ve Nginx)
- Docker logging driver: `json-file` + rotasyon (max-size 10m, max-file 3) hem `api` hem `nginx` için.
- Erişim/uygulama logları docker üzerinden alınır: `docker compose logs`.
- Nginx konfig: `nginx.conf` reverse proxy; rate-limit; güvenlik başlıkları.

## Yedekleme
- Script: `scripts/backup.sh`
  - DB dosyasını konteyner içinden kopyalar (`/data/game.db`), ilgili konfig dosyaları ve son 200 satır docker loglarını ekler.
  - Çıktı: `/srv/gameby/backups/gameby-backup-<timestamp>.tar.gz` ve son 14 yedeği tutar.

## Kurtarma ve Taşıma
1. En güncel `.tar.gz` arşivini açın.
2. DB dosyasını yeni sunucuda volume içine yerleştirin (ör. `docker cp game.db <api-container-id>:/data/game.db`).
3. `.env`, `docker-compose.yml`, `nginx.conf` dosyalarını yeni ortama koyun.
4. Servisleri başlatın; migrations otomatik uygulanacaktır.

## Konfig Referansı
- `DB_PATH`: SQLite dosya yolu (compose: `/data/game.db`).
- `MIGRATIONS_AUTO_APPLY`: 1 ise başlangıçta migration çalışır.
- `AUDIT_MAX`: `audit_log` için maks. kayıt sayısı.

Not: Daha ileri gereksinimler için PostgreSQL/Redis’e geçiş yolu hazır (env ve cache backend seçenekleri mevcut).

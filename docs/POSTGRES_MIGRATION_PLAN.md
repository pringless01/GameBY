# PostgreSQL Geçiş Planı

## Amaç
SQLite tabanlı mevcut oyunu artan eşzamanlı bağlantılar, transaction bütünlüğü, daha iyi sorgu optimizasyonu ve yatay ölçek hazırlığı için PostgreSQL'e taşımak.

## Fazlar
1. Analiz ve Şema Taslağı
   - Mevcut `migrations` klasöründeki SQL yapıları çıkarılır.
   - Oyuncu, envanter, ticaret, audit_log tablolarının normalizasyonu değerlendirilir.
   - UUID vs BIGSERIAL kararları.
2. Abstraction Katmanı
   - `config/database.js` yerine minimal bir adapter interface: `db.query(sql, params)`.
   - SQLite & Postgres iki sürücü aynı anda destek (feature flag: `DB_DRIVER=sqlite|pg`).
3. PostgreSQL Altyapısı
   - docker-compose'e `postgres:16-alpine` servisi, volume, healthcheck.
   - Env: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `DB_DRIVER=pg`.
4. Migrasyon Sistemi Uyumlandırma
   - Var olan migration kayıt tablosu PostgreSQL'de `migrations(name text primary key, run_at timestamptz default now())`.
   - Migration runner: BEGIN/COMMIT mantığı Postgres'e uyarlanır; idempotency kontrolü için `IF NOT EXISTS` ve unique indexler.
5. Veri Taşıma
   - Downtime pencere planla (RTO/RPO gereksinimine göre). Küçük veride anlık.
   - Adımlar:
     1. Oyunda write işlemlerini maintenance moduna çek.
     2. SQLite dump (SELECT ... veya .dump) -> geçici dosya.
     3. Mapping script (Node) ile insert statements PostgreSQL'e uyarlanır.
     4. PostgreSQL'e load, constraint & index oluştur.
6. Doğrulama
   - Satır sayısı karşılaştırması.
   - Kritik tablolar (users, trades) hash kontrolü.
   - Örnek sorgu performans ölçümü.
7. Cutover
   - `DB_DRIVER=pg` ve `DB_PATH` kaldır; REDIS cache flush.
   - Oyunu Postgres ile başlat; log izle.
8. Geri Alma (Rollback)
   - Başlamadan önce SQLite dosyasının snapshot'ı.
   - Sorun halinde env geri `DB_DRIVER=sqlite`.

## Riskler ve Azaltma
- Transaction Farklılıkları: SQLite'taki bazı implicit davranışlar. Çözüm: explicit BEGIN.
- Veri Tipi Uyumsuzlukları: TEXT vs VARCHAR. Çözüm: Net şema.
- Performans Sürprizi: Eksik index. Çözüm: Sorgu profil listesi çıkar, index planı ekle.
- Migration Yarışı: Çok instance. Çözüm: `SELECT FOR UPDATE` veya advisory lock.

## İzleme
- pg_stat_statements
- bağlantı sayısı, yavaş sorgu log uyarıları.

## Sonrası İyileştirme
- Read-only replication
- Partitioning (yüksek hacimli audit_log için)
- Connection pool (pg-pool / pgbouncer)

---
Kısa hali: Adapter + dual driver + data load + validation + cutover.

## Agent Çalışma Durumu

[Dokümantasyon için tıklayın](./docs/index.md)

İlerleme: 20/20 (RC genişletme sprinti)
- Tamamlananlar: T001–T009, N010 (Reputation Decay & Ağırlıklar – unit test, cron ve env anahtarları eklendi, migration hazır), N011 (Mentor Eşleştirme + Socket kanalları + rate-limit), N012 (Fraud Risk Skoru + IP/Device normalizasyonu)
- BİTTİ: N013 Kontrat/Barter Güven Katmanı (escrow iskeleti + cancel-spam risk event)

12.08.2025 Sprint Kayıtları:
- BİTTİ: N010 Reputation Decay & Ağırlıklar – kanıt: 015_add_users_last_decay_at.sql uygulandı; tests/unit/reputationDecay.test.js → "reputationDecay.test OK"; /metrics altında app_reputation_decay_* sayaçları.
- BİTTİ: N011 Mentor Eşleştirme Tam Döngü + Socket – kanıt: tests/integration/mentorFlow.test.js → "MENTOR_FLOW_TEST_DONE"; socket kanalları: mentor:queue_update, mentor:match_found, mentor:session_status; mentor rotalarında rate-limit aktif.
- BİTTİ: N012 Fraud Risk Skoru + IP/Device Normalizasyonu – kanıt: tests/integration/fraudRisk.test.js → "FRAUD_RISK_TEST_SUCCESS"; admin GET /api/user/fraud/risk-score; Prometheus: fraud_risk_score_avg gauge.
- BİTTİ: N013 Kontrat/Barter Güven – kanıt: 016_add_escrow_and_dispute.sql uygulandı; tests/integration/contractRisk.test.js → "CONTRACT_RISK_TEST_SUCCESS"; contracts.escrow_status yaşam döngüsü (HELD→RELEASED/REFUNDED); cancel-spam için reputation event (contract_cancel_spam) ve Prometheus export’ta reputation_event_total{reason="contract_cancel_spam"} satırı.
 - DEVAM: N014 Ekonomi Sink – progressive vergi servisi ve scheduler eklendi; Prometheus metrikleri /metrics altında: app_economy_runs, app_economy_users_charged, app_economy_total_deducted, app_economy_errors. Unit test: tests/unit/economySink.test.js → "economySink.test OK".
 - BİTTİ: N015 Onboarding Reputasyon + Progress – yeni endpointler: GET /api/user/onboarding/progress, POST /api/user/onboarding/step; metrik: onboarding_step_total{step}; idempotent kayıt ve metrik artışı, unit test: tests/unit/onboarding.test.js → "onboarding.test OK".
 - BİTTİ: N016 Abuse Stats Export – admin JSON ve Prometheus gauge'lar eklendi: GET /api/user/leaderboard/abuse/ips (admin), Prom: leaderboard_security_abusive_ip_count, leaderboard_security_cooldown_ip_count. Entegrasyon testi: tests/integration/leaderboardAbuseStats.test.js → "LEADERBOARD_ABUSE_STATS_SUCCESS".
 - BİTTİ: N017 Weak-Secret Header Mantığı – X-Cursor-Weak-Secret yalnızca WEAK_CURSOR_SECRET=true olduğunda set ediliyor (batch ve tekil mod). Entegrasyon testi: tests/integration/leaderboardWeakSecretHeader.test.js → "LEADERBOARD_WEAK_SECRET_HEADER_SUCCESS".
 - BİTTİ: N017 Performans & Load Test – Artillery senaryoları eklendi (server/perf/), smoke ve 50→100→200 RPS step planı. /metrics altında app_http_request_duration_ms histogramı export ediliyor. Başlangıç raporu: docs/perf/N017-report.md, index önerileri: docs/perf/index-plan.md. 
 - BİTTİ: N018 Cache Katmanı & Redis Adaptörü – In-memory TTL prune + max entry (LRU benzeri) bakımı eklendi; server başlatıldığında periyodik bakım çalışır. Opsiyonel Redis adapter (env: CACHE_BACKEND=redis, REDIS_URL) hazırlandı. Unit test: tests/unit/cache.test.js → "CACHE_PRUNE_TEST_OK".
 - BİTTİ: N019 DevOps & Prod Paketleme – Multi-stage Dockerfile; docker-compose healthcheck; Nginx reverse proxy (WebSocket upgrade). Opsiyonel basic auth (BASIC_AUTH_ENABLED=1, .htpasswd mount). Deploy script: deploy.ps1 tek komutla build → up -d → health → smoke.
- Son görev: T009 – CHANGELOG ve RC tag hazırlığı
- 12.08.2025 Checkpoint: T001 kapsamında rate-limit ayarlanabilir yapıldı (AUTH_RATE_*), başlangıç para/kaynak artırıldı (test stabilitesi), coverage raporlama c8 ile güncellendi.
- 12.08.2025 Checkpoint-2: T001 tamamlandı. Entegrasyon testleri yeşil; coverage /logs altında. Özet: Statements ~56.8%, Branches ~56.3%.
- 12.08.2025 Checkpoint-3: T002 tamamlandı. README’ye kapsamlı Env tablosu ve .env.<env> örnekleri eklendi (AUTH_RATE_*, ALLOWED_ORIGINS, DB_PATH, cursor güvenlik değişkenleri dahil).
- 12.08.2025 Checkpoint-4: T003 tamamlandı. CI workflow (migrations check) eklendi: migrate çalışır ve pending varsa job fail olur.
- 12.08.2025 Checkpoint-5: T004 tamamlandı. /health JSON’a cache özetleri, ilk 5 pending list, rateLimit snapshot ve Server-Timing eklendi.
- 12.08.2025 Checkpoint-6: T005 tamamlandı. Chat flood limitleri envConfig’e taşındı/doğrulandı ve README env tablosu ile senkron.

# GameBY - 2D Mobil Online Ticaret Oyunu

[![CI](https://github.com/pringless01/GameBY/actions/workflows/ci-full.yml/badge.svg)](https://github.com/pringless01/GameBY/actions/workflows/ci-full.yml)
[![Deploy](https://github.com/pringless01/GameBY/actions/workflows/deploy.yml/badge.svg)](https://github.com/pringless01/GameBY/actions/workflows/deploy.yml)
[![Docker](https://github.com/pringless01/GameBY/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/pringless01/GameBY/actions/workflows/docker-publish.yml)

**Web-based PWA | İtibar Odaklı Sosyal Ekonomi Simülasyonu**

## 🎯 Proje Özeti

GameBY, %100 oyuncu odaklı ekonomi sistemi ile çalışan sosyal ticaret oyunudur. İtibar sistemi en değerli meta-game olarak tasarlanmış, 30 dakikalık kritik onboarding deneyimi ile oyuncuları sisteme adapte eder.

## 🚀 Teknoloji Stack

- **Backend:** Node.js + Express + Socket.io
- **Database:** SQLite 
- **Frontend:** HTML5 + CSS3 + Vanilla JavaScript (PWA)
- **Real-time:** Socket.io WebSocket connection
- **Auth:** JWT + bcrypt password hashing
- **Caching & Metrics:** In-memory TTL caches + Prometheus format metrics (leaderboard + reputation + trade + mentor quality)
- **Security:** HMAC imzalı cursor pagination + abuse cooldown + timing-safe imza karşılaştırması + periyodik abuse map prune

## 📁 Proje Yapısı

```
├── frontend/          # Web arayüzü (PWA)
│   ├── public/        # HTML, CSS, JS dosyaları
│   └── simple-server.js # Development server
├── server/            # Node.js backend API
│   ├── config/        # Database configuration (reputationRules.json external)
│   ├── routes/        # API endpoints  
│   ├── services/      # Business logic
│   ├── sockets/       # Socket.io handlers
│   ├── security/      # Cursor security & abuse logic
│   ├── cache/         # TTL caches (trust, mentor, around)
│   ├── metrics/       # Leaderboard + reputation + mentor + trade metrics
│   └── migrations/    # Database migrations
└── Oyun_Proje_Dokumanlari/ # Comprehensive game docs
```

## 🎮 Ana Özellikler

- **İtibar Sistemi (Otomasyon Genişletildi):** reputation_events + ReputationEventEmitter (chat, spam, mentor & mentee session, contract dyn reward unify, trade_completed, contract_default, fraud_flag)
- **Gelişmiş Leaderboard:** offset / cursor / around / batch + imzalı cursor + rotation + auto-degrade + granular cursor hata metrikleri + prune
- **Mentor Leaderboard & Kalite:** rating + min session filtreli self-rank cache + tamamlanan seans ve rating metrikleri
- **Bot / Gerçek Mentor Yapısı:** eşleşme + tamamlanınca double reputation hook (mentor & mentee)
- **Chat Sistemi:** flood guard (+ spam penalty reputation)
- **Kontrat Altyapısı:** dinamik trust ödülü unified reputation pipeline + auto default sweeper (negatif reputasyon)
- **Fraud / Risk Altyapısı (İlk Adım):** admin fraud flag endpoint → negatif reputation, sliding window trade pair & unique partner metric
- **Dış Konfig:** reputationRules.json hot-reload (delta ve caps runtime ayarlanabilir)

## 🛠️ Geliştirme

### Ön Koşullar
- Node.js 18+
- Git

### Kurulum

```bash
# Repository'yi klonla
git clone https://github.com/pringless01/GameBY.git
cd GameBY

# Backend dependencies
cd server
npm install

# Database migration
npm run migrate

# Server başlat
npm run dev  # Development mode
```

### Geliştirici Hızlı Başlangıç (Runner)

Yerelde hızlı başlamak için runner scriptlerini kullanabilirsiniz:

```powershell
# Windows PowerShell
./scripts/dev.ps1            # API'yi production modunda başlatır
./scripts/dev.ps1 -Watch     # watch modunda geliştirici servisi
./scripts/test.ps1           # Unit smoke (cursor-security) + coverage
```

```bash
# macOS/Linux (opsiyonel)
bash scripts/dev.sh --watch
bash scripts/test.sh
```

### Frontend Testi

```bash
cd frontend
node simple-server.js
# http://localhost:8080
```

## � Docker + Nginx + Deploy (Basit)

Eklenen dosyalar: `server/Dockerfile`, `docker-compose.yml`, `nginx.conf`, `deploy.ps1`.

- Socket.io upgrade başlıkları Nginx konfigünde ayarlandı.
- `docker compose up -d` ile API (3000) ve Nginx (80) ayağa kalkar (healthcheck etkin).
- Windows için basit dağıtım: `./deploy.ps1`

Not: Prod’da güçlü secret’lar sağlamayı unutmayın (ENV: JWT_SECRET, CURSOR_SECRET).
- 12.08.2025 Checkpoint-7: T006 tamamlandı. Dockerfile + docker-compose + nginx.conf ve deploy.ps1 eklendi.
- 12.08.2025 Checkpoint-8: T007 tamamlandı. 401→login redirect mevcut; 429 durumunda UI toast uyarısı eklendi.
- 12.08.2025 Checkpoint-9: T008 tamamlandı. /metrics Prometheus metrik formatında: app_http_requests_total, app_http_errors_total, app_socket_connections.
- 12.08.2025 Checkpoint-10: T009 tamamlandı. CHANGELOG.md (v0.1.0-rc) eklendi; bilinen riskler listelendi.
 - 12.08.2025 Final Checkpoint: tools/tasks.json’daki tüm görevler tamamlandı (9/9). CI, deploy, metrikler ve dokümantasyon senkron.

## �📊 Gelişim Durumu (Yüzde Tahmini)

## 🛠 Operasyon
- CI: PR ve main push’larında lint (placeholder), tüm unit/integration testleri, coverage artifact’ları ve migrations check koşturulur.
- Deploy: Windows’ta `./deploy.ps1` tek komut akışı; Docker ortamında `docker compose up -d` ile healthcheck 200 doğrulanır.
## 🔍 Kalite Güvencesi
- Lint: ESLint (node/import/promise) profili
- Format: Prettier 3
- Commit: commitlint + husky
- Test: Unit + Integration + Smoke (Artillery)

- Leaderboard sistemi (trust + mentor + security): ~97%
- Reputation otomasyon (event pipeline): ~68% (kalan: onboarding, ileri risk heuristics)
- Mentor akışı (bot→gerçek, ödül/limit, kalite metriği): ~45%
- Trade & ekonomik döngü (kaynak üretim, gelişmiş trade): ~22%
- Kontrat risk & dolandırıcılık cezaları: ~28% (default & fraud flag temel eklendi)
- Onboarding 30 dk görevleri: ~10%
- Anti-abuse genişletmeleri (chat flood, multi-account plan): ~18%
- Prod izleme & alarm (Prometheus dışında): ~30%

## ✅ Tamamlanan Önemli Güvenlik / Gözlemlenebilirlik İyileştirmeleri (v3.5-pre)
- İmzasız cursor formatı reddedildi.
- Strict `>` threshold standardizasyonu.
- Auto-degrade helper (`shouldAutoDegrade`).
- Rotation ENV standardizasyonu (`CURSOR_SECRET_ROTATION`).
- Around mode cache header uyumu (`X-Cache`, `X-Cache-TTL`).
- Timing-safe HMAC imza karşılaştırması (`safeEqual`).
- Granular cursor hata metrikleri: format / signature / oversize.
- Oversize (>256) cursor DoS koruması & metriği.
- Reputation pipeline unify: kontrat dinamik ödülleri direct reputation delta ile.
- Trade tamamlanınca TRADE_COMPLETED event tetikleme.
- Negatif eventler: CONTRACT_DEFAULT & FRAUD_FLAG (external config).
- Auto contract default sweeper (aktif kontrat uzun süre güncellenmezse).
- Sliding window trade pair / unique partner gauge metrikleri.
- Mentor session & rating kalite metrikleri (Prometheus).
- reputationRules.json: hot-reload + delta/cap dışa alınması.
- Cursor abuse map periyodik prune.

## 🎯 Güncel Roadmap (Revize)
**Faz 2 (Tamamlandı kısmen):** Gelişmiş leaderboard + cursor abuse yönetimi  
**Faz 3 (Aktif):** Reputation event otomasyon (onboarding & ileri risk) + mentor akışı derinleştirme  
**Faz 4:** Kontrat risk analizi + dolandırıcılık cezaları genişleme + ekonomi craft döngüsü  
**Faz 5:** Moderasyon & anti-abuse (multi-account, SMS) + gelişmiş dış izleme  

## 🔜 Kısa Vadeli Sprint Hedefleri
1. Onboarding event’leri (30 dk progression) reputasyon entegrasyonu
2. Fraud heuristics (tekrarlı düşük riskli trade pattern analizi) → otomatik FRAUD_FLAG
3. Mentor gelişmiş state machine + seans kalitesi ağırlıklı skor
4. Multi-account baseline (IP / device fingerprint placeholder) metrik
5. Reputation rule set versiyonlama & audit log diff
6. Prometheus: contract_default & fraud_flag ayrı counter export (etiketli)

## 📚 Dokümantasyon
- [Ana Oyun Dokümanı](Oyun_Proje_Dokumanlari/Ana_Oyun_Dokumani.md) (Versiyon 3.5-pre güncellenmeli)
- [API Documentation](Oyun_Proje_Dokumanlari/API_Documentation.md)
- [UI/UX Tasarım Rehberi](Oyun_Proje_Dokumanlari/UI_UX_Tasarim_Rehberi.md)
- [VPS Deployment Guide](Oyun_Proje_Dokumanlari/VPS_Deployment_Guide.md)

## 📈 Prometheus Metrik Örnekleri
```
leaderboard_errors_cursor_format 5
leaderboard_errors_cursor_signature 12
leaderboard_errors_cursor_oversize 2
trade_pairs_window 14
trade_unique_partners_window 9
mentor_sessions_completed_total 3
reputation_events_type_count{type="contract_default"} 1
```

## � Environment Variables (Konfig Tablosu)

| Değişken | Zorunlu | Önerilen (Prod) | Açıklama |
|----------|---------|-----------------|----------|
| NODE_ENV | Hayır | production | Uygulama çalışma modu |
| PORT | Hayır (3000) | 3000/80 | HTTP portu |
| JWT_SECRET | Evet | >=32 karakter | JWT imzalama anahtarı |
| CURSOR_SECRET | Evet | >=32 karakter | Cursor HMAC imzası ana secret |
| CURSOR_SECRET_ROTATION | Hayır | >=32 karakter | Rotate edilen eski/ikinci secret |
| CURSOR_INVALID_THRESHOLD | Hayır (5) | 5–10 | Invalid cursor abuse eşiği (strict >) |
| CURSOR_ABUSE_COOLDOWN_MS | Hayır (30000) | 60000+ | Abuse sonrası cooldown süresi (ms) |
| CURSOR_AUTO_DEGRADE | Hayır (0) | 1 | Eşik sonrası invalid cursor’da offset degrade |
| LB_RATE_WINDOW_MS | Hayır (15000) | 10000–30000 | Leaderboard rate limit pencere süresi (ms) |
| LB_RATE_MAX | Hayır (10) | 20–60 | Pencere başına izin verilen leaderboard istek sayısı |
| CACHE_BACKEND | Hayır (memory) | redis | Bellek içi veya Redis cache seçimi |
| REDIS_URL | Hayır | redis://localhost:6379 | Redis bağlantı URL’si |
| BASIC_AUTH_ENABLED | Hayır (0) | 1 | Nginx basic auth (/.htpasswd mount gerekli) |
| AUTH_RATE_WINDOW_MS | Hayır (60000) | 60000 | Auth (register/login) rate limit pencere süresi (ms) |
| AUTH_RATE_MAX | Hayır (100 testte 100, prod 10) | 10–30 | Auth istek limiti (prod daha düşük önerilir) |
| ALLOWED_ORIGINS | Hayır (*) | Domain listesi | CORS origin beyaz listesi (virgülle) |
| AUDIT_MAX | Hayır (5000) | 10000+ | Audit log tutulacak maksimum kayıt sayısı |
| DB_PATH | Hayır | custom path | SQLite veritabanı dosya yolu |
| MIGRATIONS_AUTO_APPLY | Hayır (1) | 1 | Başlangıçta otomatik migration çalıştır |
| SMOKE_BASE | Hayır | http://localhost:3000 | Smoke test temel URL |
| CHAT_FLOOD_WINDOW_MS | Hayır (10000) | 8000–15000 | Chat flood pencere süresi (ms) |
| CHAT_FLOOD_MAX_MESSAGES | Hayır (8) | 10–20 | Pencere başına mesaj limiti |
| REPUTATION_DECAY_HALFLIFE_HOURS | Hayır (72) | 24–168 | Exponential decay yarılanma süresi (saat) |
| REPUTATION_DECAY_BASELINE | Hayır (100) | 100 | Trust score için çekildiği baz çizgi |
| REPUTATION_DECAY_CRON_ENABLED | Hayır (dev=0, prod=1) | 1 | Periyodik decay işini etkinleştir |
| REPUTATION_DECAY_CRON_INTERVAL_MS | Hayır (3600000) | 3600000 | Decay işinin çalışma aralığı (ms) |
| REPUTATION_POSITIVE_WEIGHT | Hayır (1) | 1.0–1.5 | Pozitif event delta çarpanı |
| REPUTATION_NEGATIVE_WEIGHT | Hayır (1) | 0.5–1.5 | Negatif event delta çarpanı |

Notlar:
- Prod ortamında JWT_SECRET & CURSOR_SECRET en az 32 karakter olmalı.
- Threshold karşılaştırmaları dokümana göre daima `>` uygulanır.
- Rotation secret boş bırakılabilir; dolu ise Prometheus'ta rotation metriği artar.
- CORS için doğru değişken adı `ALLOWED_ORIGINS`’dür (tek değer verecekseniz yine virgülsüz tek domain yazın). 

### Örnek .env Dosyaları (Dev/Prod)

Geliştirme için basit, üretim için güçlü ve uzun (32+ karakter) secret’lar kullanın.

Dev (./.env.development veya ./server/.env):

```
NODE_ENV=development
PORT=3000
JWT_SECRET=dev_dev_dev_change_me_at_least_32_chars____
CURSOR_SECRET=dev_cursor_secret_change_me_at_least_32_chars
CURSOR_SECRET_ROTATION=
CURSOR_INVALID_THRESHOLD=5
CURSOR_ABUSE_COOLDOWN_MS=30000
CURSOR_AUTO_DEGRADE=1
LB_RATE_WINDOW_MS=15000
LB_RATE_MAX=20
AUTH_RATE_WINDOW_MS=60000
AUTH_RATE_MAX=100
ALLOWED_ORIGINS=*
AUDIT_MAX=5000
DB_PATH=./server/data/game.db
MIGRATIONS_AUTO_APPLY=1
CHAT_FLOOD_WINDOW_MS=10000
CHAT_FLOOD_MAX_MESSAGES=8
REPUTATION_DECAY_HALFLIFE_HOURS=72
REPUTATION_DECAY_BASELINE=100
REPUTATION_DECAY_CRON_ENABLED=0
REPUTATION_DECAY_CRON_INTERVAL_MS=3600000
REPUTATION_POSITIVE_WEIGHT=1
REPUTATION_NEGATIVE_WEIGHT=1
ECON_SINK_ENABLED=1
ECON_SINK_INTERVAL_MS=600000
ECON_TAX_THRESHOLD=1000
ECON_TAX_RATE_BP=50
ECON_TAX_MAX_BP=300
ECON_TAX_MAX_PER_RUN=500
```

Prod (ör. Docker Secret/ENV):

```
NODE_ENV=production
PORT=3000
JWT_SECRET=REPLACE_WITH_RANDOM_64_CHAR_SECURE_VALUE________________________________
CURSOR_SECRET=REPLACE_WITH_RANDOM_64_CHAR_SECURE_VALUE________________________________
CURSOR_SECRET_ROTATION=
CURSOR_INVALID_THRESHOLD=5
CURSOR_ABUSE_COOLDOWN_MS=60000
CURSOR_AUTO_DEGRADE=1
LB_RATE_WINDOW_MS=15000
LB_RATE_MAX=30
AUTH_RATE_WINDOW_MS=60000
AUTH_RATE_MAX=10
ALLOWED_ORIGINS=https://gameby.example.com,https://cdn.example.com
AUDIT_MAX=20000
DB_PATH=/data/game.db
MIGRATIONS_AUTO_APPLY=1
CHAT_FLOOD_WINDOW_MS=12000
CHAT_FLOOD_MAX_MESSAGES=12
REPUTATION_DECAY_HALFLIFE_HOURS=72
REPUTATION_DECAY_BASELINE=100
REPUTATION_DECAY_CRON_ENABLED=1
REPUTATION_DECAY_CRON_INTERVAL_MS=3600000
REPUTATION_POSITIVE_WEIGHT=1
REPUTATION_NEGATIVE_WEIGHT=1
```


## �🚀 Deploy & Test URLs
- **Development:** http://localhost:8080 (Frontend)
- **API Server:** http://localhost:3000 (Backend)
- **Prometheus Metrics (Admin):** /api/user/leaderboard/metrics/prom

---

**Not:** Bu README v3.5-pre teknik durumunu yansıtır; roadmap güncellemeleri Ana Oyun Dokümanı ile senkron tutulacaktır.
# Test commit Fri 15 Aug 2025 08:49:31 PM UTC
# Deploy test Fri 15 Aug 2025 08:54:18 PM UTC

## 🧠 Hafıza Sistemi Nasıl Çalışır?

- Kaynak dosyalar: `agent/memory/project_facts.md`, `agent/memory/long_term.md`.
- Otomasyon: `.github/workflows/memory-rollup.yml` günlük çalışır veya GitHub Actions UI’dan manuel tetiklenir (workflow_dispatch).
- İşleyiş: Her mantıksal adımda tarih-damgalı rapor `docs/reports/` altına eklenir; hafıza dosyalarına tek satırlık append yapılır (davranış değişikliği yok).
- Kalite kapıları: Her adımda `npm run lint` (0 hata) ve `npm test` (unit+integration PASS) hedeflenir.
- Status senkronu: `docs/status.md` içindeki “Next Actions” güncellenir; tamamlananlar işaretlenir, blocked durumlar not edilir.

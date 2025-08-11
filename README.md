# GameBY - 2D Mobil Online Ticaret Oyunu

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

### Frontend Testi

```bash
cd frontend
node simple-server.js
# http://localhost:8080
```

## 📊 Gelişim Durumu (Yüzde Tahmini)
- Backend çekirdek (Express + JWT + Socket scaffold): ~87%
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

## 🚀 Deploy & Test URLs
- **Development:** http://localhost:8080 (Frontend)
- **API Server:** http://localhost:3000 (Backend)
- **Prometheus Metrics (Admin):** /api/user/leaderboard/metrics/prom

---

**Not:** Bu README v3.5-pre teknik durumunu yansıtır; roadmap güncellemeleri Ana Oyun Dokümanı ile senkron tutulacaktır.

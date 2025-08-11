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
- **Caching & Metrics:** In-memory TTL caches + Prometheus format metrics (leaderboard + reputation)
- **Security:** HMAC imzalı cursor pagination + abuse cooldown + timing-safe imza karşılaştırması

## 📁 Proje Yapısı

```
├── frontend/          # Web arayüzü (PWA)
│   ├── public/        # HTML, CSS, JS dosyaları
│   └── simple-server.js # Development server
├── server/            # Node.js backend API
│   ├── config/        # Database configuration
│   ├── routes/        # API endpoints  
│   ├── services/      # Business logic
│   ├── sockets/       # Socket.io handlers
│   ├── security/      # Cursor security & abuse logic
│   ├── cache/         # TTL caches (trust, mentor, around)
│   ├── metrics/       # Leaderboard + reputation metrics counters
│   └── migrations/    # Database migrations
└── Oyun_Proje_Dokumanlari/ # Comprehensive game docs
```

## 🎮 Ana Özellikler

- **İtibar Sistemi (Otomasyon Genişletildi):** reputation_events + ReputationEventEmitter (chat, spam, mentor session, contract dyn reward unify, mentee/mentor session events)
- **Gelişmiş Leaderboard:** offset / cursor / around / batch + imzalı cursor + rotation + auto-degrade + granular cursor hata metrikleri
- **Mentor Leaderboard:** rating + min session filtreli self-rank cache
- **Bot / Gerçek Mentor Yapısı (Kısmi):** eşleşme + tamamlama reputation hook
- **Chat Sistemi:** flood guard (+ spam penalty reputasyon)
- **Kontrat Altyapısı:** dinamik trust ödülü artık unified reputation pipeline (applyDirectReputationDelta)
- **Dolandırıcılık Koruması:** Cursor abuse cooldown & granular hata izleme (format/signature/oversize)

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
- Backend çekirdek (Express + JWT + Socket scaffold): ~85%
- Leaderboard sistemi (trust + mentor + security): ~96%
- Reputation otomasyon (event pipeline): ~55% (trade & bazı risk event’leri pending)
- Mentor akışı (bot→gerçek, ödül/limit): ~35%
- Trade & ekonomik döngü (kaynak üretim, basit trade): ~20%
- Kontrat risk & dolandırıcılık cezaları: ~15%
- Onboarding 30 dk görevleri: ~10%
- Anti-abuse genişletmeleri (chat flood, multi-account): ~12%
- Prod izleme & alarm (Prometheus dışında): ~30%

## ✅ Tamamlanan Önemli Güvenlik / Gözlemlenebilirlik İyileştirmeleri (v3.4+)
- İmzasız cursor formatı reddedildi.
- Strict `>` threshold standardizasyonu.
- Auto-degrade helper (`shouldAutoDegrade`).
- Rotation ENV standardizasyonu (`CURSOR_SECRET_ROTATION`).
- Around mode cache header uyumu (`X-Cache`, `X-Cache-TTL`).
- Timing-safe HMAC imza karşılaştırması (`safeEqual`).
- Granular cursor hata metrikleri: format / signature / oversize.
- Oversize (>256) cursor DoS koruması & metriği.
- Reputation pipeline unify: kontrat dinamik ödülleri direct reputation delta ile.

## 🎯 Güncel Roadmap (Revize)
**Faz 2 (Tamamlandı kısmen):** Gelişmiş leaderboard + cursor abuse yönetimi  
**Faz 3 (Aktif):** Reputation event otomasyon (trade + risk) + mentor akışı  
**Faz 4:** Kontrat risk analizi + fraud penalize + ekonomi craft döngüsü  
**Faz 5:** Moderasyon & anti-abuse (multi-account, SMS) + gelişmiş dış izleme  

## 🔜 Kısa Vadeli Sprint Hedefleri
1. Trade / barter tamamlama event’lerinin ReputationEventEmitter ile standardizasyonu (kısmen bitti)
2. Fraud / default risk event haritalaması (negatif reputation)
3. Mentor bot state machine ince ayar & seans kalite metriği
4. Onboarding görev ilerleme (persisted state + progress events)
5. Multi-account / device fingerprint araştırması (plan dokümanı)
6. Prometheus: reputation events per type + contract risk metrics label’ları

## 📚 Dokümantasyon
- [Ana Oyun Dokümanı](Oyun_Proje_Dokumanlari/Ana_Oyun_Dokumani.md) (Versiyon 3.4)
- [API Documentation](Oyun_Proje_Dokumanlari/API_Documentation.md)
- [UI/UX Tasarım Rehberi](Oyun_Proje_Dokumanlari/UI_UX_Tasarim_Rehberi.md)
- [VPS Deployment Guide](Oyun_Proje_Dokumanlari/VPS_Deployment_Guide.md)

## 📈 Prometheus Metrik Örnekleri
```
leaderboard_errors_cursor_format 5
leaderboard_errors_cursor_signature 12
leaderboard_errors_cursor_oversize 2
reputation_events_type_count{type="mentor_session_complete"} 3
```

## 🚀 Deploy & Test URLs
- **Development:** http://localhost:8080 (Frontend)
- **API Server:** http://localhost:3000 (Backend)
- **Prometheus Metrics (Admin):** /api/user/leaderboard/metrics/prom

---

**Not:** Bu README v3.4+ genişletilmiş teknik durumunu yansıtır; roadmap güncellemeleri Ana Oyun Dokümanı ile senkron tutulur.

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
│   └── migrations/    # Database migrations
└── Oyun_Proje_Dokumanlari/ # Comprehensive game docs
```

## 🎮 Ana Özellikler

- **İtibar Sistemi:** Güven puanı odaklı sosyal ekonomi
- **Bot Mentor:** İlk 15 dakika AI rehberlik
- **Real Mentor:** Gerçek oyuncu mentörlüğü
- **Chat Sistemi:** Oyunun kalbi - real-time iletişim
- **Dolandırıcılık Koruması:** Kontrat sistemi ile güvenli ticaret

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

## 📊 Development Status

- ✅ **Frontend:** Complete responsive interface with auth system
- ✅ **Authentication:** Username/password with JWT simulation
- ✅ **Navigation:** Cross-page routing with keyboard shortcuts
- ✅ **Chat Interface:** Real-time chat UI ready for Socket.io
- ✅ **Database Schema:** SQLite tables designed
- ⏳ **Backend API:** Express server with Socket.io implementation
- ⏳ **Real-time Features:** Socket.io server-side handlers

## 🎯 Roadmap

**Faz 1:** Backend API + Socket.io real-time chat  
**Faz 2:** Bot mentor system integration  
**Faz 3:** Trust score calculations  
**Faz 4:** Production deployment  

## 📚 Dokümantasyon

Detaylı oyun mekaniği ve teknik dokümantasyon:
- [Ana Oyun Dokümanı](Oyun_Proje_Dokumanlari/Ana_Oyun_Dokumani.md)
- [API Documentation](Oyun_Proje_Dokumanlari/API_Documentation.md)
- [UI/UX Tasarım Rehberi](Oyun_Proje_Dokumanlari/UI_UX_Tasarim_Rehberi.md)

## 🚀 Deploy & Test URLs

- **Development:** http://localhost:8080 (Frontend)
- **API Server:** http://localhost:3000 (Backend)
- **Production:** TBD

---

**Oyun Konsepti:** İtibar ve iletişim odaklı ticaret ekosistemi - Chat = oyunun kalbi

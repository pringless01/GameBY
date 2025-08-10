# GitHub Copilot Instructions

Bu proje **2D Mobil Online Ticaret Oyunu** - İtibar odaklı sosyal ekonomi simülasyonu. Web-based PWA olarak geliştirilmekte.

## 🎯 Proje Vizyonu

**Temel Konsept:** "İtibar ve İletişim Odaklı Ticaret Ekosistemi"
- %100 oyuncu odaklı ekonomi (NPC yok)
- İtibar sistemi (güven puanı en değerli meta-game)
- İki aşamalı mentor sistemi (bot + gerçek oyuncu)
- Dolandırıcılığa izin veren kontrat sistemi
- 30 dakikalık kritik onboarding deneyimi

## 🏗️ Current Architecture Status

**Technology Stack:**
- **Frontend:** HTML5 + CSS3 + Vanilla JavaScript ES6+ (Mobile-first PWA)
- **Server:** Node.js HTTP server (simple-server.js) ✅ RUNNING
- **Database:** SQLite (PLANNED - documented in Oyun_Proje_Dokumanlari/)
- **Real-time:** Socket.io client ready, server pending
- **Auth:** Username/password system ✅ IMPLEMENTED
- **Navigation:** Cross-page routing ✅ IMPLEMENTED

**Implementation Status:**
- ✅ Frontend: Complete responsive interface with auth system
- ✅ Login/Register: Tab-based system with real-time validation
- ✅ Navigation: Cross-page routing with keyboard shortcuts  
- ✅ Development Server: Node.js HTTP server on localhost:8080
- ⏳ Backend API: Express + Socket.io server (documented, ready for implementation)
- ⏳ Database: SQLite schema designed

## 📁 Current Project Structure

**Frontend (Production Ready):**
```
frontend/
├── simple-server.js     # 🚀 Node.js HTTP server (port 8080)
└── public/
    ├── login.html       # 🔐 Auth system with tab interface
    ├── index.html       # 🏠 Main dashboard 
    ├── chat.html        # 💬 Real-time chat interface
    ├── test.html        # 🧪 Navigation test page
    ├── css/
    │   ├── style.css    # 670+ lines: Design system, CSS variables
    │   ├── dashboard.css # 500+ lines: Dashboard animations
    │   ├── chat.css     # 400+ lines: Chat styling  
    │   ├── login.css    # Auth page styling with animations
    │   └── navigation.css # Cross-page navigation styling
    ├── js/
    │   ├── login.js     # AuthManager class with validation
    │   ├── dashboard.js # 550+ lines: Dashboard functionality
    │   ├── chat.js      # 600+ lines: ChatManager class
    │   ├── socket-client.js # 440+ lines: SocketClient
    │   ├── navigation.js # Page routing with transitions  
    │   └── utils.js     # 400+ lines: Utilities
    └── assets/          # PWA icons, manifest
```

**Documentation Archive:**
```
Oyun_Proje_Dokumanlari/
├── Ana_Oyun_Dokumani.md     # Master game design (REFERENCE for mechanics)
├── Flutter_Implementasyon_Rehberi.md # Node.js examples (despite name)
├── Firebase_Backend_Dokumani.md      # Database schemas adapted for SQLite
└── [8 other comprehensive docs]
```

## 🔧 Development Patterns

**Frontend ES6+ Classes Pattern:**
```javascript
// AuthManager pattern (login.js)
class AuthManager {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.currentTab = 'login';
    }
    
    async handleLogin(e) {
        e.preventDefault();
        this.showLoading('Giriş yapılıyor...');
        await this.simulateLogin(username, password);
        window.location.href = 'index.html'; // Navigation
    }
}

// Navigation pattern (navigation.js)  
class NavigationManager {
    setupNavigationHandlers() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && link.closest('.page-navigation')) {
                e.preventDefault();
                this.navigateToPage(link.href);
            }
        });
    }
}
```

**CSS Architecture:**
```css
/* Trust score color system */
:root {
    --trust-excellent: #4CAF50;  /* 180-200 */
    --trust-good: #8BC34A;       /* 160-179 */
    --trust-bad: #F44336;        /* 0-119 */
}

/* Mobile-first responsive */
.mobile-container { max-width: 428px; margin: 0 auto; }
@media (min-width: 768px) { /* Desktop adaptations */ }
```

## 🚀 Development Workflow

**Local Development:**
```bash
# Start development server
cd frontend
node simple-server.js  # Runs on http://localhost:8080

# Key URLs:
# http://localhost:8080/login.html  - Auth system
# http://localhost:8080/index.html - Dashboard  
# http://localhost:8080/chat.html  - Chat interface
# http://localhost:8080/test.html  - Navigation test
```

**Navigation System:**
- **Fixed header** on all pages except login
- **Keyboard shortcuts:** Alt+1 (Dashboard), Alt+2 (Chat), Alt+3 (Test)
- **Smooth transitions** between pages with loading animations
- **Active page indicators** in navigation

**Authentication Flow:**
- **Tab-based interface:** Login ↔ Register seamless switching
- **Real-time validation:** Username availability, password strength
- **Visual feedback:** Success animations, error states
- **Local storage:** JWT token simulation for session management

## 💡 Critical Implementation Notes

**Socket.io Integration (Ready for Backend):**
```javascript
// Client-side patterns already implemented
socket.emit('send_message', {userId, userName, message});
socket.emit('join_chat', userId);

// Expected server events
io.emit('new_message', messageWithId);
io.emit('online_count_updated', count);
```

**Trust Score System:**
- Color-coded throughout UI (green=excellent → red=bad)  
- Real-time updates planned via Socket.io
- Trust calculator formulas in utils.js

**CRITICAL REFERENCE:** Always check `Oyun_Proje_Dokumanlari/Ana_Oyun_Dokumani.md` for game mechanics and business logic

## 🎮 Game Mechanics Priority

**30-Minute Onboarding Critical Path:**
- 0-5min: Username registration + "kimsesiz" start
- 5-15min: Bot mentor assignment + learning basics  
- 15-25min: Real mentor matching
- 25-30min: Social bonding + long-term planning

**Social System Core:** Chat = heart of game, trust economy drives all mechanics

---

**Next Development Phase:** Backend API implementation (Express + Socket.io + SQLite) following documented patterns in Flutter_Implementasyon_Rehberi.md

## 🔧 Development Patterns

**Frontend Architecture (ES6+ Classes):**
```javascript
// Main pattern: ES6 classes with async/await
class Dashboard {
    constructor() {
        this.user = null;
        this.socket = null;
        this.resources = { money: 50, wood: 0, grain: 0, business: 0 };
        this.init();
    }
    
    async init() {
        await this.loadUserData();
        this.setupEventListeners();
        this.connectSocket();
    }
}

// Socket.io real-time pattern
class SocketClient {
    constructor() {
        this.socket = io({ transports: ['websocket', 'polling'] });
        this.eventHandlers = new Map();
    }
}

// Chat system pattern  
class ChatManager {
    sendMessage(message) {
        this.socket.emit('send_message', {
            userId: this.user.id,
            userName: this.user.name,
            message: message
        });
    }
}
```

**CSS Architecture (Mobile-first + CSS Variables):**
```css
/* Design system with trust score colors */
:root {
    --trust-excellent: #4CAF50;  /* 180-200 */
    --trust-good: #8BC34A;       /* 160-179 */
    --trust-medium: #FFEB3B;     /* 140-159 */
    --trust-low: #FF9800;        /* 120-139 */
    --trust-bad: #F44336;        /* 0-119 */
}

/* Mobile-first responsive pattern */
.mobile-container { max-width: 428px; margin: 0 auto; }
@media (min-width: 768px) { /* Desktop adaptations */ }
```

**Trust Score Integration (Throughout UI):**
- Color-coded badges: Excellent(green) → Bad(red)
- Real-time updates via Socket.io
- Visual feedback in chat, dashboard, user profiles
- Trust calculator in utils.js with game-specific formula

## 🔄 Geliştirme Workflow

**Frontend Development (Current Phase):**
```bash
# Frontend file structure
frontend/public/
├── index.html       # Dashboard (production ready)
├── chat.html        # Real-time chat (production ready)
├── css/            # Complete design system (1500+ lines)
├── js/             # ES6+ classes (2000+ lines)
└── assets/         # PWA icons, manifest

# Testing frontend locally
cd frontend/public
python -m http.server 8000  # Simple HTTP server
# or use Live Server in VS Code
```

**Planned Backend Structure:**
```
server.js              # Express + Socket.io server
config/database.js     # SQLite connection + schema
src/services/          # Bot mentor, chat, trust calculator  
src/routes/           # API endpoints (auth, chat, user)
data/game.db          # SQLite database file
```

**Database Schema (SQLite, Ready for Implementation):**
- `users` table: phone_number, trust_score, resources
- `chat_messages` table: real-time chat storage
- `transactions` table: işlem kayıtları  
- `mentorships` table: mentor-çırak ilişkileri

**Socket.io Event Patterns (Frontend Implemented):**
```javascript
// Client → Server (Ready)
socket.emit('send_message', {userId, userName, message});
socket.emit('join_chat', userId);

// Server → Client (Expected)
io.emit('new_message', messageWithId);
io.emit('online_count_updated', count);
```

**Döküman Güncelleme Komutları:**
- `"Dökümanı güncelle"` = Ana dosyaya yeni özellik ekle
- `"Versiyon artır"` = Version number yükselt
- `"Özet çıkar"` = Kısa versiyon hazırla

**Deployment Commands (Planned):**
```bash
# Development start
npm run dev          # nodemon server.js

# Production deployment  
docker-compose up -d # Docker container
./quick-deploy.sh    # VPS deployment script

# Database operations
node scripts/migrate.js  # Test data setup
./backup.sh             # SQLite backup
```

**Kritik Özellikler (MVP):**
1. Bot mentor + chat sistemi (Socket.io real-time)
2. SMS doğrulama (simple token-based, no Firebase)
3. Basit ticaret penceresi (marketplace API)
4. İtibar puanı hesaplama (SQLite triggers)
5. 30 dakikalık onboarding flow (bot service)

## 🎮 Oyun Mekaniği Öncelikleri

**İlk 30 Dakika Critical Path:**
- 0-5dk: SMS doğrulama + "kimsesiz" başlangıç
- 5-15dk: Bot mentor ataması + temel öğrenme
- 15-25dk: Gerçek mentor arama
- 25-30dk: Sosyal bağ kurma + uzun vade planlama

**Sosyal Sistem:** Chat = oyunun kalbi, güven ekonomisi tüm mekanikleri yönetir

## 💡 Kod Yazım Yaklaşımı

**Node.js Architecture Patterns:**
```javascript
// Express + Socket.io pattern
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// SQLite operations (promisified)
await database.run('INSERT INTO users...', [params]);
const user = await database.get('SELECT * FROM users WHERE id = ?', [userId]);

// Real-time chat implementation
socket.on('send_message', async (data) => {
  const result = await ChatService.sendMessage(data);
  io.emit('new_message', result);
});
```

**Web Frontend Approach:**
- Progressive Web App (PWA) targeting mobile
- Socket.io client for real-time features
- Vanilla JS + responsive CSS (no React/Vue complexity)
- Local storage for auth tokens

**Anti-Pattern:** 
- Unity game engine (rejected - UI-heavy app)
- Flutter + Firebase (replaced - too complex for simple chat game)
- Heavy frontend frameworks (keeping it simple)

## 🚀 Development Timeline

**Node.js Advantage:** 2-3 week development cycle (vs 12+ weeks Flutter)

**Faz 1:** Node.js server + SQLite setup (1 hafta)
**Faz 2:** Socket.io chat + bot mentor (1 hafta)  
**Faz 3:** Web frontend + PWA features (1 hafta)
**Faz 4:** VPS deployment + testing (testing phase)

**Technology Decision Rationale:**
- Node.js: Better VS Code integration, simpler deployment
- SQLite: Portable database, easy VPS migration
- Socket.io: Proven real-time chat solution
- Web App: Cross-platform without app store complexity

## 🎮 Oyun Mekaniği Öncelikleri

**İlk 30 Dakika Critical Path:**
- 0-5dk: SMS doğrulama + "kimsesiz" başlangıç
- 5-15dk: Bot mentor ataması + temel öğrenme
- 15-25dk: Gerçek mentor arama
- 25-30dk: Sosyal bağ kurma + uzun vade planlama

**Sosyal Sistem:** Chat = oyunun kalbi, güven ekonomisi tüm mekanikleri yönetir

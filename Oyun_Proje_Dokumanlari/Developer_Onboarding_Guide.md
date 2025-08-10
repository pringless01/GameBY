# 🛠️ Developer Onboarding Guide - 2D Online Ticaret Oyunu

## 🎯 Quick Start (15 Dakika)

**Hedef:** Yeni developer'ın 15 dakikada projeyi local'de çalıştırabilmesi.

### **Prerequisites Checklist:**
- [ ] **Node.js 18+** yüklü
- [ ] **Git** yüklü  
- [ ] **VS Code** yüklü
- [ ] **Postman/Thunder Client** (API test için)

---

## ⚡ Hızlı Kurulum

### **1. Repository Clone (2 dk)**
```bash
# Repository clone
git clone https://github.com/your-username/ticaret-oyunu.git
cd ticaret-oyunu

# Branch kontrol
git branch -a
git checkout develop  # Eğer develop branch varsa
```

### **2. Dependencies Install (3 dk)**
```bash
# Node.js dependencies
npm install

# Development dependencies
npm install --dev

# Global tools (opsiyonel)
npm install -g nodemon

# Check versions
node --version   # v18.x.x gerekli
npm --version    # 9.x.x gerekli
```

### **3. Environment Setup (2 dk)**
```bash
# .env dosyası oluştur
cp .env.example .env

# .env dosyasını düzenle
nano .env
```

**.env Example:**
```bash
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-key-here
DATABASE_PATH=./data/game.db
LOG_LEVEL=debug
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### **4. Database Setup (3 dk)**
```bash
# Data directory oluştur
mkdir -p data

# Database migration çalıştır
npm run migrate

# Test data yükle (opsiyonel)
npm run seed

# Database kontrol
sqlite3 data/game.db ".tables"
```

### **5. Start Development Server (2 dk)**
```bash
# Development mode başlat
npm run dev

# Alternatif
nodemon server.js

# Terminal output kontrol
# ✅ "🚀 Server çalışıyor: http://localhost:3000"
# ✅ "📊 Database tables initialized"
# ✅ "🎮 Oyun hazır: http://localhost:3000"
```

### **6. Test Connection (3 dk)**
```bash
# Health check
curl http://localhost:3000/health

# Web interface
open http://localhost:3000

# API test
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+905551234567","displayName":"Test User"}'
```

**✅ BAŞARILI!** Server çalışıyor ve API yanıt veriyor.

---

## 🔧 VS Code Setup

### **Recommended Extensions:**
```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "humao.rest-client",
    "ms-python.python",
    "ms-vscode.vscode-sqlite"
  ]
}
```

### **VS Code Settings:**
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "files.exclude": {
    "**/node_modules": true,
    "**/data/*.db": false,
    "**/logs": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/logs": true
  }
}
```

### **Launch Configuration:**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeExecutable": "nodemon",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal"
    }
  ]
}
```

### **Tasks Configuration:**
```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Dev Server",
      "type": "shell",
      "command": "npm",
      "args": ["run", "dev"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "isBackground": true
    },
    {
      "label": "Run Tests",
      "type": "shell",
      "command": "npm",
      "args": ["test"],
      "group": "test"
    },
    {
      "label": "Database Reset",
      "type": "shell",
      "command": "npm",
      "args": ["run", "db:reset"],
      "group": "build"
    }
  ]
}
```

---

## 📁 Project Structure Guide

### **Folder Structure:**
```
ticaret-oyunu/
├── server.js                 # 🚀 Ana server dosyası
├── package.json              # 📦 Dependencies
├── .env                      # 🔐 Environment variables
├── .env.example              # 📋 Environment template
├── README.md                 # 📚 Proje açıklaması
├── docker-compose.yml        # 🐳 Docker setup
├── Dockerfile                # 🐳 Container definition
│
├── config/                   # ⚙️ Configuration
│   ├── database.js           # 📊 SQLite connection
│   └── jwt.js               # 🔐 JWT configuration
│
├── src/                     # 📂 Source code
│   ├── routes/              # 🛣️ API routes
│   │   ├── auth.js          # 🔐 Authentication
│   │   ├── chat.js          # 💬 Chat endpoints
│   │   ├── user.js          # 👤 User management
│   │   └── marketplace.js   # 🏪 Trading
│   │
│   ├── services/            # 🔧 Business logic
│   │   ├── authService.js   # 🔐 Auth logic
│   │   ├── chatService.js   # 💬 Chat logic
│   │   ├── botMentorService.js # 🤖 Bot mentor
│   │   └── trustService.js  # ⭐ Trust calculation
│   │
│   ├── middleware/          # 🛡️ Express middleware
│   │   ├── auth.js          # 🔐 JWT validation
│   │   ├── rateLimit.js     # 🚦 Rate limiting
│   │   └── errorHandler.js  # 🚨 Error handling
│   │
│   └── utils/               # 🛠️ Utilities
│       ├── sms.js           # 📱 SMS service
│       ├── validation.js    # ✅ Input validation
│       └── logger.js        # 📝 Logging
│
├── public/                  # 🌐 Static files
│   ├── index.html           # 🏠 Landing page
│   ├── login.html           # 🔐 Login page
│   ├── dashboard.html       # 📊 Main dashboard
│   ├── chat.html            # 💬 Chat interface
│   ├── css/                 # 🎨 Stylesheets
│   │   └── style.css        # 🎨 Main styles
│   └── js/                  # 📜 Client scripts
│       ├── auth.js          # 🔐 Client auth
│       ├── chat.js          # 💬 Chat client
│       └── dashboard.js     # 📊 Dashboard logic
│
├── data/                    # 📊 Database files
│   └── game.db              # 📊 SQLite database
│
├── logs/                    # 📝 Log files
│   ├── app.log              # 📝 Application logs
│   └── error.log            # 🚨 Error logs
│
├── scripts/                 # 🔧 Utility scripts
│   ├── migrate.js           # 📊 Database migration
│   ├── seed.js              # 🌱 Test data
│   └── backup.sh            # 💾 Backup script
│
└── tests/                   # 🧪 Test files
    ├── auth.test.js         # 🔐 Auth tests
    ├── chat.test.js         # 💬 Chat tests
    └── api.test.js          # 📡 API tests
```

### **Key Files Açıklama:**

#### **server.js** 
```javascript
// Ana Express server + Socket.io setup
// HTTP server + WebSocket server
// Route tanımlamaları
// Middleware setup
```

#### **config/database.js**
```javascript
// SQLite connection management
// Database schema creation
// Promisified sqlite3 operations
```

#### **src/services/chatService.js**
```javascript
// Chat business logic
// Message validation
// Bot integration
// Real-time events
```

#### **public/js/chat.js**
```javascript
// Client-side chat functionality
// Socket.io client
// DOM manipulation
// Real-time UI updates
```

---

## 🔄 Development Workflow

### **Daily Workflow:**
1. **Git pull** → Son değişiklikleri al
2. **npm run dev** → Development server başlat
3. **Code** → Değişiklik yap
4. **Test** → Local test et
5. **Git commit** → Değişiklikleri commit et

### **Branch Strategy:**
- **main** → Production code
- **develop** → Development branch  
- **feature/xyz** → Yeni özellik
- **bugfix/xyz** → Bug fix

### **Commit Convention:**
```bash
# Feature
git commit -m "feat: chat mesaj gönderme özelliği eklendi"

# Bug fix
git commit -m "fix: authentication token validation düzeltildi"

# Documentation
git commit -m "docs: API documentation güncellendi"

# Refactor
git commit -m "refactor: chat service kod temizleme"
```

---

## 🧪 Testing Strategy

### **Test Types:**
- **Unit Tests:** Individual functions
- **Integration Tests:** API endpoints
- **E2E Tests:** Full user flow

### **Test Commands:**
```bash
# Tüm testleri çalıştır
npm test

# Watch mode
npm run test:watch

# Coverage raporu
npm run test:coverage

# Specific test file
npm test -- auth.test.js
```

### **Test Example:**
```javascript
// tests/auth.test.js
const request = require('supertest');
const app = require('../server');

describe('Authentication', () => {
  test('POST /api/auth/register should create user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        phoneNumber: '+905551234567',
        displayName: 'Test User'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.userId).toBeDefined();
  });
});
```

---

## 🔍 Debugging Guide

### **Common Issues & Solutions:**

#### **1. Port Already in Use**
```bash
# Problemi tespit et
lsof -i :3000

# Process'i sonlandır
kill -9 PID_NUMBER

# Alternatif port kullan
PORT=3001 npm run dev
```

#### **2. Database Lock Error**
```bash
# Database'i unlock et
sqlite3 data/game.db "PRAGMA journal_mode=WAL;"

# Database dosyasını yenile
rm data/game.db
npm run migrate
```

#### **3. Node Modules Issues**
```bash
# Cache temizle
npm cache clean --force

# Node modules yeniden yükle
rm -rf node_modules package-lock.json
npm install
```

#### **4. JWT Token Invalid**
```bash
# .env dosyasında JWT_SECRET kontrol et
# Token'ı localStorage'dan temizle
# Browser console: localStorage.removeItem('jwt_token')
```

### **Debug Tools:**

#### **VS Code Debugger**
- F5 → Start debugging
- Breakpoint koy
- Variables panel kullan
- Call stack inceleyersin

#### **Console Logging**
```javascript
// Debug logs
console.log('🔍 Debug:', variable);
console.error('🚨 Error:', error);
console.table(arrayData);

// Production logs
const logger = require('./src/utils/logger');
logger.info('Info message');
logger.error('Error message');
```

#### **Database Inspection**
```bash
# SQLite CLI
sqlite3 data/game.db

# Tables listesi
.tables

# Users tablosu
SELECT * FROM users LIMIT 5;

# Chat messages
SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 10;
```

---

## 📡 API Testing

### **Thunder Client (VS Code Extension)**
```json
// requests.json
{
  "clientName": "Thunder Client",
  "collectionName": "Ticaret Oyunu API",
  "requests": [
    {
      "name": "Register User",
      "url": "http://localhost:3000/api/auth/register",
      "method": "POST",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "body": {
        "type": "json",
        "raw": "{\n  \"phoneNumber\": \"+905551234567\",\n  \"displayName\": \"Test User\"\n}"
      }
    },
    {
      "name": "Get Profile",
      "url": "http://localhost:3000/api/user/profile",
      "method": "GET",
      "headers": [
        {
          "name": "Authorization",
          "value": "Bearer {{jwt_token}}"
        }
      ]
    }
  ]
}
```

### **Postman Collection**
```bash
# Postman için collection export
# File > Export > Collection v2.1
# Share with team
```

---

## 🚀 Deployment Test

### **Local Production Test:**
```bash
# Production build test
NODE_ENV=production npm start

# Docker test
docker-compose up --build

# Health check
curl http://localhost:3000/health
```

### **Pre-deployment Checklist:**
- [ ] All tests passing
- [ ] No console errors
- [ ] Database migrations work
- [ ] Environment variables set
- [ ] API endpoints working
- [ ] Socket.io working
- [ ] Authentication working

---

## 📚 Learning Resources

### **Codebase Specific:**
1. **Ana Oyun Dökümanı** → Game logic anlama
2. **API Documentation** → Endpoint'leri öğren
3. **Socket.io Events** → Real-time özellikler
4. **Database Schema** → Veri yapısını anla

### **Technology Stack:**
- **Node.js** → [nodejs.org/docs](https://nodejs.org/docs)
- **Express.js** → [expressjs.com/guide](https://expressjs.com/guide)
- **Socket.io** → [socket.io/docs](https://socket.io/docs)
- **SQLite** → [sqlite.org/docs](https://sqlite.org/docs)

### **Tools:**
- **VS Code** → [code.visualstudio.com/docs](https://code.visualstudio.com/docs)
- **Git** → [git-scm.com/docs](https://git-scm.com/docs)
- **npm** → [docs.npmjs.com](https://docs.npmjs.com)

---

## 🎯 First Tasks for New Developers

### **Beginner (1-2 gün):**
1. **Environment setup** → Tüm sistem çalışır hale getir
2. **Code review** → Ana dosyaları oku ve anla
3. **API testing** → Postman ile endpoint'leri test et
4. **Simple bug fix** → Kolay bir bug'ı düzelt

### **Intermediate (1 hafta):**
1. **New endpoint** → Basit bir API endpoint ekle
2. **Database query** → Yeni bir database query yaz
3. **Frontend feature** → Basit bir UI özelliği ekle
4. **Test writing** → Yazdığın özellik için test yaz

### **Advanced (2+ hafta):**
1. **New feature** → Tam bir özellik implement et
2. **Performance optimization** → Sistem performansını artır
3. **Security audit** → Güvenlik açıklarını araştır
4. **Documentation** → Döküman yaz veya güncelle

---

## 🆘 Support & Help

### **Team Communication:**
- **Discord/Slack** → Daily chat
- **GitHub Issues** → Bug reports, feature requests
- **Pull Requests** → Code review
- **Weekly Meetings** → Progress sync

### **Documentation:**
- **Project Wiki** → Detaylı dökümanlar
- **API Docs** → Endpoint referansı
- **Code Comments** → Inline açıklamalar
- **README files** → Folder specific instructions

### **Getting Help:**
1. **Check documentation** first
2. **Search GitHub issues** for similar problems
3. **Ask in team chat** for quick questions
4. **Create GitHub issue** for bugs/features
5. **Schedule 1:1** for complex topics

---

**Bu guide ile yeni developer 1 günde productive olabilir!** 🚀

**Hazırlayan:** Musa & GitHub Copilot  
**Tarih:** 5 Ağustos 2025  
**Versiyon:** 1.0 - Complete Developer Onboarding

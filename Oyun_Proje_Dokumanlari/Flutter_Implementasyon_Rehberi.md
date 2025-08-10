# 🛠️ Node.js Implementasyon Rehberi - 2D Online Ticaret Oyunu

## 📋 Proje Kurulumu

### **Node.js & npm Kurulumu**
```bash
# Node.js versiyonu kontrol et
node --version  # v18.0.0 veya üstü
npm --version   # 8.0.0 veya üstü

# Yarn (opsiyonel, hızlı package manager)
npm install -g yarn
```

### **Yeni Proje Oluşturma**
```bash
# Proje klasörü oluştur
mkdir ticaret_oyunu
cd ticaret_oyunu

# npm projesi başlat
npm init -y

# Temel klasör yapısını oluştur
mkdir public src config
mkdir public/css public/js public/assets
mkdir src/models src/routes src/services src/middleware
```

### **package.json Dependencies**
```json
{
  "name": "ticaret_oyunu",
  "version": "1.0.0",
  "description": "2D Online Ticaret Simülasyon Oyunu",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.8.1",
    "sqlite3": "^5.1.6",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.1",
    "uuid": "^9.0.0",
    "moment": "^2.29.4",
    "validator": "^13.9.0",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3"
  },
  "keywords": ["trading", "game", "nodejs", "realtime"],
  "author": "Musa",
  "license": "MIT"
}

---

## 🏗️ Proje Mimarisi

### **Klasör Yapısı**
```
ticaret_oyunu/
├── server.js                 # Ana server dosyası
├── package.json             # Proje bağımlılıkları
├── config/
│   ├── database.js          # SQLite bağlantısı
│   ├── socket.js            # Socket.io konfigürasyonu
│   └── auth.js              # Authentication config
├── src/
│   ├── models/              # Veri modelleri
│   │   ├── User.js
│   │   ├── Chat.js
│   │   ├── Transaction.js
│   │   └── Mentorship.js
│   ├── routes/              # API route'ları
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── marketplace.js
│   │   └── user.js
│   ├── services/            # Business logic
│   │   ├── authService.js
│   │   ├── chatService.js
│   │   ├── botMentorService.js
│   │   └── trustScoreService.js
│   ├── middleware/          # Express middleware
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   └── validation.js
│   └── utils/               # Yardımcı fonksiyonlar
│       ├── logger.js
│       ├── helpers.js
│       └── constants.js
├── public/                  # Frontend dosyaları
│   ├── index.html          # Ana sayfa
│   ├── login.html          # Giriş sayfası
│   ├── dashboard.html      # Ana dashboard
│   ├── chat.html           # Chat sayfası
│   ├── css/
│   │   ├── style.css       # Ana stil dosyası
│   │   ├── dashboard.css   # Dashboard stilleri
│   │   └── chat.css        # Chat stilleri
│   ├── js/
│   │   ├── app.js          # Ana uygulama
│   │   ├── auth.js         # Authentication logic
│   │   ├── dashboard.js    # Dashboard functionality
│   │   ├── chat.js         # Chat functionality
│   │   └── socket-client.js # Socket.io client
│   └── assets/
│       ├── images/
│       └── sounds/
└── tests/                   # Test dosyaları
    ├── auth.test.js
    ├── chat.test.js
    └── api.test.js
```

---

## 🎨 Theme ve Tasarım Sistemi

### **style.css (Ana Stil)**
```css
/* CSS Custom Properties (Variables) */
:root {
  /* Ana renkler */
  --primary-color: #2E7D32;        /* Güven Yeşili */
  --secondary-color: #FF8F00;      /* Altın Sarısı */
  --danger-color: #D32F2F;         /* Uyarı Kırmızısı */
  --chat-color: #1976D2;           /* Güven Mavisi */
  --neutral-color: #616161;        /* Gri */
  
  /* İtibar puanı renkleri */
  --trust-high: #4CAF50;           /* 180-200 */
  --trust-medium: #FFEB3B;         /* 150-179 */
  --trust-low: #FF9800;            /* 100-149 */
  --trust-bad: #F44336;            /* 0-99 */
  
  /* Background renkler */
  --bg-primary: #F5F5F5;
  --bg-surface: #FFFFFF;
  --bg-card: #FAFAFA;
  
  /* Text renkler */
  --text-primary: #212121;
  --text-secondary: #757575;
  --text-hint: #BDBDBD;
  
  /* Font sizes */
  --font-large: 24px;
  --font-medium: 16px;
  --font-small: 14px;
  --font-tiny: 12px;
}

/* Global reset ve base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.5;
}

/* Utility classes */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.card {
  background: var(--bg-surface);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 16px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: #1B5E20;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

/* İtibar puanı badge */
.trust-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: var(--font-tiny);
  font-weight: bold;
  color: white;
  display: inline-block;
}

.trust-high { background-color: var(--trust-high); }
.trust-medium { background-color: var(--trust-medium); color: #333; }
.trust-low { background-color: var(--trust-low); }
.trust-bad { background-color: var(--trust-bad); }

/* Layout utilities */
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.align-center { align-items: center; }
.gap-16 { gap: 16px; }
.gap-8 { gap: 8px; }

.text-center { text-align: center; }
.text-bold { font-weight: bold; }
.text-small { font-size: var(--font-small); }
.text-tiny { font-size: var(--font-tiny); }

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 12px;
  }
  
  .card {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .btn {
    padding: 10px 16px;
    font-size: var(--font-small);
  }
}
```

### **chat.css (Chat Özel Stilleri)**
```css
/* Chat container */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 600px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
}

/* Chat header */
.chat-header {
  background: var(--chat-color);
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.online-count {
  font-size: var(--font-small);
  opacity: 0.9;
}

/* Chat tabs */
.chat-tabs {
  display: flex;
  background: var(--bg-surface);
  border-bottom: 1px solid #e0e0e0;
}

.chat-tab {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--font-small);
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.chat-tab.active {
  color: var(--chat-color);
  border-bottom-color: var(--chat-color);
  font-weight: bold;
}

/* Chat messages area */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: var(--bg-primary);
}

/* Message item */
.message-item {
  margin-bottom: 12px;
  padding: 12px;
  background: var(--bg-surface);
  border-radius: 8px;
  animation: messageSlideIn 0.3s ease;
}

.message-item.bot-message {
  background: rgba(25, 118, 210, 0.1);
  border-left: 3px solid var(--chat-color);
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Message header */
.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.message-user {
  font-weight: 600;
  color: var(--text-primary);
}

.message-time {
  font-size: 10px;
  color: var(--text-hint);
}

/* Message content */
.message-content {
  color: var(--text-primary);
  line-height: 1.4;
}

/* Chat input */
.chat-input {
  display: flex;
  padding: 16px;
  background: var(--bg-surface);
  border-top: 1px solid #e0e0e0;
  gap: 8px;
}

.chat-input input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  outline: none;
  font-size: var(--font-small);
}

.chat-input input:focus {
  border-color: var(--chat-color);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.send-btn {
  background: var(--chat-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.send-btn:hover {
  background: #1565C0;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}
```

---

## 🔥 Database ve Backend Setup

### **database.js (SQLite)**
```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, '../data/game.db'));
    this.initializeTables();
  }

  initializeTables() {
    // Users tablosu
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT UNIQUE NOT NULL,
        display_name TEXT DEFAULT 'Yeni Oyuncu',
        trust_score INTEGER DEFAULT 100,
        wood INTEGER DEFAULT 0,
        grain INTEGER DEFAULT 0,
        money INTEGER DEFAULT 50,
        mentor_id INTEGER,
        is_online BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mentor_id) REFERENCES users(id)
      )
    `);

    // Chat mesajları tablosu
    this.db.run(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        user_name TEXT NOT NULL,
        user_trust_score INTEGER DEFAULT 0,
        message TEXT NOT NULL,
        is_bot BOOLEAN DEFAULT 0,
        mentioned_user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // İşlemler tablosu
    this.db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        buyer_id INTEGER NOT NULL,
        seller_id INTEGER NOT NULL,
        item_type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (buyer_id) REFERENCES users(id),
        FOREIGN KEY (seller_id) REFERENCES users(id)
      )
    `);

    // Mentorship tablosu
    this.db.run(`
      CREATE TABLE IF NOT EXISTS mentorships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mentor_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        status TEXT DEFAULT 'active',
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mentor_id) REFERENCES users(id),
        FOREIGN KEY (student_id) REFERENCES users(id)
      )
    `);

    console.log('📊 Database tables initialized');
  }

  // Promisify sqlite3 methods
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = new Database();
```

### **server.js (Ana Server)**
```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const database = require('./config/database');
const authRoutes = require('./src/routes/auth');
const chatRoutes = require('./src/routes/chat');
const userRoutes = require('./src/routes/user');
const marketplaceRoutes = require('./src/routes/marketplace');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// Socket.io bağlantısı
io.on('connection', (socket) => {
  console.log('👤 Kullanıcı bağlandı:', socket.id);

  // Chat mesajı gönderme
  socket.on('send_message', async (data) => {
    try {
      const { userId, userName, userTrustScore, message, isBot = false } = data;
      
      // Mesajı veritabanına kaydet
      const result = await database.run(`
        INSERT INTO chat_messages (user_id, user_name, user_trust_score, message, is_bot)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, userName, userTrustScore, message, isBot]);

      // Tüm kullanıcılara mesajı gönder
      const messageWithId = {
        id: result.id,
        userId,
        userName,
        userTrustScore,
        message,
        isBot,
        timestamp: new Date().toISOString()
      };

      io.emit('new_message', messageWithId);
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      socket.emit('error', 'Mesaj gönderilemedi');
    }
  });

  // Kullanıcı chat'e katıldı
  socket.on('join_chat', async (userId) => {
    socket.userId = userId;
    
    // Kullanıcıyı online yap
    await database.run('UPDATE users SET is_online = 1, last_active = CURRENT_TIMESTAMP WHERE id = ?', [userId]);
    
    // Online kullanıcı sayısını güncelle
    const onlineCount = await database.get('SELECT COUNT(*) as count FROM users WHERE is_online = 1');
    io.emit('online_count_updated', onlineCount.count);
  });

  // Bağlantı kesildi
  socket.on('disconnect', async () => {
    console.log('👤 Kullanıcı ayrıldı:', socket.id);
    
    if (socket.userId) {
      // Kullanıcıyı offline yap
      await database.run('UPDATE users SET is_online = 0, last_active = CURRENT_TIMESTAMP WHERE id = ?', [socket.userId]);
      
      // Online kullanıcı sayısını güncelle
      const onlineCount = await database.get('SELECT COUNT(*) as count FROM users WHERE is_online = 1');
      io.emit('online_count_updated', onlineCount.count);
    }
  });
});

// Ana sayfa route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Sayfa bulunamadı' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Sunucu hatası' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
  console.log(`🎮 Oyun hazır: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Server kapatılıyor...');
  await database.close();
  process.exit(0);
});
```

---

## 💬 Chat Sistemi Implementasyonu

### **src/services/chatService.js**
```javascript
const database = require('../../config/database');

class ChatService {
  // Global chat mesajları getir
  static async getGlobalMessages(limit = 50) {
    const messages = await database.all(`
      SELECT * FROM chat_messages 
      ORDER BY created_at DESC 
      LIMIT ?
    `, [limit]);
    
    return messages.reverse(); // En eski mesaj üstte
  }

  // Mesaj gönder
  static async sendMessage(userId, userName, userTrustScore, message, isBot = false) {
    const result = await database.run(`
      INSERT INTO chat_messages (user_id, user_name, user_trust_score, message, is_bot)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, userName, userTrustScore, message, isBot]);

    return {
      id: result.id,
      userId,
      userName,
      userTrustScore,
      message,
      isBot,
      timestamp: new Date().toISOString()
    };
  }

  // Bot mesajı gönder
  static async sendBotMessage(message, targetUserId = null) {
    return await this.sendMessage(
      'bot_mentor', 
      '🤖 Rehber Ali', 
      200, 
      message, 
      true
    );
  }

  // Online kullanıcı sayısı
  static async getOnlineUsersCount() {
    const result = await database.get('SELECT COUNT(*) as count FROM users WHERE is_online = 1');
    return result.count;
  }

  // Spam kontrolü
  static async checkSpam(userId, timeWindow = 60) {
    const messages = await database.all(`
      SELECT COUNT(*) as count FROM chat_messages 
      WHERE user_id = ? AND created_at > datetime('now', '-${timeWindow} seconds')
    `, [userId]);
    
    return messages[0].count > 5; // 1 dakikada 5'ten fazla mesaj spam
  }
}

module.exports = ChatService;
```

### **src/routes/chat.js**
```javascript
const express = require('express');
const router = express.Router();
const ChatService = require('../services/chatService');
const { authenticateToken } = require('../middleware/auth');

// Global chat mesajları getir
router.get('/messages', authenticateToken, async (req, res) => {
  try {
    const messages = await ChatService.getGlobalMessages();
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Chat mesajları getirme hatası:', error);
    res.status(500).json({ success: false, error: 'Mesajlar getirilemedi' });
  }
});

// Mesaj gönder
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const { userId, userName, userTrustScore } = req.user;

    // Spam kontrolü
    const isSpam = await ChatService.checkSpam(userId);
    if (isSpam) {
      return res.status(429).json({ success: false, error: 'Çok hızlı mesaj gönderiyorsunuz' });
    }

    const newMessage = await ChatService.sendMessage(userId, userName, userTrustScore, message);
    
    // Socket.io ile broadcast et
    req.app.get('io').emit('new_message', newMessage);
    
    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Mesaj gönderme hatası:', error);
    res.status(500).json({ success: false, error: 'Mesaj gönderilemedi' });
  }
});

// Online kullanıcı sayısı
router.get('/online-count', async (req, res) => {
  try {
    const count = await ChatService.getOnlineUsersCount();
    res.json({ success: true, count });
  } catch (error) {
    console.error('Online sayısı getirme hatası:', error);
    res.status(500).json({ success: false, error: 'Online sayısı alınamadı' });
  }
});

module.exports = router;
```

### **public/js/socket-client.js**
```javascript
class SocketClient {
  constructor() {
    this.socket = io();
    this.currentUser = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Yeni mesaj alındı
    this.socket.on('new_message', (message) => {
      this.displayMessage(message);
      this.playNotificationSound();
    });

    // Online sayısı güncellendi
    this.socket.on('online_count_updated', (count) => {
      this.updateOnlineCount(count);
    });

    // Bağlantı hatası
    this.socket.on('connect_error', (error) => {
      console.error('Socket bağlantı hatası:', error);
      this.showError('Bağlantı sorunu yaşanıyor...');
    });

    // Yeniden bağlandı
    this.socket.on('reconnect', () => {
      this.showSuccess('Bağlantı yeniden kuruldu!');
      if (this.currentUser) {
        this.joinChat(this.currentUser.id);
      }
    });
  }

  // Chat'e katıl
  joinChat(userId) {
    this.socket.emit('join_chat', userId);
  }

  // Mesaj gönder
  sendMessage(message) {
    if (!this.currentUser) return;

    const messageData = {
      userId: this.currentUser.id,
      userName: this.currentUser.displayName,
      userTrustScore: this.currentUser.trustScore,
      message: message.trim(),
      isBot: false
    };

    this.socket.emit('send_message', messageData);
  }

  // Mesajı ekranda göster
  displayMessage(message) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    const messageElement = this.createMessageElement(message);
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Mesaj HTML elementi oluştur
  createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-item ${message.isBot ? 'bot-message' : ''}`;

    const trustColor = this.getTrustColor(message.userTrustScore);
    const timeStr = new Date(message.timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    messageDiv.innerHTML = `
      <div class="message-header">
        <span class="message-user">${message.userName}</span>
        <span class="trust-badge ${trustColor}">⭐ ${message.userTrustScore}</span>
        <span class="message-time">${timeStr}</span>
      </div>
      <div class="message-content">${this.escapeHtml(message.message)}</div>
    `;

    return messageDiv;
  }

  // İtibar puanına göre renk
  getTrustColor(score) {
    if (score >= 180) return 'trust-high';
    if (score >= 150) return 'trust-medium';
    if (score >= 100) return 'trust-low';
    return 'trust-bad';
  }

  // HTML escape
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Online sayısını güncelle
  updateOnlineCount(count) {
    const onlineElement = document.getElementById('online-count');
    if (onlineElement) {
      onlineElement.textContent = `${count} kişi online`;
    }
  }

  // Bildirim sesi çal
  playNotificationSound() {
    try {
      const audio = new Audio('/assets/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ses çalma hatası sessizce ignore
    } catch (e) {}
  }

  // Başarı mesajı göster
  showSuccess(message) {
    this.showToast(message, 'success');
  }

  // Hata mesajı göster
  showError(message) {
    this.showToast(message, 'error');
  }

  // Toast notification göster
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  // Kullanıcı bilgilerini set et
  setCurrentUser(user) {
    this.currentUser = user;
    this.joinChat(user.id);
  }
}

// Global socket client instance
const socketClient = new SocketClient();
```

### **public/js/chat.js**
```javascript
class ChatManager {
  constructor() {
    this.messageInput = document.getElementById('message-input');
    this.sendButton = document.getElementById('send-button');
    this.messagesContainer = document.getElementById('chat-messages');
    
    this.setupEventListeners();
    this.loadInitialMessages();
  }

  setupEventListeners() {
    // Mesaj gönder butonu
    this.sendButton.addEventListener('click', () => {
      this.sendMessage();
    });

    // Enter tuşu ile mesaj gönder
    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Input değişikliklerini dinle
    this.messageInput.addEventListener('input', () => {
      this.updateSendButton();
    });

    // Chat tab değişiklikleri
    document.querySelectorAll('.chat-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });
  }

  // İlk mesajları yükle
  async loadInitialMessages() {
    try {
      const response = await fetch('/api/chat/messages', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        data.messages.forEach(message => {
          socketClient.displayMessage(message);
        });
      }
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
    }
  }

  // Mesaj gönder
  sendMessage() {
    const message = this.messageInput.value.trim();
    if (!message) return;

    // Socket ile mesaj gönder
    socketClient.sendMessage(message);

    // Input'u temizle
    this.messageInput.value = '';
    this.updateSendButton();
  }

  // Gönder butonunu güncelle
  updateSendButton() {
    const hasText = this.messageInput.value.trim().length > 0;
    this.sendButton.disabled = !hasText;
  }

  // Tab değiştir
  switchTab(tabName) {
    // Tab'ları güncelle
    document.querySelectorAll('.chat-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // İçeriği güncelle
    switch (tabName) {
      case 'global':
        this.loadGlobalChat();
        break;
      case 'local':
        this.loadLocalChat();
        break;
      case 'private':
        this.loadPrivateChats();
        break;
    }
  }

  // Global chat yükle
  loadGlobalChat() {
    this.messagesContainer.innerHTML = '';
    this.loadInitialMessages();
  }

  // Lokal chat yükle (şimdilik placeholder)
  loadLocalChat() {
    this.messagesContainer.innerHTML = `
      <div class="info-message">
        🏘️ Lokal chat özelliği yakında gelecek!
      </div>
    `;
  }

  // Özel mesajlar yükle (şimdilik placeholder)
  loadPrivateChats() {
    this.messagesContainer.innerHTML = `
      <div class="info-message">
        💬 Özel mesajlar özelliği yakında gelecek!
      </div>
    `;
  }
}

// Sayfa yüklendiğinde chat manager'ı başlat
document.addEventListener('DOMContentLoaded', () => {
  // Kullanıcı giriş yapmış mı kontrol et
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  // Kullanıcı bilgilerini al ve chat'i başlat
  getCurrentUser().then(user => {
    if (user) {
      socketClient.setCurrentUser(user);
      new ChatManager();
    } else {
      window.location.href = '/login.html';
    }
  });
});

// Mevcut kullanıcı bilgilerini al
async function getCurrentUser() {
  try {
    const response = await fetch('/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    return data.success ? data.user : null;
  } catch (error) {
    console.error('Kullanıcı bilgileri alınırken hata:', error);
    return null;
  }
}
```

---

## 🤖 Bot Mentor Sistemi

### **src/services/botMentorService.js**
```javascript
const ChatService = require('./chatService');
const database = require('../../config/database');

class BotMentorService {
  // Yeni kullanıcı için bot mentor başlatma
  static async startOnboarding(userId) {
    setTimeout(async () => {
      await this.sendWelcomeMessages(userId);
    }, 2000);
  }

  // Hoş geldin mesajları
  static async sendWelcomeMessages(userId) {
    const messages = [
      'Merhaba! Ben Rehber Ali 🤖',
      'Oyuna yeni başladığını gördüm. Sana yardım edeceğim!',
      'Bu oyunda tek başına bir hiçsin 😅',
      'Ama doğru insanlarla tanışırsan, milyoner olabilirsin! 💰',
      'İlk olarak sana bir "başlangıç paketi" veriyorum:',
      '🪓 Balta + 🌳 Küçük orman alanı + 💰 50 TL',
      'Hazır mısın? İlk işine başlayalım! 💪',
    ];

    for (let i = 0; i < messages.length; i++) {
      setTimeout(async () => {
        await ChatService.sendBotMessage(messages[i]);
      }, i * 3000);
    }

    // Starter pack ver
    setTimeout(() => {
      this.giveStarterPack(userId);
    }, messages.length * 3000);
  }

  // Başlangıç paketi verme
  static async giveStarterPack(userId) {
    await database.run(`
      UPDATE users SET 
        wood = 0,
        grain = 0, 
        money = 50,
        last_active = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [userId]);

    // Odun kesme öğretimi başlat
    setTimeout(() => {
      this.teachWoodChopping(userId);
    }, 2000);
  }

  // Odun kesme öğretimi
  static async teachWoodChopping(userId) {
    const messages = [
      'Şimdi ilk paranı kazanacaksın! 🎯',
      'Baltanla ormanda odun kes ⬇️',
      '[Odun Kes] butonuna tıkla',
    ];

    for (let i = 0; i < messages.length; i++) {
      setTimeout(async () => {
        await ChatService.sendBotMessage(messages[i]);
      }, i * 2000);
    }
  }

  // Pazar öğretimi
  static async teachMarketplace(userId) {
    await ChatService.sendBotMessage('Bravo! 🎉 İlk odunu kestin!');
    
    setTimeout(async () => {
      await ChatService.sendBotMessage('Şimdi bunu pazarda sat.');
    }, 2000);
    
    setTimeout(async () => {
      await ChatService.sendBotMessage('[Pazar] sekmesine git ⬇️');
    }, 4000);
  }

  // Chat öğretimi
  static async teachChat(userId) {
    const messages = [
      'En önemli kısım geliyor: SOHBET! 💬',
      'Bu oyunda chat = hayat!',
      'Doğru insanlarla konuşmazsan, hiçbir yere varamazsın.',
      'Şimdi bana bir mesaj yaz.',
      'Herhangi bir şey... "merhaba" de mesela 😊',
    ];

    for (let i = 0; i < messages.length; i++) {
      setTimeout(async () => {
        await ChatService.sendBotMessage(messages[i]);
      }, i * 3000);
    }
  }

  // Güven sistemi açıklaması
  static async explainTrustSystem(userId) {
    const messages = [
      'Çok önemli bir konu: GÜVENLİK! 🔒',
      'Her oyuncunun "itibar puanı" var ⭐',
      'Bu puanı çok iyi izle!',
      'Mesela beni gör: ⭐ 200/200 (Mükemmel) ✅',
      'Bana güvenebilirsin çünkü botum 🤖',
      'Ama dikkat et: ⚠️ Düşük puanlı oyuncular tehlikeli!',
    ];

    for (let i = 0; i < messages.length; i++) {
      setTimeout(async () => {
        await ChatService.sendBotMessage(messages[i]);
      }, i * 4000);
    }
  }

  // Mentor arama hazırlığı
  static async prepareMentorSearch(userId) {
    const messages = [
      'Artık senden bir "çırak" oldu! 🎓',
      'Şimdi sıra geldi GERÇEK MENTOR bulmaya!',
      'Ben sadece temel konuları öğrettim.',
      'Gerçek mentor sana çok daha fazlasını öğretir! 💪',
      'Şimdi [Gerçek Mentor Ara] butonuna tıkla!',
    ];

    for (let i = 0; i < messages.length; i++) {
      setTimeout(async () => {
        await ChatService.sendBotMessage(messages[i]);
      }, i * 3000);
    }
  }

  // Kullanıcı mesajına otomatik yanıt
  static async handleUserMessage(userId, message) {
    const lowerMessage = message.toLowerCase();
    
    // Basit keyword matching
    if (lowerMessage.includes('merhaba') || lowerMessage.includes('selam')) {
      setTimeout(async () => {
        await ChatService.sendBotMessage('Merhaba! 👋 Harika, iletişim kurabiliyorsun!');
      }, 1000);
      
      setTimeout(async () => {
        this.teachChat(userId);
      }, 3000);
    }
    
    if (lowerMessage.includes('yardım') || lowerMessage.includes('nasıl')) {
      setTimeout(async () => {
        await ChatService.sendBotMessage('Tabii ki yardım ederim! Ne öğrenmek istiyorsun? 🤔');
      }, 1000);
    }
    
    if (lowerMessage.includes('para') || lowerMessage.includes('kazanç')) {
      setTimeout(async () => {
        await ChatService.sendBotMessage('Para kazanmanın en iyi yolu: İTİBAR! ⭐ Güvenilir ol, büyük işler gelir.');
      }, 1000);
    }
  }
}

module.exports = BotMentorService;
```

---

## 📊 Frontend HTML Sayfaları

### **public/index.html**
```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticaret Oyunu - Ana Sayfa</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/dashboard.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <div class="user-info">
                <div class="user-avatar">
                    <span id="user-initial">M</span>
                </div>
                <div class="user-details">
                    <h3 id="user-name">Kullanıcı</h3>
                    <span class="trust-badge" id="user-trust">⭐ 100</span>
                </div>
                <div class="online-indicator">
                    <span id="online-count">0 kişi online</span>
                </div>
            </div>
        </header>

        <!-- Dashboard Cards -->
        <div class="dashboard-grid">
            <!-- Resources Card -->
            <div class="card resource-card">
                <h3>💰 Kaynaklarım</h3>
                <div class="resources">
                    <div class="resource-item">
                        <span class="resource-icon">💰</span>
                        <span class="resource-label">Para</span>
                        <span class="resource-value" id="money">50 TL</span>
                    </div>
                    <div class="resource-item">
                        <span class="resource-icon">🌳</span>
                        <span class="resource-label">Odun</span>
                        <span class="resource-value" id="wood">0</span>
                    </div>
                    <div class="resource-item">
                        <span class="resource-icon">🌾</span>
                        <span class="resource-label">Tahıl</span>
                        <span class="resource-value" id="grain">0</span>
                    </div>
                </div>
            </div>

            <!-- Actions Card -->
            <div class="card actions-card">
                <h3>⚡ Hızlı İşlemler</h3>
                <div class="action-buttons">
                    <button class="btn btn-primary" id="chop-wood">
                        🪓 Odun Kes
                    </button>
                    <button class="btn btn-secondary" id="sell-wood">
                        💰 Odun Sat
                    </button>
                    <button class="btn btn-secondary" onclick="window.location.href='/chat.html'">
                        💬 Chat
                    </button>
                </div>
            </div>

            <!-- Daily Goal Card -->
            <div class="card goal-card">
                <h3>🎯 Günlük Hedef</h3>
                <p>100 TL biriktirmek</p>
                <div class="progress-bar">
                    <div class="progress-fill" id="progress" style="width: 50%"></div>
                </div>
                <small id="progress-text">50/100 TL (50%)</small>
            </div>

            <!-- Stats Card -->
            <div class="card stats-card">
                <h3>📊 İstatistikler</h3>
                <div class="stats">
                    <div class="stat-item">
                        <span>Günlük Kazanç</span>
                        <span class="stat-value">+25 TL</span>
                    </div>
                    <div class="stat-item">
                        <span>Aktif Kontrat</span>
                        <span class="stat-value">0 Adet</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Navigation -->
        <nav class="bottom-nav">
            <a href="/" class="nav-item active">
                🏠 Ana Sayfa
            </a>
            <a href="/chat.html" class="nav-item">
                💬 Chat
            </a>
            <a href="/marketplace.html" class="nav-item">
                🏪 Pazar
            </a>
            <a href="/profile.html" class="nav-item">
                👤 Profil
            </a>
        </nav>
    </div>

    <!-- Scripts -->
    <script src="/socket.io/socket.io.js"></script>
    <script src="/js/socket-client.js"></script>
    <script src="/js/dashboard.js"></script>
</body>
</html>
```

### **public/chat.html**
```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticaret Oyunu - Chat</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/chat.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <!-- Chat Container -->
        <div class="chat-container">
            <!-- Chat Header -->
            <div class="chat-header">
                <h2>💬 Global Chat</h2>
                <span class="online-count" id="online-count">0 kişi online</span>
            </div>

            <!-- Chat Tabs -->
            <div class="chat-tabs">
                <button class="chat-tab active" data-tab="global">🌍 Global</button>
                <button class="chat-tab" data-tab="local">🏠 Lokal</button>
                <button class="chat-tab" data-tab="private">👥 Özel</button>
            </div>

            <!-- Chat Messages -->
            <div class="chat-messages" id="chat-messages">
                <div class="info-message">
                    Chat yükleniyor...
                </div>
            </div>

            <!-- Chat Input -->
            <div class="chat-input">
                <input 
                    type="text" 
                    id="message-input" 
                    placeholder="Mesaj yazın..."
                    maxlength="500"
                >
                <button class="send-btn" id="send-button" disabled>
                    ➤
                </button>
            </div>
        </div>

        <!-- Navigation -->
        <nav class="bottom-nav">
            <a href="/" class="nav-item">
                🏠 Ana Sayfa
            </a>
            <a href="/chat.html" class="nav-item active">
                💬 Chat
            </a>
            <a href="/marketplace.html" class="nav-item">
                🏪 Pazar
            </a>
            <a href="/profile.html" class="nav-item">
                👤 Profil
            </a>
        </nav>
    </div>

    <!-- Scripts -->
    <script src="/socket.io/socket.io.js"></script>
    <script src="/js/socket-client.js"></script>
    <script src="/js/chat.js"></script>
</body>
</html>
```

---

## 🚀 Development ve Deployment

### **Development Başlatma**
```bash
# Dependencies yükle
npm install

# Development mode başlat
npm run dev

# Production mode başlat
npm start
```

### **VS Code Launch Configuration**
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
            "runtimeExecutable": "nodemon"
        }
    ]
}
```

### **Database Migration Script**
```javascript
// scripts/migrate.js
const database = require('../config/database');

async function runMigrations() {
  console.log('🔄 Database migration başlıyor...');
  
  // Test verisi ekle
  await database.run(`
    INSERT OR REPLACE INTO users (id, phone_number, display_name, trust_score, money) 
    VALUES (1, '+905551234567', 'Test Kullanıcı', 150, 100)
  `);
  
  await database.run(`
    INSERT OR REPLACE INTO users (id, phone_number, display_name, trust_score, money) 
    VALUES (2, '+905557654321', 'Mentor Ahmet', 185, 500)
  `);
  
  console.log('✅ Test verileri eklendi');
}

runMigrations().catch(console.error);
```

### **Production Deployment**
```bash
# PM2 ile production deployment
npm install -g pm2

# Uygulamayı başlat
pm2 start server.js --name "ticaret-oyunu"

# Restart
pm2 restart ticaret-oyunu

# Logs
pm2 logs ticaret-oyunu

# Status
pm2 status
```

---

## 🔧 Sonraki Adımlar

### **V1.0 MVP Tamamlama:**
1. ✅ **Temel chat sistemi** (Socket.io)
2. ✅ **Bot mentor implementasyonu**
3. 🔄 **Basic authentication** (JWT)
4. 🔄 **Marketplace sistem**
5. 🔄 **Mobile responsive design**

### **V2.0 Özellikler:**
1. **Kontrat sistemi**
2. **Dolandırıcılık mekaniği** 
3. **Push notifications**
4. **Progressive Web App (PWA)**

**Bu Node.js implementasyonu ile MVP'yi 2-3 hafta içinde tamamlayabiliriz!** 🚀

**Geliştirme Süresi Tahmini:**
- **Hafta 1:** Core chat sistemi + Bot mentor
- **Hafta 2:** Authentication + Marketplace  
- **Hafta 3:** UI polish + Testing + Deploy

**Hazırlayan:** Musa & GitHub Copilot  
**Tarih:** 5 Ağustos 2025  
**Versiyon:** 2.0 - Node.js Implementation Guide

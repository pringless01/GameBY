# 📡 API & Socket.io Documentation - 2D Online Ticaret Oyunu

## 📋 API Genel Bakış

**Base URL:** `http://YOUR_VPS_IP:3000/api`  
**Authentication:** JWT Bearer Token  
**Content-Type:** `application/json`  
**Rate Limiting:** 100 req/min per IP  

---

## 🔐 Authentication Endpoints

### **POST /api/auth/register**
**Açıklama:** Telefon numarası ile kullanıcı kaydı

**Request:**
```json
{
  "phoneNumber": "+905551234567",
  "displayName": "Ahmet Yılmaz"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "SMS kodu gönderildi",
  "userId": 123,
  "verificationRequired": true
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Geçersiz telefon numarası",
  "code": "INVALID_PHONE"
}
```

### **POST /api/auth/verify**
**Açıklama:** SMS kodu doğrulama

**Request:**
```json
{
  "userId": 123,
  "smsCode": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "phoneNumber": "+905551234567",
    "displayName": "Ahmet Yılmaz",
    "trustScore": 100,
    "resources": {
      "wood": 0,
      "grain": 0,
      "money": 50
    }
  }
}
```

### **POST /api/auth/login**
**Açıklama:** Mevcut kullanıcı girişi

**Request:**
```json
{
  "phoneNumber": "+905551234567"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "SMS kodu gönderildi",
  "userId": 123
}
```

---

## 👤 User Endpoints

### **GET /api/user/profile**
**Açıklama:** Kullanıcı profili getir  
**Auth:** Required

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 123,
    "phoneNumber": "+905551234567",
    "displayName": "Ahmet Yılmaz",
    "trustScore": 185,
    "resources": {
      "wood": 15,
      "grain": 8,
      "money": 320
    },
    "mentorId": 456,
    "isOnline": true,
    "createdAt": "2025-08-05T10:00:00Z",
    "lastActive": "2025-08-05T14:30:00Z"
  }
}
```

### **PUT /api/user/profile**
**Açıklama:** Profil güncelle  
**Auth:** Required

**Request:**
```json
{
  "displayName": "Ahmet Yılmaz Jr."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profil güncellendi"
}
```

### **GET /api/user/stats**
**Açıklama:** Kullanıcı istatistikleri  
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalTransactions": 24,
    "successfulDeals": 22,
    "totalEarnings": 1500,
    "daysActive": 12,
    "mentorshipCount": 3,
    "businessCount": 1
  }
}
```

---

## 💬 Chat Endpoints

### **GET /api/chat/messages**
**Açıklama:** Global chat mesajları getir  
**Auth:** Required

**Query Parameters:**
- `limit`: Mesaj sayısı (default: 50, max: 100)
- `before`: Bu ID'den önceki mesajlar

**Example:** `GET /api/chat/messages?limit=30&before=1234`

**Response (200):**
```json
{
  "success": true,
  "messages": [
    {
      "id": 1234,
      "userId": 123,
      "userName": "Ahmet Yılmaz",
      "userTrustScore": 185,
      "message": "Balta satıyorum, kimse var mı?",
      "isBot": false,
      "createdAt": "2025-08-05T14:25:00Z"
    },
    {
      "id": 1235,
      "userId": "bot_mentor",
      "userName": "🤖 Rehber Ali",
      "userTrustScore": 200,
      "message": "Yeni başlayanlar buraya! Size yardım edebilirim.",
      "isBot": true,
      "createdAt": "2025-08-05T14:26:00Z"
    }
  ],
  "hasMore": true
}
```

### **POST /api/chat/send**
**Açıklama:** Chat mesajı gönder  
**Auth:** Required

**Request:**
```json
{
  "message": "Merhaba herkese! Yeni başladım."
}
```

**Response (200):**
```json
{
  "success": true,
  "messageId": 1236,
  "message": "Mesaj gönderildi"
}
```

**Error (429):**
```json
{
  "success": false,
  "error": "Çok fazla mesaj gönderiyorsunuz",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 30
}
```

### **GET /api/chat/online**
**Açıklama:** Online kullanıcı sayısı  
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "onlineCount": 24,
  "onlineUsers": [
    {
      "id": 123,
      "displayName": "Ahmet",
      "trustScore": 185
    }
  ]
}
```

---

## 🏪 Marketplace Endpoints

### **GET /api/marketplace/items**
**Açıklama:** Satılık ürünler listesi  
**Auth:** Required

**Query Parameters:**
- `type`: wood, grain, business
- `sortBy`: price, date, seller_trust
- `order`: asc, desc

**Response (200):**
```json
{
  "success": true,
  "items": [
    {
      "id": 1,
      "sellerId": 456,
      "sellerName": "Mehmet Bey",
      "sellerTrustScore": 175,
      "itemType": "wood",
      "quantity": 10,
      "pricePerUnit": 15,
      "totalPrice": 150,
      "createdAt": "2025-08-05T13:00:00Z"
    }
  ]
}
```

### **POST /api/marketplace/buy**
**Açıklama:** Ürün satın alma  
**Auth:** Required

**Request:**
```json
{
  "itemId": 1,
  "quantity": 5
}
```

**Response (200):**
```json
{
  "success": true,
  "transactionId": 789,
  "message": "Satın alma başarılı",
  "newBalance": {
    "wood": 20,
    "money": 245
  }
}
```

### **POST /api/marketplace/sell**
**Açıklama:** Ürün satışa çıkar  
**Auth:** Required

**Request:**
```json
{
  "itemType": "wood",
  "quantity": 8,
  "pricePerUnit": 12
}
```

**Response (200):**
```json
{
  "success": true,
  "listingId": 234,
  "message": "Ürün satışa çıkarıldı"
}
```

---

## 🤝 Mentor Endpoints

### **GET /api/mentor/available**
**Açıklama:** Müsait mentorlar listesi  
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "mentors": [
    {
      "id": 456,
      "displayName": "Mentor Ahmet",
      "trustScore": 195,
      "experienceLevel": "advanced",
      "studentCount": 5,
      "isAvailable": true,
      "specialties": ["işletme", "ticaret"]
    }
  ]
}
```

### **POST /api/mentor/request**
**Açıklama:** Mentor talep et  
**Auth:** Required

**Request:**
```json
{
  "mentorId": 456,
  "message": "Merhaba, yeni başladım. Yardım alabilir miyim?"
}
```

**Response (200):**
```json
{
  "success": true,
  "requestId": 123,
  "message": "Mentor talebi gönderildi"
}
```

---

## ⭐ Trust Score Endpoints

### **POST /api/trust/vote**
**Açıklama:** Kullanıcıya güven oyu ver  
**Auth:** Required

**Request:**
```json
{
  "targetUserId": 456,
  "score": 5,
  "comment": "Çok güvenilir bir kişi, işlemleri zamanında tamamlıyor"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Güven oyu kaydedildi",
  "newTrustScore": 187
}
```

### **GET /api/trust/history/:userId**
**Açıklama:** Kullanıcının güven geçmişi  
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "trustHistory": [
    {
      "voterId": 123,
      "voterName": "Ahmet",
      "score": 5,
      "comment": "Güvenilir ortak",
      "createdAt": "2025-08-05T12:00:00Z"
    }
  ],
  "averageScore": 4.7,
  "totalVotes": 25
}
```

---

## 🏗️ Game Activity Endpoints

### **POST /api/activity/chop-wood**
**Açıklama:** Odun kesme aktivitesi  
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "result": {
    "woodGained": 1,
    "newWoodCount": 16,
    "experienceGained": 5
  }
}
```

### **POST /api/activity/farm**
**Açıklama:** Çiftçilik aktivitesi  
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "result": {
    "grainGained": 2,
    "newGrainCount": 10,
    "experienceGained": 8
  }
}
```

---

## 🚨 Error Codes

### **HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (geçersiz data)
- `401` - Unauthorized (token eksik/geçersiz)
- `403` - Forbidden (yetkisiz işlem)
- `404` - Not Found (kaynak bulunamadı)
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

### **Custom Error Codes:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Error Code List:**
- `INVALID_PHONE` - Geçersiz telefon numarası
- `INVALID_SMS_CODE` - Geçersiz SMS kodu
- `USER_NOT_FOUND` - Kullanıcı bulunamadı
- `INSUFFICIENT_FUNDS` - Yetersiz bakiye
- `RATE_LIMIT_EXCEEDED` - Çok fazla istek
- `MENTOR_NOT_AVAILABLE` - Mentor müsait değil
- `DUPLICATE_VOTE` - Zaten oy verilmiş
- `INVALID_TRANSACTION` - Geçersiz işlem

---

## 🔌 Socket.io Events

### **Connection Events**

#### **Client → Server**

**`connect`**
```javascript
// Otomatik bağlantı event'i
socket.on('connect', () => {
  console.log('Server\'a bağlandı:', socket.id);
});
```

**`join_chat`**
```javascript
// Chat odasına katıl
socket.emit('join_chat', {
  userId: 123,
  token: 'jwt_token_here'
});
```

**`send_message`**
```javascript
// Mesaj gönder
socket.emit('send_message', {
  userId: 123,
  userName: 'Ahmet',
  userTrustScore: 185,
  message: 'Merhaba herkese!'
});
```

**`typing_start`**
```javascript
// Yazma başladı
socket.emit('typing_start', {
  userId: 123,
  userName: 'Ahmet'
});
```

**`typing_stop`**
```javascript
// Yazma durdu
socket.emit('typing_stop', {
  userId: 123
});
```

#### **Server → Client**

**`new_message`**
```javascript
// Yeni mesaj geldi
socket.on('new_message', (data) => {
  console.log('Yeni mesaj:', data);
  /*
  {
    id: 1234,
    userId: 123,
    userName: 'Ahmet',
    userTrustScore: 185,
    message: 'Merhaba!',
    isBot: false,
    timestamp: '2025-08-05T14:30:00Z'
  }
  */
});
```

**`user_joined`**
```javascript
// Kullanıcı chate katıldı
socket.on('user_joined', (data) => {
  /*
  {
    userId: 123,
    userName: 'Ahmet',
    trustScore: 185
  }
  */
});
```

**`user_left`**
```javascript
// Kullanıcı chaten ayrıldı
socket.on('user_left', (data) => {
  /*
  {
    userId: 123,
    userName: 'Ahmet'
  }
  */
});
```

**`online_count_updated`**
```javascript
// Online kullanıcı sayısı güncellendi
socket.on('online_count_updated', (count) => {
  console.log('Online kullanıcı:', count);
});
```

**`typing_indicator`**
```javascript
// Yazma göstergesi
socket.on('typing_indicator', (data) => {
  /*
  {
    userId: 123,
    userName: 'Ahmet',
    isTyping: true
  }
  */
});
```

**`bot_message`**
```javascript
// Bot mesajı
socket.on('bot_message', (data) => {
  /*
  {
    message: 'Merhaba! Size nasıl yardım edebilirim?',
    type: 'welcome', // welcome, tip, quest, warning
    userId: 123 // hedef kullanıcı
  }
  */
});
```

**`trust_update`**
```javascript
// İtibar puanı güncellendi
socket.on('trust_update', (data) => {
  /*
  {
    userId: 123,
    newTrustScore: 187,
    change: +2
  }
  */
});
```

**`transaction_notification`**
```javascript
// İşlem bildirimi
socket.on('transaction_notification', (data) => {
  /*
  {
    type: 'sale_completed',
    buyerName: 'Mehmet',
    itemType: 'wood',
    quantity: 5,
    totalPrice: 75
  }
  */
});
```

**`error`**
```javascript
// Hata mesajı
socket.on('error', (data) => {
  /*
  {
    message: 'Mesaj gönderilemedi',
    code: 'RATE_LIMIT_EXCEEDED'
  }
  */
});
```

### **Real-time Game Events**

**`resource_updated`**
```javascript
// Kaynak güncellemesi
socket.on('resource_updated', (data) => {
  /*
  {
    userId: 123,
    resources: {
      wood: 15,
      grain: 8,
      money: 320
    }
  }
  */
});
```

**`mentor_request`**
```javascript
// Mentor talebi
socket.on('mentor_request', (data) => {
  /*
  {
    studentId: 123,
    studentName: 'Ahmet',
    message: 'Yardım alabilir miyim?'
  }
  */
});
```

**`mentor_response`**
```javascript
// Mentor yanıtı
socket.on('mentor_response', (data) => {
  /*
  {
    mentorId: 456,
    mentorName: 'Mentor Ahmet',
    accepted: true,
    message: 'Tabii ki! Hemen başlayalım.'
  }
  */
});
```

---

## 🛠️ Client Implementation Examples

### **JavaScript (Web)**
```javascript
// Socket.io client setup
const socket = io('http://YOUR_VPS_IP:3000', {
  auth: {
    token: localStorage.getItem('jwt_token')
  }
});

// Mesaj gönderme
function sendMessage(message) {
  const userData = JSON.parse(localStorage.getItem('user'));
  
  socket.emit('send_message', {
    userId: userData.id,
    userName: userData.displayName,
    userTrustScore: userData.trustScore,
    message: message
  });
}

// Mesaj dinleme
socket.on('new_message', (data) => {
  const chatContainer = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  messageElement.innerHTML = `
    <div class="message">
      <strong>${data.userName} (⭐${data.userTrustScore}):</strong>
      ${data.message}
      <small>${new Date(data.timestamp).toLocaleTimeString()}</small>
    </div>
  `;
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
});

// Online sayısı
socket.on('online_count_updated', (count) => {
  document.getElementById('online-count').textContent = count;
});
```

### **API Call Example**
```javascript
// Authentication
async function login(phoneNumber) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ phoneNumber })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // SMS kodu gönderildi
    showSMSVerification(data.userId);
  } else {
    showError(data.error);
  }
}

// SMS verification
async function verifySMS(userId, smsCode) {
  const response = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, smsCode })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('jwt_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = '/dashboard.html';
  } else {
    showError(data.error);
  }
}

// Authenticated API call
async function getUserProfile() {
  const token = localStorage.getItem('jwt_token');
  
  const response = await fetch('/api/user/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.status === 401) {
    // Token expired, redirect to login
    localStorage.removeItem('jwt_token');
    window.location.href = '/login.html';
    return;
  }
  
  const data = await response.json();
  return data.user;
}
```

---

## 📊 Rate Limiting

### **Endpoint Limits:**
- **Authentication:** 5 req/min per IP
- **Chat messages:** 20 req/min per user
- **API calls:** 100 req/min per IP
- **Socket connections:** 10 per IP

### **Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1628097600
```

---

## 🔒 Security

### **JWT Token:**
- **Algorithm:** HS256
- **Expiry:** 7 days
- **Refresh:** Automatic (silent refresh)

### **Input Validation:**
- Phone number: E.164 format
- Messages: Max 500 characters, HTML stripped
- User names: Max 50 characters, alphanumeric + spaces

### **SQL Injection Protection:**
- Parameterized queries
- Input sanitization
- Type validation

---

Bu API documentation ile frontend development ve API integration çok daha kolay! 📡

**Hazırlayan:** Musa & GitHub Copilot  
**Tarih:** 5 Ağustos 2025  
**Versiyon:** 1.0 - Complete API Reference

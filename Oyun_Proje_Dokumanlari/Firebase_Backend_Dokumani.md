# 🔥 Firebase Backend Dokümantasyonu - 2D Mobil Online Ticaret Oyunu

## 📋 Firebase Ecosystem Genel Bakış

### **Kullanılan Firebase Servisleri**
- **🔐 Firebase Authentication** - SMS doğrulama ve kullanıcı yönetimi
- **📊 Cloud Firestore** - Real-time NoSQL database
- **⚡ Cloud Functions** - Serverless backend logic
- **📱 Firebase Messaging** - Push notifications
- **📈 Firebase Analytics** - Kullanıcı davranış analizi
- **🗂️ Firebase Storage** - Profil fotoğrafları ve medya
- **⚙️ Firebase Remote Config** - Feature flags ve ayarlar

---

## 🗄️ Database Schema (Cloud Firestore)

### **1. 👥 Users Collection**
```javascript
// Collection: users
// Document ID: {userId}
{
  uid: "user123456",
  phoneNumber: "+905551234567",
  displayName: "Ahmet Yılmaz",
  profilePhotoUrl: "https://storage.firebase.com/...",
  
  // İtibar sistemi
  trustScore: 185,
  trustVotes: [
    {
      voterId: "voter123",
      score: 5, // 1-5 arası
      comment: "Güvenilir ortak",
      timestamp: "2025-08-05T10:30:00Z"
    }
  ],
  
  // Kaynaklar
  resources: {
    wood: 15,
    grain: 8,
    money: 2450
  },
  
  // İşletmeler
  businesses: [
    {
      id: "business1",
      type: "lemonade_stand",
      name: "Limonata Standı",
      dailyIncome: 25,
      status: "active", // active, inactive, maintenance
      location: "merkez_plaza"
    }
  ],
  
  // Ünvanlar
  achievements: [
    "first_mentor",
    "entrepreneur",
    "trusted_partner"
  ],
  
  // Mentor sistemi
  mentorId: "mentor789", // Bot: "bot_mentor" veya gerçek kullanıcı ID
  isMentor: true,
  mentoredUsers: ["student1", "student2"],
  mentorScore: 95, // Mentor başarı puanı
  
  // Onboarding durumu
  onboardingStep: "find_mentor", // start, wood_chopping, marketplace, chat, find_mentor, completed
  onboardingCompleted: false,
  
  // Aktivite
  isOnline: true,
  lastActive: "2025-08-05T14:20:00Z",
  joinedAt: "2025-08-01T09:15:00Z",
  
  // Ayarlar
  settings: {
    notifications: true,
    chatNotifications: true,
    contractAlerts: true,
    language: "tr"
  },
  
  // İstatistikler
  stats: {
    totalTransactions: 24,
    successfulContracts: 18,
    failedContracts: 2,
    totalEarnings: 15600,
    daysActive: 5
  }
}
```

### **2. 💬 Chat Collection**
```javascript
// Collection: chats
// Document ID: Auto-generated
{
  messageId: "msg_789",
  userId: "user123",
  userName: "Ahmet Yılmaz",
  userTrustScore: 185,
  userPhotoUrl: "https://storage.firebase.com/...",
  
  // Mesaj içeriği
  message: "AVM projesine katılmak isteyen var mı? 500k yatırım!",
  messageType: "text", // text, image, contract_offer, system
  
  // Chat türü
  chatType: "global", // global, local, private, group
  chatRoomId: "global_main", // private mesajlar için room_user1_user2
  
  // Özel özellikler
  isBot: false,
  isSystem: false,
  mentionedUsers: ["user456", "user789"],
  attachments: [
    {
      type: "contract",
      contractId: "contract123",
      preview: "AVM Projesi - 30 İşletme"
    }
  ],
  
  // Moderasyon
  isModerated: false,
  moderationFlags: 0,
  reportedBy: [],
  
  // Zaman damgaları
  timestamp: "2025-08-05T14:25:00Z",
  editedAt: null,
  deletedAt: null,
  
  // React sistemi (gelecek versiyon)
  reactions: {
    "👍": ["user456", "user789"],
    "💰": ["user321"]
  }
}
```

### **3. 🤝 Contracts Collection**
```javascript
// Collection: contracts
// Document ID: Auto-generated
{
  contractId: "contract_456",
  
  // Taraflar
  creatorId: "user123",
  creatorName: "Ahmet Yılmaz",
  participants: [
    {
      userId: "user456",
      userName: "Mehmet Demir",
      role: "investor", // creator, investor, supplier
      investment: 500000, // TL
      expectedReturn: 750000, // TL
      shares: 5 // İşletme sayısı
    }
  ],
  
  // Proje detayları
  projectType: "shopping_mall", // shopping_mall, factory, apartment_complex
  projectName: "Merkez AVM",
  description: "30 işletmeli modern AVM projesi",
  
  // Finansal detaylar
  totalCost: 5000000, // TL
  currentFunding: 2500000, // TL
  requiredFunding: 5000000, // TL
  expectedProfit: 7500000, // TL
  
  // Zaman çizelgesi
  duration: 60, // gün
  startDate: "2025-08-05",
  expectedEndDate: "2025-10-04",
  milestones: [
    {
      name: "Zemin hazırlığı",
      deadline: "2025-08-20",
      status: "pending" // pending, in_progress, completed
    }
  ],
  
  // Kontrat durumu
  status: "funding", // draft, funding, active, completed, failed, disputed
  progress: 45, // % tamamlanma
  
  // Güvenlik ve risk
  riskLevel: "medium", // low, medium, high
  collateral: [
    {
      userId: "user123",
      assetType: "business",
      assetId: "business1",
      value: 100000
    }
  ],
  
  // Yasal
  terms: "Proje 60 gün içinde tamamlanacak. Gecikme durumunda %10 ceza.",
  signedBy: ["user123", "user456"],
  witnessId: "user789", // Güvenilir 3. taraf
  
  // Takip
  createdAt: "2025-08-05T10:00:00Z",
  signedAt: "2025-08-05T11:30:00Z",
  lastUpdated: "2025-08-05T14:20:00Z"
}
```

### **4. 💰 Transactions Collection**
```javascript
// Collection: transactions
// Document ID: Auto-generated
{
  transactionId: "txn_789",
  
  // Taraflar
  fromUserId: "user123",
  fromUserName: "Ahmet Yılmaz",
  toUserId: "user456",
  toUserName: "Mehmet Demir",
  
  // İşlem detayları
  type: "trade", // trade, contract_payment, mentor_fee, system_reward
  category: "resource", // resource, money, business, contract
  
  // Transfer edilen varlıklar
  items: [
    {
      type: "wood",
      quantity: 10,
      unitPrice: 15, // TL per unit
      totalValue: 150
    }
  ],
  money: 150, // TL
  
  // Kontrat bağlantısı
  contractId: "contract_123", // Eğer kontrat ödemesi ise
  
  // Durum
  status: "completed", // pending, completed, failed, disputed
  confirmation: {
    fromUserConfirmed: true,
    toUserConfirmed: true,
    confirmedAt: "2025-08-05T14:25:00Z"
  },
  
  // Güvenlik
  securityCode: "ABC123", // 6 haneli güvenlik kodu
  
  // Zaman damgaları
  createdAt: "2025-08-05T14:20:00Z",
  completedAt: "2025-08-05T14:25:00Z",
  
  // İtibar etkisi
  trustImpact: {
    fromUser: +2,
    toUser: +2
  }
}
```

### **5. 👥 Mentorships Collection**
```javascript
// Collection: mentorships
// Document ID: Auto-generated
{
  mentorshipId: "mentor_123",
  
  // İlişki
  mentorId: "user123",
  mentorName: "Ahmet Yılmaz",
  studentId: "user456",
  studentName: "Mehmet Demir",
  
  // Durum
  status: "active", // pending, active, completed, terminated
  startDate: "2025-08-05",
  
  // Bot mentor geçiş
  previousMentorId: "bot_mentor",
  transitionDate: "2025-08-05T15:00:00Z",
  
  // Başarı metrikleri
  goals: [
    {
      description: "İlk 1000 TL biriktirmek",
      targetAmount: 1000,
      currentAmount: 450,
      deadline: "2025-08-15",
      status: "in_progress"
    }
  ],
  
  // Mentor ödülleri
  mentorRewards: {
    trustPointsEarned: 25,
    bonusPayments: 500, // TL
    achievements: ["first_student", "successful_mentor"]
  },
  
  // İstatistikler
  stats: {
    sessionsCompleted: 8,
    goalsAchieved: 3,
    studentSatisfaction: 4.8, // 1-5 arası
    mentorRating: 4.9
  },
  
  // Son aktivite
  lastInteraction: "2025-08-05T14:30:00Z",
  totalHours: 12.5
}
```

### **6. 🏢 Businesses Collection**
```javascript
// Collection: businesses
// Document ID: Auto-generated
{
  businessId: "business_789",
  
  // Sahiplik
  ownerId: "user123",
  ownerName: "Ahmet Yılmaz",
  
  // İşletme bilgileri
  type: "lemonade_stand", // lemonade_stand, forest, farm, factory, shop
  name: "Merkez Limonata",
  description: "Şehrin en taze limonataları!",
  
  // Konum
  location: {
    region: "merkez",
    district: "plaza",
    coordinates: [39.9334, 32.8597] // Ankara
  },
  
  // Finansal durum
  dailyIncome: 75, // TL/gün
  operatingCosts: 25, // TL/gün
  netProfit: 50, // TL/gün
  totalEarnings: 2500, // TL (toplam)
  
  // Durum
  status: "active", // active, inactive, maintenance, for_sale
  level: 2, // İşletme seviyesi (1-10)
  efficiency: 85, // % verimlilik
  
  // Çalışanlar
  employees: [
    {
      userId: "user456",
      name: "Mehmet Demir",
      role: "operator",
      salary: 20, // TL/gün
      hiredAt: "2025-08-03"
    }
  ],
  
  // Yükseltmeler
  upgrades: [
    {
      name: "Premium Limon Sıkacağı",
      cost: 500,
      benefit: "+15 TL/gün gelir",
      purchasedAt: "2025-08-04"
    }
  ],
  
  // Market değeri
  marketValue: 5000, // TL
  salePrice: null, // Eğer satılık ise
  
  // Zaman damgaları
  createdAt: "2025-08-02T09:00:00Z",
  lastUpdated: "2025-08-05T14:20:00Z"
}
```

### **7. 📊 GameStats Collection (Global)**
```javascript
// Collection: gameStats
// Document ID: "global"
{
  // Oyuncu istatistikleri
  totalUsers: 1247,
  activeUsers: 856,
  newUsersToday: 23,
  
  // Ekonomi istatistikleri
  totalTransactions: 15678,
  totalMoney: 25000000, // TL
  averageWealthPerUser: 20064, // TL
  
  // Chat istatistikleri
  totalMessages: 45672,
  messagesPerDay: 1200,
  averageResponseTime: 45, // saniye
  
  // Mentor sistemi
  activeMentorships: 234,
  completedMentorships: 89,
  botMentorSessions: 567,
  
  // Kontrat sistemi
  activeContracts: 45,
  completedContracts: 123,
  failedContracts: 12,
  totalContractValue: 15000000, // TL
  
  // İşletmeler
  totalBusinesses: 890,
  activeBusinesses: 756,
  totalDailyIncome: 67500, // TL
  
  // Son güncelleme
  lastUpdated: "2025-08-05T14:30:00Z"
}
```

---

## ⚡ Cloud Functions

### **1. 🎯 Mentor Assignment Function**
```javascript
// functions/src/mentorAssignment.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.assignBotMentor = functions.auth.user().onCreate(async (user) => {
  const db = admin.firestore();
  
  try {
    // Yeni kullanıcı için profil oluştur
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      phoneNumber: user.phoneNumber,
      displayName: user.displayName || 'Yeni Oyuncu',
      trustScore: 100,
      resources: { wood: 0, grain: 0, money: 50 },
      mentorId: 'bot_mentor',
      onboardingStep: 'start',
      onboardingCompleted: false,
      isOnline: true,
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActive: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Bot mentor ile mentorship oluştur
    await db.collection('mentorships').add({
      mentorId: 'bot_mentor',
      mentorName: '🤖 Rehber Ali',
      studentId: user.uid,
      studentName: user.displayName || 'Yeni Oyuncu',
      status: 'active',
      startDate: admin.firestore.FieldValue.serverTimestamp(),
      goals: [
        {
          description: 'İlk 100 TL kazanmak',
          targetAmount: 100,
          currentAmount: 50,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün sonra
          status: 'in_progress'
        }
      ]
    });
    
    // 5 saniye sonra bot mentor onboarding başlat
    setTimeout(async () => {
      await startBotOnboarding(user.uid);
    }, 5000);
    
    console.log(`Yeni kullanıcı ${user.uid} için bot mentor atandı`);
    
  } catch (error) {
    console.error('Bot mentor atama hatası:', error);
  }
});

async function startBotOnboarding(userId) {
  const db = admin.firestore();
  
  const welcomeMessages = [
    'Merhaba! Ben Rehber Ali 🤖',
    'Oyuna yeni başladığını gördüm. Sana yardım edeceğim!',
    'Bu oyunda tek başına bir hiçsin 😅',
    'Ama doğru insanlarla tanışırsan, milyoner olabilirsin! 💰'
  ];
  
  for (let i = 0; i < welcomeMessages.length; i++) {
    setTimeout(async () => {
      await db.collection('chats').add({
        userId: 'bot_mentor',
        userName: '🤖 Rehber Ali',
        userTrustScore: 200,
        message: welcomeMessages[i],
        chatType: 'global',
        chatRoomId: 'global_main',
        isBot: true,
        mentionedUsers: [userId],
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }, i * 3000); // 3 saniye arayla
  }
}
```

### **2. 📈 Trust Score Calculator**
```javascript
// functions/src/trustCalculator.js
exports.calculateTrustScore = functions.firestore
  .document('transactions/{transactionId}')
  .onCreate(async (snap, context) => {
    const transaction = snap.data();
    const db = admin.firestore();
    
    if (transaction.status === 'completed') {
      // Her iki kullanıcının güven puanını artır
      await updateTrustScore(transaction.fromUserId, +2);
      await updateTrustScore(transaction.toUserId, +2);
      
      console.log(`Trust scores updated for transaction ${context.params.transactionId}`);
    }
  });

exports.handleContractCompletion = functions.firestore
  .document('contracts/{contractId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    
    // Kontrat completed oldu
    if (beforeData.status !== 'completed' && afterData.status === 'completed') {
      // Tüm katılımcıların güven puanını artır
      const participants = afterData.participants || [];
      const creatorId = afterData.creatorId;
      
      await updateTrustScore(creatorId, +10); // Proje sahibi daha fazla puan
      
      for (const participant of participants) {
        await updateTrustScore(participant.userId, +5);
      }
    }
    
    // Kontrat failed oldu
    if (beforeData.status !== 'failed' && afterData.status === 'failed') {
      const creatorId = afterData.creatorId;
      await updateTrustScore(creatorId, -15); // Büyük ceza
      
      // Katılımcılar küçük ceza alır
      for (const participant of afterData.participants || []) {
        await updateTrustScore(participant.userId, -5);
      }
    }
  });

async function updateTrustScore(userId, change) {
  const db = admin.firestore();
  const userRef = db.collection('users').doc(userId);
  
  await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists) return;
    
    const currentScore = userDoc.data().trustScore || 100;
    const newScore = Math.max(0, Math.min(200, currentScore + change)); // 0-200 arası
    
    transaction.update(userRef, { 
      trustScore: newScore,
      lastTrustUpdate: admin.firestore.FieldValue.serverTimestamp()
    });
  });
}
```

### **3. 💬 Chat Moderation Function**
```javascript
// functions/src/chatModeration.js
exports.moderateChat = functions.firestore
  .document('chats/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const db = admin.firestore();
    
    // Spam kontrolü
    if (await isSpam(message)) {
      await snap.ref.update({
        isModerated: true,
        moderationReason: 'spam'
      });
      return;
    }
    
    // Küfür kontrolü
    if (containsProfanity(message.message)) {
      await snap.ref.update({
        isModerated: true,
        moderationReason: 'profanity',
        message: '*** Bu mesaj otomatik olarak gizlendi ***'
      });
      return;
    }
    
    // Dolandırıcılık tespiti
    if (await isSuspiciousOffer(message)) {
      await snap.ref.update({
        isModerated: true,
        moderationReason: 'suspicious_offer'
      });
      
      // Kullanıcıyı uyar
      await sendWarningNotification(message.userId);
    }
  });

async function isSpam(message) {
  const db = admin.firestore();
  const oneMinuteAgo = new Date(Date.now() - 60000);
  
  const recentMessages = await db.collection('chats')
    .where('userId', '==', message.userId)
    .where('timestamp', '>', oneMinuteAgo)
    .get();
  
  return recentMessages.size > 5; // 1 dakikada 5'ten fazla mesaj = spam
}

function containsProfanity(text) {
  const badWords = ['küfür1', 'küfür2']; // Türkçe küfür listesi
  return badWords.some(word => text.toLowerCase().includes(word));
}
```

### **4. 🏢 Business Income Calculator**
```javascript
// functions/src/businessIncome.js
exports.calculateDailyIncome = functions.pubsub
  .schedule('0 0 * * *') // Her gün gece yarısı
  .timeZone('Europe/Istanbul')
  .onRun(async (context) => {
    const db = admin.firestore();
    
    const businessesSnapshot = await db.collection('businesses')
      .where('status', '==', 'active')
      .get();
    
    const batch = db.batch();
    
    businessesSnapshot.forEach(doc => {
      const business = doc.data();
      const dailyIncome = business.dailyIncome || 0;
      const ownerId = business.ownerId;
      
      // İşletme sahibinin parasını artır
      const userRef = db.collection('users').doc(ownerId);
      batch.update(userRef, {
        'resources.money': admin.firestore.FieldValue.increment(dailyIncome),
        lastIncomeUpdate: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // İşletme toplam kazancını güncelle
      batch.update(doc.ref, {
        totalEarnings: admin.firestore.FieldValue.increment(dailyIncome),
        lastIncomeCalculated: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log(`Daily income calculated for ${businessesSnapshot.size} businesses`);
  });
```

### **5. 📱 Push Notifications**
```javascript
// functions/src/notifications.js
exports.sendChatNotification = functions.firestore
  .document('chats/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    
    // Sadece mention edilen kullanıcılara bildirim gönder
    if (message.mentionedUsers && message.mentionedUsers.length > 0) {
      for (const userId of message.mentionedUsers) {
        await sendNotificationToUser(userId, {
          title: `💬 ${message.userName}`,
          body: message.message.substring(0, 100),
          data: {
            type: 'chat_mention',
            messageId: context.params.messageId,
            senderId: message.userId
          }
        });
      }
    }
  });

exports.sendContractNotification = functions.firestore
  .document('contracts/{contractId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    
    // Kontrat durumu değişti
    if (beforeData.status !== afterData.status) {
      const participants = afterData.participants || [];
      
      for (const participant of participants) {
        await sendNotificationToUser(participant.userId, {
          title: '🤝 Kontrat Güncellemesi',
          body: `${afterData.projectName} projesinin durumu: ${afterData.status}`,
          data: {
            type: 'contract_update',
            contractId: context.params.contractId,
            status: afterData.status
          }
        });
      }
    }
  });

async function sendNotificationToUser(userId, notification) {
  const db = admin.firestore();
  
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return;
    
    const userData = userDoc.data();
    if (!userData.fcmToken || !userData.settings?.notifications) return;
    
    await admin.messaging().send({
      token: userData.fcmToken,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data,
      android: {
        priority: 'high',
        notification: {
          icon: 'ic_notification',
          color: '#2E7D32',
          sound: 'default'
        }
      }
    });
    
  } catch (error) {
    console.error(`Notification send error for user ${userId}:`, error);
  }
}
```

---

## 🔒 Security Rules

### **Firestore Security Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      // Kendi profilini okuyabilir ve güncelleyebilir
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Başkalarının profillerini sadece okuyabilir
      allow read: if request.auth != null;
      
      // Güven puanını sadece Cloud Functions güncelleyebilir
      allow update: if request.auth != null && 
        request.auth.uid == userId && 
        !('trustScore' in request.resource.data) ||
        request.resource.data.trustScore == resource.data.trustScore;
    }
    
    // Chat collection
    match /chats/{messageId} {
      // Kimlik doğrulanmış kullanıcılar okuyabilir ve yazabilir
      allow read, create: if request.auth != null;
      
      // Sadece kendi mesajlarını güncelleyebilir/silebilir
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      
      // Bot mesajları sadece Cloud Functions tarafından oluşturulabilir
      allow create: if request.auth == null && 
        request.resource.data.userId == 'bot_mentor';
    }
    
    // Contracts collection
    match /contracts/{contractId} {
      // Kimlik doğrulanmış kullanıcılar okuyabilir
      allow read: if request.auth != null;
      
      // Sadece proje sahibi kontrat oluşturabilir
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.creatorId;
      
      // Proje sahibi veya katılımcılar güncelleyebilir
      allow update: if request.auth != null && (
        request.auth.uid == resource.data.creatorId ||
        request.auth.uid in resource.data.participants[].userId
      );
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      // İlgili kullanıcılar okuyabilir
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.fromUserId ||
        request.auth.uid == resource.data.toUserId
      );
      
      // Gönderen kullanıcı oluşturabilir
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.fromUserId;
      
      // Her iki taraf da onaylayabilir
      allow update: if request.auth != null && (
        request.auth.uid == resource.data.fromUserId ||
        request.auth.uid == resource.data.toUserId
      ) && resource.data.status == 'pending';
    }
    
    // Businesses collection
    match /businesses/{businessId} {
      // Herkes okuyabilir
      allow read: if request.auth != null;
      
      // Sadece sahibi oluşturabilir ve güncelleyebilir
      allow create, update: if request.auth != null && 
        request.auth.uid == request.resource.data.ownerId;
      
      // Sadece sahibi silebilir
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
    }
    
    // Mentorships collection
    match /mentorships/{mentorshipId} {
      // Mentor ve öğrenci okuyabilir
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.mentorId ||
        request.auth.uid == resource.data.studentId
      );
      
      // Mentor oluşturabilir ve güncelleyebilir
      allow create, update: if request.auth != null && 
        request.auth.uid == request.resource.data.mentorId;
    }
    
    // Game stats - sadece okuma
    match /gameStats/{document=**} {
      allow read: if request.auth != null;
      allow write: if false; // Sadece Cloud Functions
    }
  }
}
```

### **Firebase Storage Rules**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Profil fotoğrafları
    match /profile_photos/{userId}/{allPaths=**} {
      // Sadece kendi profil fotoğrafını yükleyebilir
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
      
      // Dosya boyutu kontrolü (max 5MB)
      allow write: if request.resource.size < 5 * 1024 * 1024 &&
        request.resource.contentType.matches('image/.*');
    }
    
    // İşletme fotoğrafları
    match /business_photos/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == userId &&
        request.resource.size < 10 * 1024 * 1024;
    }
    
    // Chat ekleri
    match /chat_attachments/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == userId &&
        request.resource.size < 20 * 1024 * 1024;
    }
  }
}
```

---

## 📈 Analytics ve Monitoring

### **Firebase Analytics Events**
```javascript
// Analytics tracking
const analytics = {
  // Kullanıcı onboarding
  trackOnboardingStep: (step) => {
    analytics().logEvent('onboarding_step', {
      step: step, // start, wood_chopping, marketplace, chat, find_mentor
      timestamp: Date.now()
    });
  },
  
  // Chat aktivitesi
  trackChatMessage: (type) => {
    analytics().logEvent('chat_message_sent', {
      message_type: type, // text, contract_offer, mentor_request
      chat_type: 'global'
    });
  },
  
  // Mentor sistemi
  trackMentorAssignment: (mentorType) => {
    analytics().logEvent('mentor_assigned', {
      mentor_type: mentorType, // bot, human
      assignment_time: Date.now()
    });
  },
  
  // İşlem takibi
  trackTransaction: (type, amount) => {
    analytics().logEvent('transaction_completed', {
      transaction_type: type,
      amount: amount,
      currency: 'TL'
    });
  },
  
  // Kontrat takibi
  trackContract: (action, projectType) => {
    analytics().logEvent('contract_action', {
      action: action, // created, signed, completed, failed
      project_type: projectType
    });
  }
};
```

### **Performance Monitoring**
```javascript
// Cloud Functions monitoring
exports.monitorPerformance = functions.pubsub
  .schedule('*/15 * * * *') // Her 15 dakikada
  .onRun(async (context) => {
    const db = admin.firestore();
    
    // Aktif kullanıcı sayısı
    const activeUsers = await db.collection('users')
      .where('isOnline', '==', true)
      .get();
    
    // Chat mesaj sayısı (son 15 dakika)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentMessages = await db.collection('chats')
      .where('timestamp', '>', fifteenMinutesAgo)
      .get();
    
    // İstatistikleri kaydet
    await db.collection('performance_metrics').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      activeUsers: activeUsers.size,
      messagesPerQuarter: recentMessages.size,
      serverLoad: process.memoryUsage().heapUsed / 1024 / 1024 // MB
    });
  });
```

---

## 🚀 Deployment ve DevOps

### **Firebase CLI Commands**
```bash
# Firebase CLI kurulumu
npm install -g firebase-tools

# Proje başlatma
firebase login
firebase init

# Cloud Functions deploy
firebase deploy --only functions

# Firestore rules deploy
firebase deploy --only firestore:rules

# Storage rules deploy
firebase deploy --only storage

# Tüm servisleri deploy
firebase deploy

# Specific function deploy
firebase deploy --only functions:assignBotMentor
```

### **Environment Configuration**
```javascript
// functions/.env
ANDROID_PACKAGE_NAME=com.ticaretoyunu.app
IOS_BUNDLE_ID=com.ticaretoyunu.app
DEEP_LINK_DOMAIN=ticaretoyunu.page.link
SMS_SENDER_ID=TICARET_OYUNU
ENCRYPTION_KEY=your_encryption_key_here
```

### **CI/CD Pipeline (GitHub Actions)**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: |
        cd functions
        npm install
        
    - name: Deploy to Firebase
      uses: w9jds/firebase-action@master
      with:
        args: deploy
      env:
        FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

## 🔧 Maintenance ve Optimization

### **Database Cleanup**
```javascript
// Eski mesajları temizleme (30 gün)
exports.cleanupOldMessages = functions.pubsub
  .schedule('0 2 * * *') // Her gün saat 02:00
  .onRun(async (context) => {
    const db = admin.firestore();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const oldMessages = await db.collection('chats')
      .where('timestamp', '<', thirtyDaysAgo)
      .limit(500)
      .get();
    
    const batch = db.batch();
    oldMessages.forEach(doc => batch.delete(doc.ref));
    
    await batch.commit();
    console.log(`Deleted ${oldMessages.size} old messages`);
  });
```

### **Backup Strategy**
```bash
# Firestore backup
gcloud firestore export gs://your-backup-bucket

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
gcloud firestore export gs://ticaretoyunu-backups/backup-$DATE
```

Bu kapsamlı Firebase backend dokümantasyonu ile oyunun tüm backend ihtiyaçları karşılanmış oluyor! 🔥

**Hazırlayan:** Musa & GitHub Copilot  
**Tarih:** 5 Ağustos 2025  
**Versiyon:** 1.0 - Firebase Backend Complete Guide

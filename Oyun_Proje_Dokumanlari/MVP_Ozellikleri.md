# 🚀 MVP Özellikleri - İlk Versiyon Gereksinimleri

## 📋 MVP Tanımı

**Minimum Viable Product (MVP):** Oyuncuların 30 dakikalık onboarding deneyimini yaşayabileceği ve temel ticaret işlemlerini gerçekleştirebileceği en basit versiyon.

**Hedef:** Konsepti kanıtlamak, kullanıcı geri bildirimi almak, temel sistemlerin çalıştığını görmek.

---

## 🎯 MVP Kapsamı - Neleri İçerir

### **1. 📱 Temel Uygulama Altyapısı**
- **Flutter app** (Android sadece, iOS sonra)
- **Firebase Authentication** (SMS doğrulama)
- **Cloud Firestore** (real-time database)
- **Basit UI/UX** (minimum design system)

### **2. 🤖 Bot Mentor Sistemi (Core Feature)**
**Olmazsa olmaz özellikler:**
- Bot karakter oluşturulması (Rehber Ali)
- İlk 15 dakikalık diyalog akışı
- Basit görev sistemi (odun kes, sat)
- Chat simulation (bot ile konuşma)

**MVP Bot Özellikleri:**
```dart
class BotMentor {
  String name = "Rehber Ali";
  int trustScore = 200;
  List<DialogNode> onboardingFlow;
  
  void startOnboarding(User newPlayer) {
    // 15 dakikalık onboarding başlat
  }
  
  void giveStarterPack() {
    // Balta + orman + 50 TL ver
  }
}
```

### **3. 💬 Basit Chat Sistemi**
**Minimum chat features:**
- Global chat odası (tek oda)
- Mesaj gönderme/alma
- Online oyuncu listesi
- İtibar puanı görünürlüğü

**MVP Chat UI:**
```
┌─────────────────────────────────────┐
│ Global Chat (12 kişi online)        │
├─────────────────────────────────────┤
│ Ahmet (⭐180): Balta satıyorum!     │
│ Mehmet (⭐165): Çiftlik kuruyorum   │
│ 🤖 Bot: Yeni başlayanlar buraya!   │
├─────────────────────────────────────┤
│ [Mesaj yaz...]           [Gönder]  │
└─────────────────────────────────────┘
```

### **4. 🏪 Basit Ekonomi Sistemi**
**Minimum economic features:**
- 3 kaynak türü: Odun, Tahıl, Para
- 2 aktivite: Odun kesme, Çiftçilik
- Basit marketplace (alım-satım)
- Inventory sistemi

**MVP Ekonomi:**
```dart
class Economy {
  Map<String, int> resources = {
    'odun': 0,
    'tahil': 0,
    'para': 50  // Başlangıç parası
  };
  
  void chopWood() {
    resources['odun'] += 1;
  }
  
  void sellWood() {
    resources['odun'] -= 1;
    resources['para'] += 10;
  }
}
```

### **5. ⭐ Basit İtibar Sistemi**
**Minimum trust features:**
- İtibar puanı (0-200)
- Basit oy verme sistemi
- Oyuncu profil sayfası
- İtibar geçmişi

**MVP İtibar UI:**
```
┌─────────────────────────────────────┐
│ 👤 Ahmet                           │
│ ⭐ İtibar: 180/200 (25 oy)         │
│ 📊 Son işlemler:                   │
│ ✅ Odun satışı (başarılı)          │
│ ✅ Çiftlik anlaşması (başarılı)    │
│ [👍 Güven] [👎 Güvenme] [💬 Mesaj] │
└─────────────────────────────────────┘
```

### **6. 🤝 Basit Mentor Sistemi**
**Minimum mentor features:**
- Bot → İnsan mentor geçişi (15dk sonra)
- Mentor arama listesi
- Basit mentor-çırak bağlantısı
- Mentor başarı takibi

### **7. 📊 Basit Dashboard**
**MVP Dashboard:**
```
┌─────────────────────────────────────┐
│ Musa (⭐185)            Para: 150TL │
├─────────────────────────────────────┤
│ [💬 Chat] [👤 Profil] [🏪 Pazar]   │
│ [🤖 Mentor] [⭐ İtibar] [⚙️ Ayar]  │
├─────────────────────────────────────┤
│ 🎯 Bu hafta hedefin: 200TL biriktir │
│ 📈 İlerleme: ████████░░ 75%        │
└─────────────────────────────────────┘
```

---

## ❌ MVP'ye DAHİL OLMAYAN Özellikler

### **Sonraki Versiyonlara Kalacak:**
- ❌ Kontrat sistemi (v2.0)
- ❌ Dolandırıcılık mekaniği (v2.0)
- ❌ AVM projeleri (v3.0)
- ❌ Büyük işletmeler (v2.0)
- ❌ iOS versiyonu (v1.5)
- ❌ Web versiyonu (v3.0)
- ❌ Gelişmiş animasyonlar (v2.0)
- ❌ Voice chat (v4.0)
- ❌ Oyun dışı para transferi (v3.0)

---

## 🏗️ MVP Teknik Gereksinimler

### **Frontend (Web App)**
```json
{
  "name": "ticaret-oyunu",
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "sqlite3": "^5.1.6",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.1",
    "cors": "^2.8.5",
    "helmet": "^7.0.0"
  }
}
```

### **Backend (Node.js + SQLite)**
- **SQLite Tables:**
  - `users` - Oyuncu profilleri
  - `chat_messages` - Global chat mesajları
  - `transactions` - Alım-satım işlemleri
  - `mentorships` - Mentor-çırak ilişkileri

### **Database Schema (MVP):**
```sql
-- users table
CREATE TABLE users (
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
  FOREIGN KEY (mentor_id) REFERENCES users(id)
);

-- chat_messages table  
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  user_name TEXT NOT NULL,
  user_trust_score INTEGER DEFAULT 0,
  message TEXT NOT NULL,
  is_bot BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### **Docker Deployment:**
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```
### **Deployment ve Migration:**
```bash
# Backup alma
./backup.sh

# Yeni server'da deployment
./quick-deploy.sh

# Migration
./migrate.sh backup_file.tar.gz

# Health check
curl http://your-domain.com/health
```

### **Cloud Functions (MVP):**
```javascript
// src/services/botMentorService.js
class BotMentorService {
  static async startOnboarding(userId) {
    // Yeni kullanıcıya bot mentor ata
  }
  
  static async calculateTrustScore(transactionData) {
    // İtibar puanı hesapla
  }
}
```

---

## 🎮 MVP User Journey (30 Dakika)

### **Dakika 0-5: Kayıt ve Giriş**
1. **App açılışı** → Splash screen
2. **Telefon numarası girişi** → SMS doğrulama
3. **İsim belirleme** → Profil oluşturma
4. **Başlangıç ekranı** → Bot mentor'a yönlendirme

### **Dakika 5-15: Bot Mentor Phase**
1. **Bot mentor tanıtımı** → Rehber Ali'yle tanışma
2. **Starter pack** → Balta + orman + 50 TL
3. **İlk aktivite** → Odun kesme öğretimi
4. **Marketplace kullanımı** → İlk satış deneyimi
5. **Chat öğretimi** → Global chat'te mesaj yazma

### **Dakika 15-25: Sosyal Fase**
1. **Chat'te aktivite** → Diğer oyuncularla konuşma
2. **Oyuncu profillerini inceleme** → İtibar puanlarını görme
3. **İlk basit anlaşma** → Küçük alım-satım
4. **Mentor arama** → Gerçek oyuncu mentor bulma

### **Dakika 25-30: İlerleme**
1. **Mentor ile tanışma** → İlk contact
2. **Hedef belirleme** → Uzun vadeli plan
3. **İkinci aktivite** → Çiftçilik deneme
4. **İlerleme görme** → Dashboard'ta progress

---

## 📊 MVP Success Metrics

### **Teknik Metrikler:**
- **App açılış süresi:** <3 saniye
- **SMS doğrulama:** <30 saniye
- **Chat mesaj gecikmesi:** <1 saniye
- **Crash rate:** <2%

### **Kullanıcı Metrikler:**
- **30 dakika tamamlama oranı:** >70%
- **Bot mentor memnuniyeti:** >80%
- **İkinci gün dönüş:** >50%
- **Mentor bulma başarısı:** >80%

### **İş Metrikler:**
- **Günlük aktif kullanıcı:** 50+
- **Günlük mesaj sayısı:** 200+
- **Günlük işlem sayısı:** 100+
- **Kullanıcı başına session süresi:** >15 dk

---

## 🚀 MVP Development Timeline

### **Hafta 1-2: Altyapı Kurulumu**
- Firebase projesi kurulumu
- Flutter app skeleton
- Authentication sistemi
- Temel UI components

### **Hafta 3-4: Bot Mentor Sistemi**
- Bot karakter implementasyonu
- Diyalog akış sistemi
- Başlangıç görevleri
- Starter pack sistemi

### **Hafta 5-6: Chat ve Sosyal**
- Global chat implementasyonu
- Real-time messaging
- Oyuncu profil sayfaları
- İtibar puanı sistemi

### **Hafta 7-8: Ekonomi Sistemi**
- Kaynak yönetimi
- Marketplace systemi
- Basit aktiviteler (odun kesme, çiftçilik)
- Transaction history

### **Hafta 9-10: Mentor Sistemi**
- Bot → insan geçişi
- Mentor arama ve eşleştirme
- Mentor-çırak ilişki yönetimi
- İlerleme takibi

### **Hafta 11-12: Test ve Polish**
- Bug fixing
- Performance optimization
- UI/UX iyileştirmeleri
- Beta testing

**Toplam:** 12 hafta (3 ay)

---

## 🔍 MVP Test Senaryoları

### **Temel Flow Testi:**
1. **Yeni kullanıcı kaydı** ✅
2. **Bot mentor onboarding** ✅
3. **İlk aktivite (odun kesme)** ✅
4. **İlk satış işlemi** ✅
5. **Chat'te mesaj gönderme** ✅
6. **Mentor bulma** ✅
7. **30 dakika deneyimini tamamlama** ✅

### **Edge Case Testleri:**
- SMS doğrulama başarısız
- Internet bağlantısı yok
- Mentor bulunamıyor
- Chat server down
- App crash recovery

### **Performance Testleri:**
- 50 eşzamanlı kullanıcı
- 100+ mesaj/dakika chat load
- Offline/online geçişler
- Memory usage monitoring

---

## 📋 MVP Launch Checklist

### **Pre-Launch:**
- [ ] Firebase security rules
- [ ] App store assets (icon, screenshots)
- [ ] Privacy policy & terms
- [ ] Analytics setup
- [ ] Crash reporting (Firebase Crashlytics)
- [ ] Beta test completion

### **Launch Day:**
- [ ] Play Store deployment
- [ ] Server monitoring aktif
- [ ] Support channels hazır
- [ ] Bug tracking aktif
- [ ] User feedback collection

### **Post-Launch:**
- [ ] Daily metrics monitoring
- [ ] User feedback analysis
- [ ] Bug priority assessment
- [ ] V2.0 feature planning

---

## 💡 MVP'den V2.0'a Geçiş Planı

### **V2.0 Öne Çıkan Özellikler:**
1. **Kontrat sistemi** - Çok oyunculu projeler
2. **Dolandırıcılık mekaniği** - Risk faktörü
3. **Büyük işletmeler** - AVM, fabrika
4. **iOS desteği** - Cross-platform
5. **Gelişmiş chat** - Özel gruplar, voice notes

### **V2.0 Success Criteria:**
- MVP kullanıcı retentionı >60%
- Günlük aktif kullanıcı >200
- Kontrat sistemi adoption >40%
- iOS/Android user parity

**Hazırlayan:** Musa & GitHub Copilot  
**Tarih:** 5 Ağustos 2025  
**Versiyon:** 1.0 - MVP Gereksinimleri ve Timeline

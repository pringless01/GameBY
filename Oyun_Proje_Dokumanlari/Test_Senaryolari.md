# 🧪 Test Senaryoları ve QA Dokümantasyonu - 2D Mobil Online Ticaret Oyunu

## 📋 Test Stratejisi Genel Bakış

### **Test Piramidi**
```
        🔺 E2E Tests (10%)
      🔻 Integration Tests (20%)
    🔴 Unit Tests (70%)
```

**Test Türleri:**
- **Unit Tests:** Flutter widget ve service testleri
- **Integration Tests:** Firebase entegrasyonu, API testleri
- **E2E Tests:** Kullanıcı senaryoları, 30 dakika onboarding
- **Performance Tests:** Load testing, memory usage
- **Security Tests:** Authentication, authorization
- **Usability Tests:** UX flow, accessibility

---

## 🎯 Kritik Test Senaryoları (30 Dakika MVP)

### **1. 📱 Onboarding Flow Testi**

#### **Senaryo 1.1: Başarılı Kayıt ve SMS Doğrulama**
```
Ön koşullar: 
- Geçerli telefon numarası
- Internet bağlantısı aktif
- Firebase SMS servisi çalışıyor

Test Adımları:
1. Uygulamayı aç
2. Telefon numarası gir: +905551234567
3. "SMS Gönder" butonuna bas
4. SMS kodunu bekle (max 60 saniye)
5. Gelen kodu gir: 123456
6. "Doğrula" butonuna bas
7. İsim belirleme ekranına geç
8. İsim gir: "Test Kullanıcı"
9. "Devam Et" butonuna bas

Beklenen Sonuç:
✅ SMS kodu başarıyla gelir
✅ Doğrulama başarılı olur
✅ Ana dashboard ekranına yönlendirilir
✅ Firebase'de kullanıcı profili oluşur
✅ Bot mentor otomatik atanır

Hata Senaryoları:
❌ SMS gelmiyor → "Tekrar gönder" seçeneği
❌ Yanlış kod → "Geçersiz kod" mesajı
❌ Zaman aşımı → "Kod süresi doldu" uyarısı
```

#### **Senaryo 1.2: Bot Mentor Onboarding (Dakika 5-15)**
```
Ön koşullar:
- Kullanıcı başarıyla kayıt olmuş
- Bot mentor atanmış
- Internet bağlantısı stabil

Test Adımları:
1. Dashboard'da chat bildirimi gelir
2. Chat ekranını aç
3. Rehber Ali'nin mesajlarını oku
4. "Merhaba" yazıp gönder
5. Bot'un yanıtını bekle (max 5 saniye)
6. [Odun Kes] butonuna bas
7. Inventory'de odun miktarını kontrol et
8. [Pazar] sekmesine git
9. Odunu satış listesine koy
10. Başka kullanıcı simüle et (satın alsın)
11. Para miktarının arttığını kontrol et

Beklenen Sonuç:
✅ Bot mesajları 3 saniye arayla gelir
✅ Kullanıcı mesajına bot yanıt verir
✅ Odun kesme başarılı olur (inventory +1)
✅ Pazar sistemi çalışır
✅ Para artışı doğru hesaplanır (50TL → 60TL)
✅ Bot tebrik mesajı gönderir

Performance KPIs:
⏱️ Bot yanıt süresi: <3 saniye
⏱️ Odun kesme işlemi: <1 saniye
⏱️ Para transfer süresi: <2 saniye
```

#### **Senaryo 1.3: Gerçek Mentor Bulma (Dakika 15-25)**
```
Ön koşullar:
- Bot onboarding tamamlanmış
- Sistemde en az 3 aktif mentor var
- Kullanıcı 100+ TL kazanmış

Test Adımları:
1. "Gerçek Mentor Ara" bildirimi gelir
2. Mentor listesi ekranını aç
3. Mentor filtreleri test et:
   - İtibar puanı: 180+ seç
   - Aktif durum: Online seç
   - Mentor deneyimi: 5+ öğrenci seç
4. Listeden bir mentor seç
5. Mentor profilini incele
6. "Mentörlük İste" butonuna bas
7. Kısa tanıtım mesajı yaz
8. İstek gönder
9. Mentor yanıtını bekle (test için auto-accept)
10. Mentor-öğrenci bağlantısı kurulsun

Beklenen Sonuç:
✅ En az 3 uygun mentor listeli
✅ Filtreler düzgün çalışır
✅ Mentor profili detaylı görüntülenir
✅ İstek gönderimi başarılı
✅ Mentorship kaydı oluşur
✅ Her iki tarafa bildirim gider

Edge Cases:
🔶 Mentor yok → "Şu an uygun mentor yok" mesajı
🔶 Tüm mentorlar meşgul → Bekleme listesi
🔶 İstek reddedilir → Alternatif öner
```

### **2. 💬 Chat Sistemi Testleri**

#### **Senaryo 2.1: Real-time Mesajlaşma**
```
Test Setup:
- 2 farklı cihazda aynı uygulamayı aç
- Kullanıcı A: "Ahmet" (⭐185)
- Kullanıcı B: "Mehmet" (⭐167)

Test Adımları:
1. Her iki kullanıcı da Global Chat'e gir
2. Kullanıcı A: "Merhaba herkese!" yaz
3. Kullanıcı B'nin ekranında mesajın görünmesini bekle
4. Kullanıcı B: "@Ahmet merhaba!" yanıtla
5. Kullanıcı A'ya mention bildirimi gitsin
6. Emoji reaksiyonu test et: 👍
7. Uzun mesaj yaz (500+ karakter)
8. Fotoğraf ekle (varsa)
9. Spam testi: 10 mesaj art arda gönder

Beklenen Sonuç:
✅ Mesajlar 1 saniye içinde karşı tarafta görünür
✅ Mention bildirimi çalışır
✅ İtibar puanları doğru görüntülenir
✅ Emoji reaksiyonları gerçek zamanlı
✅ Uzun mesajlar düzgün formatlanır
✅ Spam koruması 5. mesajdan sonra devreye girer

Performance Metrics:
⏱️ Mesaj delivery time: <1 saniye
⏱️ Chat load time: <2 saniye
📊 Concurrent users: 50+ kullanıcı aynı anda
```

#### **Senaryo 2.2: Chat Moderasyon Sistemi**
```
Test Verileri:
- Yasak kelimeler: ["küfür1", "dolandırıcı", "hile"]
- Spam limit: 5 mesaj/dakika
- Şüpheli link pattern: "http://suspicious.com"

Test Adımları:
1. Küfür içeren mesaj gönder
2. Otomatik moderasyon kontrolü
3. Spam mesajları gönder (6 mesaj/dakika)
4. Şüpheli link paylaş
5. Dolandırıcılık teklifi gönder: "Hızlı para kazanın! %500 getiri!"
6. Moderatör bildirimi kontrolü
7. Mesaj edit/delete test et

Beklenen Sonuç:
✅ Küfür otomatik olarak *** ile maskelenir
✅ Spam koruması devreye girer
✅ Şüpheli linkler engellenir
✅ Dolandırıcılık tespit edilir
✅ Moderatör bilgilendirilir
✅ Edit sadece 5 dakika içinde mümkün
```

### **3. 🤝 İtibar Sistemi Testleri**

#### **Senaryo 3.1: İtibar Puanı Hesaplama**
```
Başlangıç Durumu:
- Kullanıcı A: ⭐150 puan
- Kullanıcı B: ⭐140 puan

Test Senaryoları:
1. Başarılı alım-satım: A → B (50 TL)
   Beklenen: A +2, B +2 puan

2. Başarılı kontrat: 30 gün AVM projesi
   Beklenen: Proje sahibi +10, katılımcılar +5

3. Başarısız kontrat: Proje yarıda kalır
   Beklenen: Proje sahibi -15, katılımcılar -5

4. Dolandırıcılık raporu: 3 kişi raporlar
   Beklenen: -20 puan, "Şüpheli" etiketi

5. Mentor başarısı: Öğrenci hedefini tutar
   Beklenen: Mentor +15, öğrenci +10

Test Adımları:
1. Her senaryo için işlem gerçekleştir
2. Firebase Cloud Function'ın tetiklenmesini bekle
3. Kullanıcı profilinde puan değişimini kontrol et
4. Chat'te itibar rozeti güncellemesini doğrula
5. İtibar geçmişi kaydını kontrol et

Beklenen Sonuç:
✅ Tüm hesaplamalar doğru
✅ Real-time güncelleme (5 saniye içinde)
✅ İtibar geçmişi kaydediliyor
✅ Renk kodları doğru (150+ = sarı, 180+ = yeşil)
```

### **4. 🏪 İşletme Sistemi Testleri**

#### **Senaryo 4.1: İşletme Kurma ve Yönetme**
```
Test Verileri:
- Başlangıç parası: 200 TL
- Limonata standı maliyeti: 150 TL
- Günlük gelir: 25 TL

Test Adımları:
1. [İşletmeler] sekmesine git
2. "Yeni İşletme" butonuna bas
3. "Limonata Standı" seç
4. Konum seç: "Merkez Plaza"
5. Satın alma onayı ver
6. Para düşümünü kontrol et (200 → 50 TL)
7. İşletme listesinde görünmesini bekle
8. 24 saat bekle (veya simulate et)
9. Günlük gelir hesaplamasını kontrol et
10. İşletme upgrade seçeneklerini test et

Beklenen Sonuç:
✅ İşletme başarıyla kurulur
✅ Para doğru düşer
✅ İşletme aktif duruma geçer
✅ Günlük gelir doğru hesaplanır (25 TL)
✅ Upgrade seçenekleri görüntülenir

Business Logic Validation:
- Yetersiz para → "Yetersiz bakiye" uyarısı
- Maksimum işletme sayısı → "Limit doldu" mesajı
- Aynı konumda işletme → "Bu konum dolu" uyarısı
```

### **5. 🔐 Güvenlik Testleri**

#### **Senaryo 5.1: Authentication Security**
```
Test Senaryoları:
1. SQL Injection denemesi
2. XSS attack simulation
3. Brute force SMS attempts
4. Token manipulation
5. Unauthorized API calls

Test Adımları:
1. Telefon numarası alanına SQL inject et
2. Chat mesajına <script> tag ekle
3. 10 farklı SMS kodu 1 dakikada dene
4. JWT token'ı manuel olarak değiştir
5. Firestore'a direct access dene

Beklenen Sonuç:
✅ SQL injection engellenir
✅ XSS saldırısı temizlenir
✅ SMS rate limiting devreye girer
✅ Geçersiz token reddedilir
✅ Firestore rules çalışır
```

#### **Senaryo 5.2: Çoklu Hesap Kontrolü**
```
Test Setup:
- Aynı telefon numarası
- Aynı IP adresi
- Aynı cihaz ID

Test Adımları:
1. İlk hesapla normal kayıt ol
2. Çıkış yap
3. Aynı numarayla tekrar kayıt olmaya çalış
4. Farklı numara ama aynı IP ile kayıt ol
5. VPN ile IP değiştir, aynı numara dene
6. Mentor limitini test et (günde 3'ten fazla)

Beklenen Sonuç:
✅ Aynı numara 2. kez kullanılamaz
✅ Aynı IP'den 5+ hesap uyarısı
✅ Şüpheli davranış tespit edilir
✅ Mentor limiti uygulanır
```

---

## ⚡ Performance Test Senaryoları

### **6. 📊 Load Testing**

#### **Senaryo 6.1: Eşzamanlı Kullanıcı Testi**
```bash
# Artillery.js load testing
artillery run --target https://your-app.com performance-test.yml

# Test config
config:
  target: 'https://your-firebase-project.firebaseapp.com'
  phases:
    - duration: 60
      arrivalRate: 10  # 10 user/second
    - duration: 120
      arrivalRate: 20  # 20 user/second
    - duration: 60
      arrivalRate: 50  # 50 user/second (stress test)

scenarios:
  - name: "Chat Load Test"
    flow:
      - post:
          url: "/api/chat/send"
          json:
            message: "Load test message {{ $randomString() }}"
            userId: "user_{{ $randomInt(1, 100) }}"
```

**Performance Hedefleri:**
- **Response Time:** <2 saniye (P95)
- **Throughput:** 100 req/sec
- **Error Rate:** <1%
- **Memory Usage:** <500MB
- **CPU Usage:** <80%

#### **Senaryo 6.2: Database Performance**
```javascript
// Firestore performance test
const performanceTest = async () => {
  const startTime = Date.now();
  
  // 1000 eşzamanlı chat mesajı
  const promises = Array.from({length: 1000}, (_, i) => 
    firebase.firestore().collection('chats').add({
      userId: `user_${i % 100}`,
      message: `Performance test message ${i}`,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
  );
  
  await Promise.all(promises);
  const endTime = Date.now();
  
  console.log(`1000 mesaj ${endTime - startTime}ms'de gönderildi`);
  // Hedef: <5000ms
};
```

### **7. 📱 Mobile Performance Tests**

#### **Senaryo 7.1: Memory Usage Monitoring**
```dart
// Flutter memory test
class MemoryTest {
  static void runMemoryStressTest() {
    // 1000 chat mesajı yükle
    List<ChatMessage> messages = List.generate(1000, (i) => 
      ChatMessage(
        id: 'msg_$i',
        message: 'Test message $i',
        timestamp: DateTime.now(),
        userId: 'user_${i % 10}'
      )
    );
    
    // Memory usage ölç
    var info = ProcessInfo.currentRss;
    print('Memory usage: ${info / 1024 / 1024} MB');
    
    // Hedef: <200MB
  }
}
```

#### **Senaryo 7.2: Battery Usage Test**
```dart
// Battery optimization test
class BatteryTest {
  static Future<void> runBatteryTest() async {
    final stopwatch = Stopwatch()..start();
    
    // 30 dakikalık simulated usage
    while (stopwatch.elapsedMilliseconds < 30 * 60 * 1000) {
      // Chat mesajları çek
      await ChatService.getMessages();
      await Future.delayed(Duration(seconds: 2));
      
      // Konum güncelle
      await LocationService.updateLocation();
      await Future.delayed(Duration(seconds: 5));
    }
    
    // Battery drain ölç
    // Hedef: <5% battery drain in 30 minutes
  }
}
```

---

## 🔧 Automated Testing Pipeline

### **8. Unit Tests (Flutter)**

#### **Widget Tests**
```dart
// test/widgets/chat_message_widget_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:ticaret_oyunu/widgets/chat_message_widget.dart';

void main() {
  group('ChatMessageWidget Tests', () {
    testWidgets('Bot mesajı doğru stillendirilir', (WidgetTester tester) async {
      final botMessage = ChatMessage(
        id: 'test_1',
        userId: 'bot_mentor',
        userName: '🤖 Rehber Ali',
        userTrustScore: 200,
        message: 'Test bot mesajı',
        timestamp: DateTime.now(),
        isBot: true,
      );

      await tester.pumpWidget(MaterialApp(
        home: Scaffold(
          body: ChatMessageWidget(message: botMessage),
        ),
      ));

      expect(find.text('🤖 Rehber Ali'), findsOneWidget);
      expect(find.text('⭐ 200'), findsOneWidget);
      expect(find.text('Test bot mesajı'), findsOneWidget);
      
      // Bot mesajı özel stillendirilir
      final container = tester.widget<Container>(
        find.ancestor(
          of: find.text('Test bot mesajı'),
          matching: find.byType(Container),
        ),
      );
      
      expect(container.decoration?.color, equals(AppColors.chat.withOpacity(0.1)));
    });

    testWidgets('İtibar puanı rengi doğru', (WidgetTester tester) async {
      final highTrustMessage = ChatMessage(
        id: 'test_2',
        userId: 'user_1',
        userName: 'Güvenilir Kullanıcı',
        userTrustScore: 185,
        message: 'Yüksek itibar mesajı',
        timestamp: DateTime.now(),
      );

      await tester.pumpWidget(MaterialApp(
        home: ChatMessageWidget(message: highTrustMessage),
      ));

      final trustBadge = tester.widget<Container>(
        find.ancestor(
          of: find.text('⭐ 185'),
          matching: find.byType(Container),
        ),
      );

      expect(trustBadge.decoration?.color, equals(AppColors.trustHigh));
    });
  });
}
```

#### **Service Tests**
```dart
// test/services/chat_service_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:ticaret_oyunu/services/chat_service.dart';

class MockFirestore extends Mock implements FirebaseFirestore {}

void main() {
  group('ChatService Tests', () {
    late MockFirestore mockFirestore;
    late ChatService chatService;

    setUp(() {
      mockFirestore = MockFirestore();
      chatService = ChatService();
    });

    test('Mesaj gönderme başarılı', () async {
      // Arrange
      const testMessage = 'Test mesajı';
      const testUserId = 'user_123';
      
      when(mockFirestore.collection('chats').add(any))
          .thenAnswer((_) async => MockDocumentReference());

      // Act
      await chatService.sendMessage(testMessage);

      // Assert
      verify(mockFirestore.collection('chats').add(
        argThat(contains({'message': testMessage}))
      )).called(1);
    });

    test('Spam koruması çalışır', () async {
      // Arrange
      const spamMessage = 'Spam mesajı';
      
      // 6 mesaj art arda gönder
      for (int i = 0; i < 6; i++) {
        await chatService.sendMessage(spamMessage);
      }

      // Assert - 6. mesaj engellenmeli
      // Implementasyon detayına göre doğrulama
    });
  });
}
```

### **9. Integration Tests**

#### **Firebase Integration Test**
```dart
// integration_test/firebase_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:ticaret_oyunu/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Firebase Integration Tests', () {
    testWidgets('Kullanıcı kaydı ve bot mentor ataması', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Telefon numarası gir
      await tester.enterText(
        find.byKey(const Key('phone_input')),
        '+905551234567'
      );
      
      await tester.tap(find.byKey(const Key('send_sms_button')));
      await tester.pumpAndSettle();

      // SMS kodu gir (test environment)
      await tester.enterText(
        find.byKey(const Key('sms_code_input')),
        '123456'
      );
      
      await tester.tap(find.byKey(const Key('verify_button')));
      await tester.pumpAndSettle(Duration(seconds: 5));

      // Dashboard'a yönlendirilmeli
      expect(find.byKey(const Key('dashboard_screen')), findsOneWidget);

      // Bot mentor mesajı gelmeli
      await tester.tap(find.byKey(const Key('chat_button')));
      await tester.pumpAndSettle(Duration(seconds: 10));

      expect(find.text('🤖 Rehber Ali'), findsAtLeastNWidgets(1));
      expect(find.textContaining('Merhaba!'), findsOneWidget);
    });

    testWidgets('Real-time chat testi', (tester) async {
      // İki farklı kullanıcı simüle et
      // Test implementation...
    });
  });
}
```

### **10. End-to-End Tests**

#### **30 Dakika Onboarding E2E Test**
```dart
// e2e_test/onboarding_flow_test.dart
import 'package:flutter_driver/flutter_driver.dart';
import 'package:test/test.dart';

void main() {
  group('30 Dakika Onboarding E2E Test', () {
    late FlutterDriver driver;

    setUpAll(() async {
      driver = await FlutterDriver.connect();
    });

    tearDownAll(() async {
      await driver?.close();
    });

    test('Tam onboarding flow testi', () async {
      // Dakika 0-5: Kayıt
      await driver.tap(find.byValueKey('phone_input'));
      await driver.enterText('+905551234567');
      await driver.tap(find.byValueKey('send_sms_button'));
      
      await driver.waitFor(find.byValueKey('sms_input'));
      await driver.enterText('123456');
      await driver.tap(find.byValueKey('verify_button'));

      // İsim girişi
      await driver.waitFor(find.byValueKey('name_input'));
      await driver.enterText('E2E Test User');
      await driver.tap(find.byValueKey('continue_button'));

      // Dakika 5-15: Bot mentor
      await driver.waitFor(find.byValueKey('dashboard'));
      await driver.tap(find.byValueKey('chat_button'));
      
      // Bot mesajlarını bekle
      await driver.waitFor(find.text('🤖 Rehber Ali'), timeout: Duration(seconds: 10));
      
      // Bot ile etkileşim
      await driver.tap(find.byValueKey('message_input'));
      await driver.enterText('Merhaba bot!');
      await driver.tap(find.byValueKey('send_button'));

      // Odun kesme aktivitesi
      await driver.waitFor(find.byValueKey('chop_wood_button'));
      await driver.tap(find.byValueKey('chop_wood_button'));
      
      // Inventory kontrolü
      await driver.waitFor(find.text('Odun: 1'));

      // Pazar testi
      await driver.tap(find.byValueKey('marketplace_tab'));
      await driver.tap(find.byValueKey('sell_wood_button'));
      
      // Para artışı kontrolü
      await driver.waitFor(find.text('Para: 60 TL'));

      // Dakika 15-25: Mentor arama
      await driver.waitFor(find.byValueKey('find_mentor_button'));
      await driver.tap(find.byValueKey('find_mentor_button'));
      
      await driver.waitFor(find.byValueKey('mentor_list'));
      await driver.tap(find.byValueKey('mentor_1')); // İlk mentor
      await driver.tap(find.byValueKey('request_mentorship'));

      // Dakika 25-30: İlk işletme
      await driver.waitFor(find.byValueKey('business_tab'));
      await driver.tap(find.byValueKey('business_tab'));
      await driver.tap(find.byValueKey('new_business_button'));
      
      await driver.tap(find.byValueKey('lemonade_stand'));
      await driver.tap(find.byValueKey('confirm_purchase'));

      // 30 dakika tamamlandı kontrolü
      await driver.waitFor(find.byValueKey('onboarding_completed'));
      
      expect(await driver.getText(find.byValueKey('success_message')), 
             'Tebrikler! Onboarding tamamlandı!');
    }, timeout: Timeout(Duration(minutes: 35)));
  });
}
```

---

## 📊 Test Raporlama ve Metrikleri

### **Test Coverage Hedefleri**
```yaml
# test/coverage_goals.yml
overall_coverage: 85%
widget_tests: 90%
service_tests: 95%
integration_tests: 70%

critical_paths:
  onboarding_flow: 100%
  chat_system: 95%
  trust_system: 95%
  payment_system: 100%
```

### **Automated Test Reports**
```bash
# Test raporları oluşturma
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html

# Test sonuçlarını CI/CD'de paylaş
flutter test --machine > test_results.json
```

### **Performance Monitoring**
```javascript
// Real-time performance monitoring
const performanceMonitoring = {
  // Sayfa yükleme süreleri
  pageLoadTimes: {
    dashboard: '<2s',
    chat: '<1s',
    profile: '<1.5s'
  },
  
  // API response times
  apiResponseTimes: {
    sendMessage: '<500ms',
    updateTrustScore: '<1s',
    createContract: '<2s'
  },
  
  // Mobile performance
  mobilePerformance: {
    memoryUsage: '<200MB',
    batteryDrain: '<5%/30min',
    appSize: '<50MB'
  }
};
```

---

## 🔄 Test Automation CI/CD

### **GitHub Actions Test Pipeline**
```yaml
# .github/workflows/test.yml
name: Automated Testing Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit_tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: subosito/flutter-action@v2
    - run: flutter pub get
    - run: flutter test --coverage
    - run: genhtml coverage/lcov.info -o coverage/html
    
  integration_tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: subosito/flutter-action@v2
    - run: flutter pub get
    - run: flutter test integration_test/

  e2e_tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: subosito/flutter-action@v2
    - run: flutter pub get
    - run: flutter drive --target=test_driver/app.dart

  performance_tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - run: npm install -g artillery
    - run: artillery run performance_tests/load_test.yml
```

### **Test Data Management**
```javascript
// Test database setup
const testDataSetup = {
  // Test kullanıcıları
  users: [
    { id: 'test_user_1', trustScore: 185, name: 'Test Mentor' },
    { id: 'test_user_2', trustScore: 150, name: 'Test Student' },
    { id: 'test_user_3', trustScore: 90, name: 'Low Trust User' }
  ],
  
  // Test chat mesajları
  messages: [
    { userId: 'test_user_1', message: 'Test message 1' },
    { userId: 'bot_mentor', message: 'Bot test message', isBot: true }
  ],
  
  // Test kontratları
  contracts: [
    { 
      creatorId: 'test_user_1',
      projectType: 'shopping_mall',
      status: 'active'
    }
  ]
};
```

Bu kapsamlı test dokümantasyonu ile oyunun kalitesi ve güvenilirliği garantileniyor! 🧪✅

**Hazırlayan:** Musa & GitHub Copilot  
**Tarih:** 5 Ağustos 2025  
**Versiyon:** 1.0 - Comprehensive Testing Guide

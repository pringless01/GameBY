# 2D Mobil Online Ticaret Oyunu - Oyun Tasarım Dökümanı

## 📋 Proje Genel Bilgileri

**Oyun Türü:** 2D Mobil Online Ticaret Simülasyonu  
**Platform:** Android & iOS  
**Hedef Kitle:** 13+ yaş arası strateji ve simülasyon oyun severler  
**Oyuncu Yapısı:** Çok oyunculu online (Multiplayer)  

---

## 🎯 Referans Oyun Analizi

### 1. **Capitalism 2** - Analiz
**Güçlü Yanları:**
- Kapsamlı iş simülasyonu (60+ ürün çeşidi)
- Gerçek dünya iş stratejileri
- Borsa sistemi ve şirket birleşmeleri
- Araştırma ve teknoloji geliştirme
- Üst düzey yönetici işe alma sistemi

**Mobil adaptasyonu için alınabilecekler:**
- Çeşitli ürün kategorileri
- Teknoloji geliştirme sistemi
- Hisse senedi benzeri değer sistemi

### 2. **Ticarium: Business Tycoon** - Analiz
**Güçlü Yanları:**
- Mobil için optimize edilmiş arayüz
- Online ticaret sistemi
- Üretim tesisleri kurma
- 10.000$ başlangıç hibesi
- "Al, üret, sat, kazan" basit formula

**Mobil adaptasyonu için alınabilecekler:**
- Basit ve anlaşılır ticaret sistemi
- Üretim tesisi geliştirme
- Hibeli başlangıç sistemi

### 3. **Trade Simulator Oyunları** - Analiz
**Güçlü Yanları:**
- Gerçek zamanlı piyasa simülasyonu
- Portfolio yönetimi
- Risk yönetimi sistemi
- Eğitici içerik

**Mobil adaptasyonu için alınabilecekler:**
- Basit ticaret arayüzü
- Fiyat dalgalanmaları sistemi
- Kazanç/kayıp takibi

---

## 🎮 Oyun Konsepti - GÜNCEL VİZYON

### Temel Konsept
**"İtibar ve İletişim Odaklı Ticaret Ekosistemi"**

Bu sadece bir ticaret oyunu değil - **sosyal bir ekonomi simülasyonu**. Başarı para ile değil, **itibar ve doğru ortaklıklarla** gelir. Oyuncular gerçek iş dünyası gibi **network kurmak**, **güven oluşturmak** ve **uzun vadeli projeler geliştirmek** zorunda.

### Ana Oyun Döngüsü - YENİLENDİ
1. **İtibar kazan** → Chat, başarılı işlemler, güvenilir ortaklıklar
2. **Network kur** → Doğru insanları bul, kontrat fırsatları yakala  
3. **Büyük projelere katıl** → AVM, fabrika, şehir projeleri
4. **Pasif gelir oluştur** → Kira, işletme gelirleri, proje payları
5. **Gerçek değer yarat** → Oyun parasını gerçek paraya çevir 💰

### 🔑 Kritik Başarı Faktörleri
- **Para ≠ Güç** → İtibar = Gerçek Güç
- **Solo oyun yok** → Her büyük başarı işbirliği gerektirir
- **Sosyal beceriler** → En önemli oyun mekaniği
- **Uzun vadeli düşünme** → Hızlı zenginlik değil, sürdürülebilir büyüme

---

## 🎯 ANA OYUN MEKANİKLERİ (Detaylandırılmış)

### 1. 🛒 **Ticaret Sistemi**
**Oyuncu Buluşma:**
- **Oyun içi chat sistemi** (global/lokal sohbet odaları)
- **Sosyal medya entegrasyonu** (Discord, Telegram grupları)
- **Pazaryeri sistemi** (otomatik alım-satım)
- **Kontrat sistemi** (büyük projeler için çok oyunculu anlaşmalar)

**Para Transfer Sistemi:**
- **Sadece oyun içi para** (gerçek para transferi YOK)
- **Trade penceresi** (iki taraf karşılıklı eşya/para koyar)
- **Çift onay sistemi** (her iki oyuncu onayladıktan sonra takas)
- **İşlem geçmişi** (güven puanı için kayıt)

### 2. 🤝 **Kontrat Sistemi & Dolandırıcılık Mekaniği**
**Kontrat Nasıl Çalışır:**
- **İki oyuncu anlaşır:** "30 işletmeli AVM, sen 5 işyeri alacaksın"
- **Kontrat imzalanır:** Yazılı anlaşma ve ödeme
- **Proje tamamlanır:** AVM 30 işletme ile açılır ✅
- **YA DA... Dolandırılırsın:** AVM 5 işletme ile tamamlanır! 😈

**Dolandırıcılık Örnek Senaryo:**
```
1. Ahmet: "30 işletmeli AVM yapıyorum, 5 işyeri 500k!"
2. Mehmet: "Tamam, işte param!" (500k öder)
3. Ahmet: Başka yatırımcı bulamadı, sadece 5 işletme yaptı
4. Mehmet: Hem az para kazanır, hem itibarını kaybeder
5. Ahmet: Dolandırıcı olarak işaretlenir!
```

**Güven Sistemi:**
- **Oyuncu Profili Puanı:** 200 oy → 180 güvenilir, 20 dolandırıcı
- **İtibar sistemi:** Dolandırırsan gelecek kontratlar yok!
- **Sosyal ceza:** Chat'te kimse seninle anlaşma yapmaz

### 3. 🆕 **Yeni Oyuncu Başlangıç Sistemi**
**"Kimsesiz ve Parasız" Senaryosu:**

**Başlangıç Durumu:**
- **0 para, 0 eşya, evsiz-barksız**
- **Chat'te yardım arar:** "Yeni başladım, biri sahip çıkar mı?"
- **Mentor sistemi:** Eski oyuncular yeni gelenlere yardım eder

**Mentor Ödülleri:**
- **Yeni oyuncuya yardım et:** Balta + orman + çiftlik ver
- **Mentor ünvanı kazan:** Profilde "Yardımsever" rozeti
- **Mentor puanı:** Ne kadar çok kişiye yardım ettiysen o kadar saygın

**Çoklu Üyelik Önlemi:**
- **Telefon doğrulama** (SMS kodu)
- **IP kontrolü** (aynı ağdan çok hesap uyarısı)  
- **Davranış analizi** (botları yakalar)
- **Mentor limiti** (Bir kişi günde max 3 yeni oyuncuya yardım)

### 4. 📦 **Craft Sistemi & Büyük Projeler**
**Craft Mantığı:**
- **Basit ürünler** → **Karmaşık ürünler** (piramit sistemi)
- **AVM Örneği:** 
  - 10 işyeri sahibi ile kontrat + 500k toprak + çimento + 1M tuğla
  - 30 işyeri sahibi + 100 farklı oyuncudan malzeme
- **Kontrat sistemi:** Çok oyunculu projeler için anlaşmalar

**Ürün Hiyerarşisi:**
```
Hammadde → İşlenmiş Ürün → Lüks Eşya → Mega Projeler (AVM, Fabrika)
```

### 5. 📈 **Ünvan Tabanlı Progression**
**EXP yok, Prestij var:**
- **Seviye = Sahip olunan varlıklar**
- **Örnek Ünvan Kriterleri:**
  - *Girişimci:* 3 araba + 1 villa + 5 işletme + 100k para
  - *İş Mogülü:* 10 işletme + AVM payı + 1M para
  - *Ekonomi Kralı:* Şehir projelerine yatırım + mega varlıklar

### 5. 📈 **Ünvan Tabanlı Progression**
**EXP yok, Prestij var:**
- **Seviye = Sahip olunan varlıklar**
- **Örnek Ünvan Kriterleri:**
  - *Girişimci:* 3 araba + 1 villa + 5 işletme + 100k para
  - *İş Mogülü:* 10 işletme + AVM payı + 1M para
  - *Ekonomi Kralı:* Şehir projelerine yatırım + mega varlıklar
  - *Mentor:* 50+ yeni oyuncuya yardım etmiş
  - *Güvenilir Ortak:* 100+ başarılı kontrat

**Ünvan Faydaları:**
- **İtibar puanı** - diğer oyuncular güvenir
- **Özel kontrat hakları** - büyük projelere katılım
- **Prestij eşyaları** - gösteriş ürünleri

### 6. 👥 **Sosyal Sistem & Güven Ekonomisi**
**İletişim:**
- **Full chat sistemi** (özel mesaj, grup chat)
- **Mail sistemi** (resmi işlemler için)
- **Arkadaşlık sistemi** (güvenilir ortaklar)

**Güven Puanı Sistemi:**
- **Oyuncu profili:** "200 oyuncudan 180 güvenilir, 20 dolandırıcı"
- **İşlem geçmişi:** Tüm kontratlar kayıtlı
- **Sosyal ceza:** Dolandırıcılarla kimse anlaşma yapmaz
- **İtibar değeri:** En önemli game mekaniği!

**Guild YOK - Kontrat VAR:**
- **AVM Projesi:** 1 kişi yaptırır, 15 kişi pay alır
- **İşyeri kiralama:** AVM'de yer alamazsan işletme açamazsın
- **Getiri paylaşımı:** AVM gelirinden herkes payını alır

### 7. 💰 **Monetizasyon (Pay2Win DEĞİL!)**
**Premium Özellikler:**
- **Otomatik ticaret:** "Dolar 50'nin altına düşerse al, 60'ın üstüne çıksa sat"
- **Gelişmiş analitik:** Piyasa trendleri, grafik analizi
- **Hızlı bildirimler:** Fırsat anında uyarı

**Ana Gelir Sistemi:**
- **İşletme gelirleri** (pasif gelir)
- **Kira bedelleri** (gayrimenkul)
- **Kontrat kazançları** (proje payları)
- **🔥 Oyun içi para takası** - Sadece oyun parası, güvenli sistem!

### 🚀 **Büyük Vizyon**
**Oyun Dışı Ekonomi:**
- Oyun parası → Gerçek para (3. parti siteler)
- Oyuncular potansiyel gelir elde edebilir
- **Viral büyüme stratejisi!** 💎

### 🛡️ **Güvenlik ve Anti-Cheat**
**Çoklu Hesap Önlemleri:**
- **SMS doğrulama** (her hesap için)
- **IP analizi** (şüpheli aktivite tespiti)
- **Davranış kontrolü** (bot detection)
- **Mentor limiti** (günlük yardım sınırı)

**Dolandırıcılık Sistemi:**
- **Kasıtlı dolandırıcılık** (oyunun bir parçası!)
- **Sosyal ceza** (güven puanı düşer)
- **İtibar ekonomisi** (en önemli meta-game)

---

## 🎮 **İLK 30 DAKİKA DENEYİMİ (Critical Path)**

### **Dakika 0-5: "Kimsesiz Başlangıç"**
**Oyuna Giriş:**
1. **SMS doğrulama** (çoklu hesap önlemi)
2. **İsim seçimi** (değiştirilebilir)
3. **Profil fotoğrafı** (avatar sistemi)

**Oyun Tanıtımı:**
- **Karakter:** Sokakta kalmış, cebinde 0 TL
- **Ekran mesajı:** "Bu oyunda kimse sana para vermez. Başkalarına güvenmek zorundasın."
- **İlk görev:** Chat'te yardım iste

### **Dakika 5-15: "Bot Mentor ile Hızlı Başlangıç"**
**Bot Mentor Sistemi:**
1. **Otomatik mentor ataması:** Sistem bot mentor'u 30 saniye içinde atar
2. **Bot mentor paketi:** Balta + küçük orman alanı + 50 TL başlangıç parası
3. **Basit görevler:** "Odun kes, pazarda sat, 100 TL kazan"
4. **Chat öğretimi:** Bot ile basit sohbet, komutları öğren

**Bot Mentor Avantajları:**
- **Hiç beklemez** - oyuncu hemen başlar
- **Sabırlı öğretici** - aynı şeyleri tekrarlar
- **24/7 aktif** - her saatte yardım eder

### **Dakika 15-25: "İlk İş Deneyimi & Gerçek Mentor Arama"**
**Bot ile İlk İşler:**
1. **Odun kesme ve satış:** İlk 50-100 TL kazan
2. **Pazaryeri kullanımı:** Basit alım-satım öğren
3. **Chat'te duyuru:** "Bot'tan mezun oldum, gerçek mentor arıyorum!"

**Gerçek Mentor Bulma Süreci:**
- **30 dakika sonra sistem mesajı:** "Artık gerçek mentor bulma zamanı!"
- **Mentor arama modu:** Chat'te "gerçek mentor aranıyor" etiketi
- **Potansiyel mentorlar:** "Yeni mezun" oyuncular için bildirim

### **Dakika 25-30: "Gerçek Mentorla İlk Temas"**
**Mentor Eşleştirme:**
1. **Gerçek mentor bulunur:** İtibar puanı yüksek oyuncu
2. **İlk görüşme:** "Bot'tan ne öğrendin? Hedeflerin neler?"
3. **Uzun vadeli planlama:** "Ben sana 1000 TL'ye çiftlik kurayım"
4. **Sosyal bağ:** Gerçek dostluk başlar

### **🎯 İki Mentor Sistemi Avantajları:**
- **Bot Mentor:** Hızlı başlangıç, oyunu öğrenme
- **Gerçek Mentor:** Derinlemesine rehberlik, sosyal bağ
- **Geçiş süreci:** 30 dakika mükemmel timing
- **Hiç oyuncu kaybetmeyiz:** Bot her zaman hazır

### **Dakika 25-30: "Bağımsızlık İlk Adımı"**
**Kendi Ayakları Üzerinde Durma:**
1. **Küçük işletme kirala:** Limonata standı (100 TL/gün)
2. **İlk müşteri:** Başka yeni oyuncular
3. **İlk kar:** 20-30 TL
4. **Hedef belirleme:** "1000 TL biriktir, büyük işletme aç"

### **🎯 30 Dakika Sonunda Oyuncu:**
- **Bot mentor'dan temel oyunu öğrendi** ✅
- **İlk para kazandı** (50-100 TL) ✅
- **Chat sistemi ve pazaryeri biliyor** ✅
- **Gerçek mentor buldu** ✅
- **Uzun vadeli hedef belirledi** ✅
- **Sosyal bağ kurdu** (gerçek oyuncuyla) ✅

### **🤖 Bot vs 👤 Gerçek Mentor Karşılaştırması:**

| Özellik | Bot Mentor | Gerçek Mentor |
|---------|------------|---------------|
| **Hız** | Anında atar | 5-30 dk bekleyebilir |
| **Sabır** | Sonsuz | İnsan faktörü |
| **Öğretim** | Temel kurallar | İleri stratejiler |
| **Sosyal Bağ** | Yok | Güçlü dostluk |
| **Uzun Vade** | Sınırlı | Hayat boyu mentor |
| **Fayda** | Hızlı başlangıç | Derin rehberlik |

### **📈 Progression Yolu:**
**0-5dk:** Kayıt + tanıtım  
**5-15dk:** Bot mentor + temel öğrenme  
**15-25dk:** İlk iş + gerçek mentor arama  
**25-30dk:** Gerçek mentor + uzun vade planlama  
**30dk+:** Gerçek sosyal ekonomi başlar! 🚀

---

## �️ **TEKNİK ALTYAPI ÖNERİSİ**

### **🔥 YENİ ÖNERİLEN TEKNOLOJI STACK:**

**📱 Frontend: Flutter + Dart**
- **UI Framework:** Flutter (Cross-platform native)
- **Programlama Dili:** Dart
- **State Management:** Provider/Riverpod
- **Navigation:** GoRouter

**🌐 Backend: Firebase Ecosystem**
- **Database:** Cloud Firestore (real-time)
- **Authentication:** Firebase Auth + SMS
- **Cloud Functions:** Business logic
- **Storage:** Firebase Storage
- **Analytics:** Firebase Analytics

**Neden Flutter + Firebase Daha İyi?**
✅ **UI Odaklı Framework** (Bu oyun %90 UI, %10 logic)  
✅ **Tek Kod, Çoklu Platform** (Android + iOS aynı anda)  
✅ **Real-time Built-in** (Chat sistemi hazır)  
✅ **Hızlı Development** (3-4 ay vs Unity'de 6-7 ay)  
✅ **No Game Engine Overhead** (Basit UI için Unity overkill)

### **~~ESKİ STACK (ARTIK ÖNERİLMİYOR)~~**

**🎮 Oyun Geliştirme:**
- **Ana Motor:** Unity 2022.3 LTS
- **Programlama Dili:** C#
- **UI Framework:** Unity UI Toolkit
- **2D Grafik:** Unity 2D + Spine (animasyon)

**🌐 Backend Altyapısı:**
- **Server:** Node.js + Express.js
- **Gerçek Zamanlı:** Socket.io (chat sistemi)
- **Veritabanı:** MongoDB (oyuncu verileri) + Redis (cache)
- **Authentication:** JWT + SMS doğrulama
- **Cloud:** AWS (EC2 + RDS + S3)

**📱 Platform Stratejisi:**
1. **Faz 1:** Android (Google Play)
2. **Faz 2:** iOS (App Store)  
3. **Faz 3:** Web (WebGL)

### **Alternatif (Daha Basit) Stack:**
- **Flutter + Dart** (tek kod, iki platform)
- **Firebase** (backend hazır)
- **Cloud Firestore** (gerçek zamanlı veritabanı)

### **Neden Unity + Node.js?**
✅ **Ölçeklenebilir** (binlerce oyuncu)  
✅ **Esnek** (özellik eklemek kolay)  
✅ **Topluluk desteği** (problem çözümü hızlı)  
✅ **Cross-platform** (iOS'a port kolay)

---

## ❓ **SONRAKİ GELİŞTİRME ADIMLARI**

### **Hangi sistemi önce detaylandıralım?**
1. **🎨 UI/UX Tasarım** (Ekranlar, butonlar, chat arayüzü)
2. **🤖 Bot Mentor Sistemi** (Mentor bulunamadığında ne olacak?)
3. **💬 Chat Sistemi Detayları** (Moderasyon, spam önleme)
4. **🏪 İlk İşletme Türleri** (Limonata standından sonra ne?)
5. **� İtibar Puanı Algoritması** (Nasıl hesaplanacak?)

### **🔥 KRİTİK KARARLAR**
- **İki mentor sistemi** = Hızlı başlangıç + Derinlemesine bağ ✅
- ~~**Unity + Node.js** = Ölçeklenebilir altyapı~~ ✅ **Flutter + Firebase** = Hızlı ve etkili altyapı ✅
- **Minimum viable product:** Bot mentor + chat + basit ticaret ✅
- **30 dakikalık onboarding** = Mükemmel retention stratejisi ✅

### 🔥 **ÖNE ÇIKAN YENİLİKLER**
- **"İki aşamalı mentor sistemi"** = Bot hızlı başlatır, insan derinleştirir!
- **"30 dakikada geçiş"** = Mükemmel timing
- **"Kimsesiz başlangıç senaryosu"** = Duygusal bağ yaratır
- **"Dolandırıcılığa izin veren sistem"** = Risk ve güven ekonomisi
- **"Güven puanı sistemi"** = Para değil, itibar en değerli varlık
- **2D mobil oyun** (basit ve erişilebilir)
- **%100 oyuncu odaklı ekonomi** (NPC yok, sadece gerçek oyuncular)
- **Sohbet = Oyunun kalbi** (sosyal beceriler en önemli stat)
- **P2P para transferi** = Oyun dışı ekonomi yaratır
- **Pay2Win YASAK** = Eşitlik ve adalet temel prensip
- **İtibar sistemi** = Güven ekonomisinin temeli
- **Viral büyüme potansiyeli** = "Para kazanılabilir oyun" haberi 🚀

## 📝 Notlar & Vizyoner Özellikler
- **2D mobil oyun** (basit ve erişilebilir)
- **%100 oyuncu odaklı ekonomi** (NPC yok, sadece gerçek oyuncular)
- **Sohbet = Oyunun kalbi** (sosyal beceriler en önemli stat)
- **Unity + Node.js** = Güçlü ve ölçeklenebilir altyapı
- **Pay2Win YASAK** = Eşitlik ve adalet temel prensip
- **İtibar sistemi** = Güven ekonomisinin temeli
- **30 dakikalık kritik onboarding** = Oyuncuyu bağlama stratejisi
- **Viral büyüme potansiyeli** = "Para kazanılabilir oyun" haberi 🚀

### 🎯 Hedef Vizyon
**"Dünyanın ilk sürdürülebilir oyuncu ekonomili mobil ticaret simülatörü"**

### 🚀 **Geliştirme Roadmap**
**Faz 1:** İlk 30 dakika deneyimi + temel chat sistemi  
**Faz 2:** Mentor sistemi + basit ticaret  
**Faz 3:** Kontrat sistemi + dolandırıcılık mekaniği  
**Faz 4:** AVM projeleri + büyük ticaret  

**Hazırlayan:** Musa & GitHub Copilot  
**Tarih:** 5 Ağustos 2025  
**Versiyon:** 4.0 - Flutter + Firebase Teknoloji Değişikliği 🚀

---

## 🔄 **DÖKÜMAN GÜNCELLEME SİSTEMİ**

### **📋 Güncelleme Kuralları:**
1. **Her yeni özellik** eklendiğinde versiyon numarası artırılır
2. **Büyük değişiklikler** için yeni bölüm eklenir
3. **Eski bilgiler** silinmez, üstü çizilir veya "güncellenmiş" etiketi eklenir
4. **Değişiklik tarihi** her zaman kaydedilir

### **🎯 Bir Sonraki Güncellemeler:**
- [✅] Bot mentor diyalogları detaylandırıldı
- [✅] UI/UX tasarım rehberi hazırlandı  
- [✅] Minimum viable product özellikleri netleştirildi
- [ ] Flutter implementasyon adımları detaylandırılacak
- [ ] Firebase backend yapısı belgelenecek
- [ ] Test senaryoları yazılacak

### **💡 Güncelleme Komutları:**
**"Dökümanı güncelle"** = Yeni özellikleri ekle  
**"Versiyon artır"** = Numarayı yükselt  
**"Özet çıkar"** = Kısa versiyon hazırla

---

## 📚 **REFERANS DOSYA DURUMU**
**Bu dosya aktif referans dökümanıdır.**  
**Tüm gelecek konuşmalarda bu bilgiler temel alınacaktır.**  
**Yeni özellikler burada kaydedilecektir.**

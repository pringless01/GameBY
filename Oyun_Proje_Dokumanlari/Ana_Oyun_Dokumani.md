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

## 🛠️ **TEKNİK ALTYAPI ÖNERİSİ**

### **Önerilen Teknoloji Stack:**

**🎮 Oyun Geliştirme:**
- **Ana Motor:** Unity 2022.3 LTS *(Orta vade opsiyon / Şu an aktif değil - Web PWA öncelikli)*
- **Programlama Dili:** C# *(ileriki faz)*
- **UI Framework:** Unity UI Toolkit *(ileriki faz)*
- **2D Grafik:** Unity 2D + Spine *(ileriki faz)*

**🌐 Backend Altyapısı (GÜNCEL - MVP):**
- **Server:** Node.js + Express.js ✅ (scaffold hazır)
- **Gerçek Zamanlı:** Socket.io ✅ (chat temel eventler)
- **Veritabanı:** **SQLite (MVP)** ▶ MongoDB planı orta vade (yük artışı / analitik)
- **Authentication:** JWT (register/login hazır) + SMS (gelecek faz)
- **Cache:** (İleride Redis – online sayaç / rate limit)
- **Cloud:** İlk aşama VPS (AWS/DO seçimi yapılmadı)

**Değişiklik Notu:** Önceki dokümanda MongoDB + Redis birincil seçimdi; MVP hız ve sadelik için SQLite’a düşürüldü (Versiyon 3.2 güncellemesi).

### **Alternatif (Daha Basit) Stack:**
- **Flutter + Dart** (tek kod, iki platform) *(ERTELENDİ)*
- **Firebase** (backend hazır) *(ERTELENDİ)*
- **Cloud Firestore** (gerçek zamanlı veritabanı) *(ERTELENDİ)*

### **Neden Unity + Node.js?**
✅ **Ölçeklenebilir** (binlerce oyuncu)  
✅ **Esnek** (özellik eklemek kolay)  
✅ **Topluluk desteği** (problem çözümü hızlı)  
✅ **Cross-platform** (iOS'a port kolay)  
**Not:** Unity tarafı aktif geliştirme kapsamı dışına alındı (kısa vadede PWA odaklı).

---

## 🆕 Versiyon 3.2 Güncelleme Özeti (10 Ağustos 2025)
**Durum:** Backend temel iskeleti eklendi.

### Eklenen Teknik Öğeler
- server/ dizini + package.json
- Express server + Socket.io entegrasyonu
- Health endpoint: GET /health
- Auth rotaları: POST /api/auth/register, POST /api/auth/login
- SQLite bağlantısı (better-sqlite3) + migration sistemi
- Migration 001: users, chat_messages, reputation_events, mentorships, transactions tabloları
- Chat socket eventleri: join_chat, send_message → new_message, online_count_updated

### Mevcut Sınırlamalar
- Authorization middleware (JWT doğrulama) yok
- İtibar güncelleme iş kuralları yok (sadece tablo altyapısı)
- Mentor akışı / state makineleri yok (bot_tutorial_state alanı hazır)
- Rate limiting / anti-spam yok
- SMS doğrulama henüz tasarlanmamış

### Kısa Vadeli Teknik Öncelikler (3.3 Hedefi)
1. JWT doğrulama middleware (Authorization: Bearer ...)
2. Chat message flood limit (ör: 5 sn içinde >5 mesaj blok)
3. ReputationService (event ekleme + yeniden hesaplama)
4. Basit itibar güncelleme tetikleri (chat aktifliği + başarılı trade placeholder)
5. Mentor eşleşme taslak servisi (sadece veri modeli / dummy)
6. /api/user/me endpoint (profil + itibar döndürme)

---

## 🆕 Versiyon 3.4 Güncelleme Özeti (11 Ağustos 2025)
**Durum:** Güvenli leaderboard & cursor abuse yönetimi tamamlandı; mentor & reputation otomasyonu kısmi.

### Eklenen / Değişen Teknik Öğeler
- Cursor güvenliği sıkılaştırma: İmzasız (2 parça) cursor formatı artık REDDEDİLİYOR.
- Threshold karşılaştırmaları tüm kodda strict `>` (>= kaldırıldı) – abuse hesaplaması dokümana uyumlu hale geldi.
- `shouldAutoDegrade(count)` helper eklendi (auto-degrade karar mantığı merkezileştirildi).
- Rotation env standardizasyonu: `CURSOR_SECRET_ROTATION` (eski `CURSOR_SECRET_SECONDARY` geriye dönük destekleniyor).
- Around (rank etrafı) leaderboard modu için `X-Cache` ve `X-Cache-TTL` header'ları eklendi.
- Mentor & trust leaderboard batch modunda cache ttl minimaline göre `X-Batch-Min-TTL` set ediliyor (önceden vardı, around uyumu tamamlandı).
- Eşik sonrası cooldown / grace isteği header tutarlılığı iyileştirildi.
- Güvenlik imza formatı dokümante edildi: HMAC-SHA256(base="score|id") → base64 filtre → ilk 16 karakter.
- Timing-safe HMAC imza karşılaştırması (`safeEqual`) eklendi (yan kanal risk azaltımı).
- Granular cursor hata metrikleri: `leaderboard_errors_cursor_format`, `leaderboard_errors_cursor_signature`, `leaderboard_errors_cursor_oversize`.
- Oversize (>256) cursor inputları erken reddedilerek DoS yüzeyi daraltıldı (+ metrik).
- ReputationEventEmitter uygulandı: chat mesajı (+1), spam penaltısı (-2), mentor session complete (+3), mentee session complete (+2), kontrat dinamik ödülü unified pipeline (applyDirectReputationDelta).
- Gün değişiminde reputation dailyCounters cleanup (basit day-change pruning) eklendi.
- Kontrat dinamik trust ödülleri artık `updateTrust` yerine reputation pipeline’dan geçiyor (gözlemlenebilirlik artışı).

### Revize / Kaldırılanlar
- Eski imzasız cursor geçiş uyumluluğu kaldırıldı (potansiyel manipülasyon yüzeyi kapandı).
- 3.2 dokümanındaki "JWT middleware yok" sınırlaması artık geçerli değil (uygulandı).

### Mevcut Sınırlamalar (Güncel)
- Reputation pipeline: Risk / fraud (default, dolandırıcılık) negatif eventleri ve trade volumetrik eventleri EKLENMEDİ.
- Mentor akışı: Bot → gerçek mentor geçiş limitleri, kalite metriği, günlük mentor/mentee limitleri yok.
- Trade & geniş ekonomik döngü: Kaynak üretim dengeleri, fiyat dalgalanma sistemi, piyasa analitiği eksik.
- Onboarding 30 dk görev zinciri backend tetikleyicileri (progress events) henüz yok.
- Fraud / default heuristikleri & contract risk skor hesaplayıcısı yok.
- SMS doğrulama ve multi-account/device fingerprint modülü yok.
- Reputation caps: Negatif eventlerin cap dışı konfigürasyonu (örn. SPAM_PENALTY exempt flag) henüz uygulanmadı.
- Leaderboard abuse IP haritaları için LRU / TTL shrink mekanizması yok (düşük ölçek varsayımı ile bekletiliyor).

### Kısa Vadeli Teknik Öncelikler (3.5 Hedefi - Revize)
1. Fraud / contract default reputation penalty eventleri (`contract_default`, `fraud_flag`).
2. Trade hacim / pair risk metrikleri + Prometheus etiketleri (örn. `trade_completed_total{pair="userA_userB"}` minimal tasarım orijinal load düşünülerek throttle).
3. Mentor state machine genişletme (günlük limitler + kalite oranı metriği).
4. Onboarding görev progression tablosu + event tetikleyicileri.
5. Multi-account erken sinyal heuristikleri (IP + creation cadence + shared device hash taslağı).
6. Reputation konfigürasyon haritasını dış JSON’a taşıma (dinamik reload potansiyeli).
7. Cache & abuse haritaları için hafif periyodik temizlik (scheduler / interval).
8. Prometheus’a contract risk & reputation tür bazlı TYPE satırları; trade için future-proof label spaces (`reason` vs `type` ayrımı korunacak).

### Yeni / Güncellenen TODO Etiketleri
- `// TODO(reputation): fraud/default event mapping`
- `// TODO(security): abuse maps periodic prune (low prio)`
- `// TODO(economy): trade.volume_daily aggregation` (önceki korundu)
- `// TODO(mentor): quality_score metric derivation`
- `// TODO(onboarding): progression events emit`
- `// TODO(config): externalize reputation DELTA_RULES`

---
## 🆕 Versiyon 3.4.1 Ek Notlar (İç İyileştirme Patch)
**Amaç:** Güvenlik & observability mikro iyileştirmeleri.
- Timing-safe cursor imza doğrulama.
- Oversize cursor reject + metrik.
- Unified contract reward → reputation pipeline.
- Mentor & mentee session completion reputation ödülleri.
- Daily counter rollover cleanup.

> 3.5 ile birlikte risk, fraud ve onboarding event set’i genişletilecek.

---

## 🆕 Versiyon 3.5-pre Güncelleme Özeti (11 Ağustos 2025)
**Durum:** Reputation yüzeyi genişletildi, risk (default & fraud) ve gözlemlenebilirlik altyapısı güçlendirildi; konfigürasyon dışsallaştırıldı.

### Eklenen / Değişen Teknik Öğeler
- Reputation delta & günlük cap kuralları `server/config/reputationRules.json` dosyasına taşındı (hot-reload: fs.watch) → canlı tuning olanağı.
- Yeni reputation eventleri: `trade_completed`, `contract_default`, `fraud_flag` (negatif risk sinyalleri dahil edildi).
- Mentor kalite metrikleri: `mentorSessionsCompleted`, `mentorRatingsGiven`, `menteeRatingsGiven` (Prometheus export).
- Sliding window (10 dk) trade ilişkisi metrikleri: `tradePairsWindow`, `tradeUniquePartnersWindow` (anomalik pattern ön sinyali).
- Otomatik sözleşme (contract) default süpürücü: süre aşımlarında `CONTRACT_DEFAULT` reputation event emit.
- Admin fraud flag endpoint: `POST /api/admin/fraud/flag` → `FRAUD_FLAG` reputation event.
- Cursor abuse haritaları için periyodik hafif prune scheduler (memory kontrolü başlangıç adımı).
- Negatif eventler reputation pipeline’a unified şekilde dahil (aynı caps & delta hesabı mekanizması).
- Onboarding progression altyapısı: `onboarding_progress` tablosu + `emitOnboardingStep` + ilk tamamlanan kontrat için `onboard_contract_first_completed` kuralı.
- Fraud repeat-pair heuristiği: 10 dk pencerede aşırı tekrar eden çiftlere otomatik `FRAUD_FLAG` (soğuma süresi ile).
- Reputation rules version hashing + diff log (audit friendly başlangıç).
- README, 3.5-pre durumuna güncellendi (doküman senkronizasyonu).

### Revize / Kaldırılan TODO'lar
- `// TODO(config): externalize reputation DELTA_RULES` TAMAMLANDI.
- `// TODO(security): abuse maps periodic prune` TAMAMLANDI.
- `// TODO(onboarding): progression events emit` KISMEN TAMAM (ilk kontrat adımı; genişletme açık).
- Fraud & default event mapping TODO güncellendi → gelişmiş davranışsal heuristik odaklı.

### Mevcut Sınırlamalar (Güncel)
- Fraud heuristikleri basit (repeat-pair); çeşitlilik / hacim patternleri & multi-sinyal korelasyon yok.
- Onboarding adım seti minimal (yalnızca ilk kontrat) – çok adımlı görev zinciri & zamanlama tetikleri eksik.
- Mentor gelişmiş kalite skoru (decay, retention, fraud etkileşimi) yok (yalnızca basit bileşik skor helper fonksiyon). 
- Multi-account & cihaz fingerprint korelasyon metriği yok (yalnızca plan düzeyi).
- Reputation rule set version için kalıcı audit diff persist edilmedi (yalnızca console log).
- Trade pair metrikleri için label bazlı ayrıntılandırma yok (sadece aggregate counters); potansiyel label patlama kontrolü beklemede.

### Kısa Vadeli Teknik Öncelikler (3.5 Finalizasyon)
1. Onboarding multi-step progression (zaman damgalı görev zinciri + ek spesifik kural anahtarları).
2. Gelişmiş fraud heuristikleri (partner çeşitliliği düşük + burst hız + değer eşiği kombinasyonu → risk skor + koşullu FRAUD_FLAG).
3. Mentor composite kalite skoru derivation (decay + mentee retention + rating varyans) + Prometheus metric (`mentor_quality_score`).
4. Multi-account erken sinyal: IP kümelenmesi + creation cadence + (placeholder) device fingerprint alanı.
5. Reputation rule set persistent audit (version -> previous version diff tablo kaydı) + Prometheus `reputation_rules_info` label genişletme.
6. Negatif reputation eventleri için explicit counters tamamlandı; onboarding event counters (onboard_step, specific overrides) ekle.
7. Trade pair heuristik sampling / top-N raporlama stratejisi (performans & etiket patlaması önleme).

### Yeni / Güncellenen TODO Etiketleri
- `// TODO(fraud): heuristic flag emit (burst trade / low diversity / value spike)`
- `// TODO(onboarding): multi-step progression & granular rules` 
- `// TODO(mentor): composite_quality_score decay & retention`
- `// TODO(meta): reputationRules persistent audit storage`
- `// TODO(metrics): onboarding counters & mentor quality gauge`
- `// TODO(security): device fingerprint placeholder`
- `// TODO(trade): pair sampling strategy`

---

## 🚀 Güncel Geliştirme Roadmap (Revize)
**Faz 1 (Tamamlandı kısmen):** Onboarding konsept + chat UI + backend scaffold  
**Faz 2 (3.4 ile genişledi):** Auth middleware, gelişmiş leaderboard, cursor abuse yönetimi ✅  
**Faz 3 (3.5-pre aşaması):** Reputation genişleme + risk & trade metrik altyapısı ✅ (finalizasyon görevleri açık)  
**Faz 4:** Kontrat gelişmiş risk heuristikleri & ekonomik craft döngüsü  
**Faz 5:** Ölçek optimizasyon + moderasyon araçları + multi-account / SMS  

---

## 🔄 **DÖKÜMAN GÜNCELLEME SİSTEMİ**

### **📋 Güncelleme Kuralları:**
1. **Her yeni özellik** eklendiğinde versiyon numarası artırılır
2. **Büyük değişiklikler** için yeni bölüm eklenir
3. **Eski bilgiler** silinmez, üstü çizilir veya "güncellenmiş" etiketi eklenir
4. **Değişiklik tarihi** her zaman kaydedilir

### **🎯 Bir Sonraki Güncellemeler:** (Güncellendi 11 Ağustos 2025)
- [ ] Reputation event otomasyon pipeline
- [ ] Mentor bot → gerçek mentor geçişi
- [ ] Trade temel endpoint & audit entegrasyonu
- [ ] Contract risk skor algoritması
- [ ] Onboarding görev state alanları
- [ ] Fraud default penalty (otomatik trust delta)
- [ ] applyAbuseHeaders refactor (tek set geçişi)

---

## 📚 **REFERANS DOSYA DURUMU**
**Bu dosya aktif referans dökümanıdır (Versiyon 3.4).**  
**Önceki versiyon (3.2) değişiklikleri üstte korunmuştur.**  
**Yeni özellikler burada kaydedilecektir.**

---

**Hazırlayan:** Musa & GitHub Copilot  
**Tarih:** 11 Ağustos 2025  
**Versiyon:** 3.5-pre - Reputation & Risk Altyapı Genişlemesi

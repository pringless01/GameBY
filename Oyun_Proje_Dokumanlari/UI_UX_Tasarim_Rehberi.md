# 🎨 UI/UX Tasarım Rehberi - 2D Mobil Online Ticaret Oyunu

## 📋 Tasarım Felsefesi

**Temel Prensip:** "Sohbet Odaklı, Basit ve Güven Veren Tasarım"
- **Minimalist yaklaşım** - Karmaşıklık değil, işlevsellik
- **Chat-first design** - Sohbet her zaman öncelik
- **Trust indicators** - Güven puanları görsel olarak dominant
- **Mobile-optimized** - Tek elle kullanılabilir arayüz

## 🎯 Ana Tasarım Hedefleri

### **30 Dakikalık Onboarding Experience**
1. **0-5dk:** Basit ve hızlı kayıt
2. **5-15dk:** Bot mentor ile kolay öğrenme
3. **15-25dk:** Gerçek oyuncularla bağlantı
4. **25-30dk:** İlk işletme kurma deneyimi

### **Sosyal Ekonomi Vurgusu**
- İtibar puanı her yerde görünür
- Chat bildirimleri öncelikli
- Kontrat imzalama görsel olarak önemli
- Network haritası merkezi konumda

---

## 📱 Ana Ekran Mimarisi

### **1. 🏠 Ana Dashboard**
```
┌─────────────────────────────────────┐
│ [👤] Musa (İtibar: 180/200) [💰 2.5K]│
├─────────────────────────────────────┤
│ 💬 [Chat] (3 yeni)     🔔 [Bildirim] │
│ 📊 [Portföy]          🤝 [Kontratlar]│
│ 🏪 [İşletmeler]       👥 [Mentorlar] │
│ 📈 [Piyasa]           ⚙️ [Ayarlar]   │
└─────────────────────────────────────┘
```

**Öne Çıkan Özellikler:**
- **İtibar puanı** üst merkez konumda
- **Chat bildirimi** en görünür buton
- **6 ana fonksiyon** kolay erişim
- **Para miktarı** sürekli görünür

### **2. 💬 Chat System (Oyunun Kalbi)**
```
┌─────────────────────────────────────┐
│ 🌍 Global | 🏠 Lokal | 👥 Özel      │
├─────────────────────────────────────┤
│ Ahmet (⭐178): AVM projesi var!     │
│ Mehmet (⭐195): Balta satıyorum     │
│ 🤖 Bot: Yeni mentor arayın!        │
│ Sen: Çiftlik kurmak istiyorum       │
├─────────────────────────────────────┤
│ [Mesaj yaz...]           [Gönder] │
└─────────────────────────────────────┘
```

**Chat Tasarım Prensipleri:**
- **İtibar puanı** her mesajda görünür (⭐178)
- **Bot mesajları** farklı renk/icon
- **3 sekme** Global/Lokal/Özel
- **Büyük yazma alanı** kolay kullanım

### **3. 🤝 Kontrat İmzalama Ekranı**
```
┌─────────────────────────────────────┐
│        📋 KONTRAT İMZALAMA          │
├─────────────────────────────────────┤
│ Proje: 30 İşletmeli AVM             │
│ Yatırımcı: Sen (5 işyeri)           │
│ Ödeme: 500,000 TL                   │
│ Süre: 60 gün                        │
├─────────────────────────────────────┤
│ ⚠️  RİSK: Dolandırıcılık mümkün!    │
│ Ahmet'in itibarı: ⭐ 145/200        │
├─────────────────────────────────────┤
│ [❌ Reddet]        [✅ İmzala]      │
└─────────────────────────────────────┘
```

**Kontrat Tasarım Özellikler:**
- **Risk uyarısı** sarı/kırmızı
- **İtibar kontrolü** belirgin
- **Net şartlar** basit dil
- **Büyük butonlar** yanlış tıklama önlemi

### **4. 📊 Oyuncu Profili & İtibar**
```
┌─────────────────────────────────────┐
│  👤 Ahmet                          │
│  ⭐ İtibar: 145/200 (25 oy)        │
├─────────────────────────────────────┤
│ 📈 İşlem Geçmişi:                  │
│ ✅ AVM projesi (başarılı)          │
│ ❌ Çiftlik anlaşması (başarısız)   │
│ ✅ Balta ticareti (başarılı)       │
├─────────────────────────────────────┤
│ 🏆 Ünvanlar:                       │
│ 🌟 Girişimci                       │
│ 🤝 Mentor (15 kişi)                │
├─────────────────────────────────────┤
│ [💬 Mesaj At] [⭐ Oy Ver] [🚫 Engelle]│
└─────────────────────────────────────┘
```

### **5. 🏪 İşletme Yönetimi**
```
┌─────────────────────────────────────┐
│       💼 İŞLETMELERİM               │
├─────────────────────────────────────┤
│ 🍋 Limonata Standı                  │
│ Günlük kar: +25 TL                 │
│ Durum: 🟢 Aktif                     │
├─────────────────────────────────────┤
│ 🌳 Orman Alanı                      │
│ Günlük kar: +50 TL                 │
│ Durum: 🟡 Stok azalıyor             │
├─────────────────────────────────────┤
│ [+ Yeni İşletme] [📊 Detaylar]     │
└─────────────────────────────────────┘
```

---

## 🎨 Renk Paleti & Görsel Kimlik

### **Ana Renkler**
- **Birincil:** `#2E7D32` (Güven Yeşili) - İtibar, başarı
- **İkincil:** `#FF8F00` (Altın Sarısı) - Para, değer
- **Tehlike:** `#D32F2F` (Uyarı Kırmızısı) - Risk, dolandırıcılık
- **Chat:** `#1976D2` (Güven Mavisi) - İletişim
- **Nötr:** `#616161` (Gri) - Arka plan, metin

### **Güven Göstergeleri Renkleri**
- **200-180 İtibar:** 🟢 Yeşil (Çok güvenilir)
- **179-150 İtibar:** 🟡 Sarı (Orta güven)
- **149-100 İtibar:** 🟠 Turuncu (Dikkatli ol)
- **99-0 İtibar:** 🔴 Kırmızı (Tehlikeli)

### **Tipografi**
- **Ana Font:** Inter/Roboto (Mobilde net)
- **Başlık:** 18-24px, Bold
- **Normal Metin:** 14-16px, Regular
- **Chat Mesajları:** 14px, Medium
- **İtibar Puanları:** 16px, Bold

---

## 📱 Mobil Optimizasyon

### **Tek Ele Uygunluk**
- **Chat butonu** başparmak erişimi içinde
- **Ana butonlar** ekranın alt %30'unda
- **Kaydırma** kolay ve akıcı
- **Minimum buton boyutu** 44px (iOS standardı)

### **Dokunmatik Etkileşimler**
- **Uzun basma** bağlam menüsü
- **Çift dokunma** profil görüntüleme
- **Kaydırma** menüler arası geçiş
- **Sıkıştırma** liste filtreleme

### **Bildirim Tasarımı**
```
┌─────────────────────────────────────┐
│ 💬 Yeni mesaj: Ahmet                │
│ "AVM projesine katılmak ister misin?"│
│ 2 dakika önce                       │
└─────────────────────────────────────┘
```

---

## 🎯 Kritik UX Akışları

### **1. İlk 30 Dakika Onboarding Flow**

**Dakika 0-5: Kayıt**
1. Telefon numarası girişi (büyük rakam tuşları)
2. SMS kodu (otomatik algılama)
3. İsim seçimi (basit input)
4. Profil fotoğrafı (opsiyonel, hızlı geçiş)

**Dakika 5-15: Bot Mentor**
1. Chat penceresi açılır (büyük mesaj balonları)
2. Bot mentor kendini tanıtır (animasyonlu)
3. İlk görev verilir (visual indicator)
4. İlk para kazanma (kutlama animasyonu)

**Dakika 15-25: Gerçek Oyuncu Bulma**
1. "Mentor ara" butonu aktif olur
2. Mentor listesi gösterilir (filtrelenebilir)
3. İlk temas kurulur (guided chat)
4. Uzun vadeli plan yapılır (kontrat taslağı)

**Dakika 25-30: İlk İşletme**
1. İşletme türü seçimi (görsel menü)
2. Satın alma onayı (büyük buton)
3. İlk müşteri bulma (chat yönlendirme)
4. İlk kar açıklaması (progress bar)

### **2. Kontrat İmzalama UX Flow**
1. **Kontrat teklifi** chat'te gelir
2. **Risk değerlendirmesi** otomatik gösterilir
3. **Şartlar incelenir** (swipe navigation)
4. **İmza ekranı** büyük butonlarla
5. **Onay** dokunmatik imza veya PIN

### **3. Güven Puanı Güncelleme Flow**
1. **İşlem tamamlanır** (başarılı/başarısız)
2. **Oy verme ekranı** açılır
3. **1-5 yıldız** büyük butonlarla
4. **Yorum yazma** (opsiyonel)
5. **Güven puanı** canlı güncellenir

---

## 🔄 Animasyonlar & Mikro Etkileşimler

### **Onboarding Animasyonları**
- **Bot mentor appearance:** Yukarıdan slide-in
- **İlk para kazanma:** Coin drop effect
- **Mentor bulma:** Pulse effect + haptic feedback
- **İlk kontrat:** Signature animation

### **Günlük Kullanım Animasyonları**
- **Chat mesajı:** Fade-in + typing indicator
- **İtibar değişimi:** Counter animation
- **Para transferi:** Smooth transition
- **Bildirimler:** Bounce + fade

### **Durum Değişiklikleri**
- **Online/Offline:** Status dot animation
- **İşletme durumu:** Color transition
- **Kontrat durumu:** Progress bar fill
- **Mentor assignment:** Connection line draw

---

## 📊 Dashboard Widget'ları

### **Ana Ekran Widget'ları**
1. **İtibar Özeti** (circular progress)
2. **Günlük Kazanç** (trending arrow)
3. **Aktif Kontratlar** (countdown timer)
4. **Chat Activity** (pulse notification)
5. **Mentor Status** (availability indicator)
6. **Market Trends** (mini graph)

### **Widget Hiyerarşisi**
```
┌─────────────────────────────────────┐
│ İtibar: ⭐ 180/200      Para: 💰 2.5K│ (Sabit üst bar)
├─────────────────────────────────────┤
│ [💬 Chat] (3)          [🔔 Bildirim]│ (Birinci öncelik)
├─────────────────────────────────────┤
│ [📊 Portföy]          [🤝 Kontrat]  │ (İkinci öncelik)
├─────────────────────────────────────┤
│ [🏪 İşletme]          [👥 Mentor]   │ (Üçüncü öncelik)
└─────────────────────────────────────┘
```

---

## 🎮 Oyun İçi Feedback Sistemleri

### **Başarı Göstergeleri**
- **İtibar artışı:** ⭐ +5 (yeşil, parlama efekti)
- **Para kazancı:** 💰 +100 TL (altın rengi, up arrow)
- **Kontrat başarısı:** 🎉 (konfeti animasyonu)
- **Mentor bulma:** 🤝 (kalp emoji + vibration)

### **Uyarı Sistemleri**
- **Dolandırıcılık riski:** ⚠️ (sarı, titreşim)
- **İtibar düşüşü:** ⭐ -10 (kırmızı, down arrow)
- **Para kaybı:** 💸 (gri para, fade out)
- **Kontrat ihlali:** 🚫 (kırmızı X, strong haptic)

### **Bilgilendirme Toast'ları**
```
┌─────────────────────────────────────┐
│ ✅ Başarılı! İtibar puanın arttı.   │
│ 🎯 Yeni kontrat fırsatı mevcut!     │
│ ⚠️ Dikkat! Şüpheli aktivite tespit. │
│ 💡 İpucu: Mentor bulman öneriliyor. │
└─────────────────────────────────────┘
```

---

## 🔒 Güvenlik & Güven UI Elements

### **Güven Göstergeleri**
- **Doğrulanmış telefon:** ✅ (yeşil tick)
- **İtibar puanı:** ⭐ 180/200 (renk kodlu)
- **İşlem geçmişi:** 📊 (şeffaf grafik)
- **Mentor onayı:** 🤝 (altın badge)

### **Risk Uyarıları**
- **Yeni hesap:** 🆕 (sarı badge)
- **Düşük itibar:** ⚠️ (turuncu uyarı)
- **Şüpheli aktivite:** 🚨 (kırmızı alarm)
- **Bot hesap:** 🤖 (gri işaret)

### **Kontrat Güvenlik UI**
```
┌─────────────────────────────────────┐
│ 🔒 GÜVENLİK KONTROLÜ                │
├─────────────────────────────────────┤
│ ✅ Telefon doğrulandı               │
│ ⭐ İtibar: 145/200 (Orta risk)      │
│ 📊 10 başarılı işlem                │
│ ❌ 2 başarısız işlem                 │
├─────────────────────────────────────┤
│ Risk Değerlendirmesi: 🟡 ORTA       │
└─────────────────────────────────────┘
```

---

## 📈 Progression & Achievements UI

### **Ünvan Sistemi Gösterimi**
```
┌─────────────────────────────────────┐
│ 🏆 ÜNVAN İLERLEMESİ                 │
├─────────────────────────────────────┤
│ Mevcut: 🌟 Girişimci                │
│ Sonraki: 💼 İş Mogülü               │
├─────────────────────────────────────┤
│ İlerleme: ████████░░ 80%            │
│ Kalan: 2 işletme + 500k TL          │
└─────────────────────────────────────┘
```

### **Achievement Bildirimleri**
```
┌─────────────────────────────────────┐
│ 🎉 YENİ BAŞARI!                     │
│ 🤝 "İlk Mentor" ünvanını kazandın!  │
│ Ödül: +50 itibar puanı              │
│ [Paylaş] [Tamam]                    │
└─────────────────────────────────────┘
```

---

## 🔄 Sonraki Adımlar

### **Tasarım Dökümanlarında Yapılacaklar:**
1. **Wireframe'ler** - Her ekran için detaylı
2. **User Flow Diagramları** - 30 dakika onboarding
3. **Component Library** - Tekrar kullanılabilir elemanlar
4. **Accessibility Guidelines** - Engelli kullanıcı desteği
5. **Dark Mode** - Gece kullanımı için

### **Prototyping Önerileri:**
- **Figma/Adobe XD** mockup'ları
- **Interactive prototype** 30 dakikalık flow
- **A/B testing** tasarım alternatifleri
- **User testing** hedef kitle ile

**Hazırlayan:** Musa & GitHub Copilot  
**Tarih:** 5 Ağustos 2025  
**Versiyon:** 1.0 - İlk Tasarım Rehberi  

---

## 📚 Referans & İnspirasyonlar

**Benzer Uygulamalar:**
- **Discord** - Chat UI/UX
- **Telegram** - Grup yönetimi
- **LinkedIn** - Güven/network sistemi
- **Trading Apps** - Portföy gösterimleri

**Mobil Tasarım Kaynakları:**
- Material Design 3 (Android)
- Human Interface Guidelines (iOS)
- Flutter Widget Catalog
- Microinteractions best practices

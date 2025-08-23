# Chat Entegrasyon Manuel Test Notları

Bu doküman `app.html` içine entegre edilen gerçek zamanlı chat bileşeninin hızlı manuel doğrulaması için hazırlanmıştır.

## Hazırlık
1. Backend (`server/server.js`) çalışıyor ve `/socket.io` endpoint erişilebilir olmalı.
2. Geçerli bir kullanıcıyla giriş yap (login.html üzerinden); localStorage `auth_token` oluşmalı.
3. `app.html` yüklenir; otomatik olarak dashboard açılır.

## Adımlar
### 1. Chat Görünümü Açma
- Sol navigasyonda Chat (💬) butonuna tıkla ⇒ `#view-chat` aktif olmalı.
- İlk açılışta üst kısımda `Bağlanıyor…` rozeti görülmeli; bağlantı kurulunca `Bağlı`.

### 2. Online Sayaç
- Tek istemci: `1 çevrimiçi` görmelisin.
- İkinci tarayıcı/sekme ile aynı kullanıcı veya farklı kullanıcı bağlanınca sayı artar.

### 3. Mesaj Gönderme
- Metin alanına kısa bir mesaj yazıp Enter (CTRL+ENTER) ile gönder.
- Mesaj kutusu temizlenir ve mesaj listesi sona kayar.
- Mesaj satırında kullanıcı adı + saat (HH:MM) yer alır.

### 3.1. Sayfa Yenile Sonrası Kalıcılık
- Chat görünümü açıkken birkaç mesaj gönder.
- Sayfayı F5 ile yenile ve tekrar Chat sekmesine geç.
- Önce "Önceki Mesajlar" rozeti ardından geçmiş mesajların (son ~80) geldiğini gör.

### 4. Flood Koruma (Manuel)
- Hızlıca art arda 10’dan fazla kısa mesaj yolla.
- Sunucu flood limitine takılan mesajlar gelmez (spesifik uyarı UI henüz minimal; ileride geliştirilebilir).

### 5. Bağlantı Kopması
- Backend sunucusunu kısa süre durdur, chat status `Kopuk` olmalı.
- Sunucuyu yeniden başlat: otomatik yeniden bağlanma ve status tekrar `Bağlı`.

### 6. Güvenlik
- Mesaja `<script>alert(1)</script><b>kalın</b>` yaz ve gönder.
- Listede script kısmı çıkmamalı, `<b>` etiketi korunmalı.

### 6.1. Renk / Kontrast Kontrolü
- Karanlık modda (OS ayarı dark) arka plan (#0f172a) üzerinde metin (#f1f5f9) WCAG AA kontrast (>4.5) sağlıyor mu kontrol et.
- Işık modunda (#f1f5f9 / #ffffff) ana metin (#0f172a) kontrastını doğrula.
- Status badge durum renkleri (yeşil, turuncu, kırmızı) üzerinde beyaz metnin okunurluğunu gözle kontrol et; gerekirse gamma düşürme öner.

### 7. Token İptali (Opsiyonel)
- Backend token blacklist mekanizması devreye girdikten sonra token revoke edilirse sonraki mesajların gitmemesi beklenir.

## Gözlemlenen Sorunları Kaydet
- Bağlantı kararsızlığı
- Flood sonrası UX eksikliği
- Scroll “sticky” davranışı anomali

## Geliştirme Önerileri
- Flood limit aşımı için görsel uyarı.
- Mesaj geçmişi paginasyonu (şu an sadece yeni mesajlar).
- Kullanıcı avatar/renk eşleme.
- Markdown hafif biçimlendirme opsiyonu.

---
Kısa test seti tamamlandıktan sonra issues açılabilir.

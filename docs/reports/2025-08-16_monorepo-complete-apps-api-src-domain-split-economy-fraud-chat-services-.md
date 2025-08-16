# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi**:
   - Mevcut `apps/api/src` yapısını analiz et.
   - Her bir domain için (economy, fraud, chat) gereksinimleri belirle.

2. **Klasör Yapısı Oluşturma**:
   - Yeni domain klasörlerini `apps/api/src` altında oluştur.
   - `economy`, `fraud`, ve `chat` için uygun klasör yapısını yerleştir.

3. **Kod Taşıma**:
   - İlgili kod bileşenlerini mevcut yapısından yeni domain klasörlerine taşı.
   - Her domain için ilgili dosyaların taşındığından emin ol.

4. **Bağımlılıkların Güncellenmesi**:
   - Taşınan kodların bağımlılıklarını kontrol et ve güncelle.
   - Her domain için gerekli bağımlılıkları tanımla ve güncelle.

5. **Testlerin Güncellenmesi ve Çalıştırılması**:
   - Her domain için test dosyalarını güncelle.
   - Tüm testlerin başarılı bir şekilde çalıştığını doğrula.

— Agent: GameBY Agent • 2025-08-16T12:21:46.943Z

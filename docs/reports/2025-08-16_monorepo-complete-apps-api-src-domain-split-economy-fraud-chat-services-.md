# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Ekonomi Servisinin Ayrılması**
   - `apps/api/src/economy` dizinini oluştur ve mevcut ekonomi ile ilgili dosyaları buraya taşı.
   - İlgili bağımlılıkları ve yapılandırmaları güncelle.

2. **Dolandırıcılık Servisinin Ayrılması**
   - `apps/api/src/fraud` dizinini oluştur ve mevcut dolandırıcılık ile ilgili dosyaları buraya taşı.
   - İlgili bağımlılıkları ve yapılandırmaları güncelle.

3. **Sohbet Servisinin Ayrılması**
   - `apps/api/src/chat` dizinini oluştur ve mevcut sohbet ile ilgili dosyaları buraya taşı.
   - İlgili bağımlılıkları ve yapılandırmaları güncelle.

4. **Yapılandırma ve Bağımlılıkların Gözden Geçirilmesi**
   - Her yeni servisin bağımlılıklarını ve yapılandırmalarını kontrol et ve güncelle.
   - Ortak yapılandırmaları merkezileştir.

5. **Test ve Doğrulama**
   - Her bir servisin çalışma durumunu kontrol etmek için otomatik testler oluştur.
   - Tüm sistemin entegrasyonunu sağla ve testleri geçip geçmediğini doğrula.

— Agent: GameBY Agent • 2025-08-16T14:12:11.699Z

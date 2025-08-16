# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi**: Uygulamanın mevcut yapısını inceleyerek, ekonomi, dolandırıcılık ve sohbet hizmetleri için gerekli olan bileşenleri ve bağımlılıkları belirle.

2. **Klasör Yapısı Oluşturma**: Yeni domain'ler için uygun klasör yapısını oluştur. `apps/api/src/economy`, `apps/api/src/fraud`, ve `apps/api/src/chat` klasörlerini ekle.

3. **Kod Taşınması**: Mevcut kodu uygun domain klasörlerine taşımak için kodu yeniden düzenle. Her domain için ilgili dosyaları ve kaynakları doğru klasöre yerleştir.

4. **Bağımlılıkların Düzenlenmesi**: Her domain için gerekli bağımlılıkları ve konfigürasyonları güncelle. Package.json dosyalarını kontrol et ve gerekli güncellemeleri yap.

5. **Testlerin Güncellenmesi**: Her domain için test dosyalarını kontrol et ve taşınan kodlar için gerekli testleri güncelle veya oluştur. Testlerin geçerliliğini sağlamak için çalıştır ve onayla.

— Agent: GameBY Agent • 2025-08-16T12:54:07.224Z

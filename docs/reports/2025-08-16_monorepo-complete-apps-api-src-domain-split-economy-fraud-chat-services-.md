# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısı Tasarımı**: apps/api/src içinde ekonomi, dolandırıcılık ve sohbet hizmetleri için yeni klasör yapısını oluşturun. Her bir hizmetin alt klasörlerini ve gerekli dosya yapısını planlayın.

2. **Kod Ayrıştırma**: Mevcut kodları ekonomi, dolandırıcılık ve sohbet hizmetlerine göre ayrıştırın. Her bir hizmet için ilgili sınıflar ve fonksiyonlar yeni dosyalara taşınmalıdır.

3. **Bağımlılık Yönetimi**: Her yeni hizmet için gerekli bağımlılıkları belirleyin ve bunları ayrı bir şekilde yönetin. Bağımlılıkların her hizmet için doğru bir şekilde tanımlandığından emin olun.

4. **API Arayüzlerinin Güncellenmesi**: Ayrıştırılan hizmetlerin API arayüzlerini güncelleyerek her bir hizmetin kendi API'sine sahip olmasını sağlayın. Gerekli dokümantasyonu oluşturun.

5. **Testlerin Güncellenmesi ve Doğrulama**: Ayrıştırılan kodlar için yeni testler yazın ve mevcut testleri güncelleyin. Tüm testlerin başarılı bir şekilde geçmesini sağlayın.

— Agent: GameBY Agent • 2025-08-16T12:45:16.996Z


## Fail checkpoint (attempt 1)
- time: 2025-08-16T12:45:46.038Z
- reason: Command failed: npm test

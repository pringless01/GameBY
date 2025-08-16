# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

Alt Adım 1: Proje Yapısını Gözden Geçirme
- Mevcut apps/api/src dizin yapısını incele ve hangi dosya ve klasörlerin hangi domainlere ait olduğunu belirle.

Alt Adım 2: Domain Klasörlerinin Oluşturulması
- economy, fraud ve chat servisleri için gerekli klasör yapısını oluştur. apps/api/src altında yeni dizinler yarat.

Alt Adım 3: Kodun Taşınması
- Mevcut kodu uygun domain klasörlerine taşı. Her bir domain için ilgili dosyaların doğru dizinlere yerleştirildiğinden emin ol.

Alt Adım 4: Bağımlılıkların Güncellenmesi
- Taşınan dosyaların bağımlılıklarını kontrol et ve gerekirse import yollarını güncelle. Her domainin kendi bağımlılıklarını doğru bir şekilde yönettiğinden emin ol.

Alt Adım 5: Testlerin Güncellenmesi ve Çalıştırılması
- Taşınan kodlar için unit testleri kontrol et, güncelle ve tüm testlerin başarılı bir şekilde geçtiğinden emin ol.

— Agent: GameBY Agent • 2025-08-16T12:48:50.161Z


## Fail checkpoint (attempt 3)
- time: 2025-08-16T12:49:19.313Z
- reason: Command failed: npm test

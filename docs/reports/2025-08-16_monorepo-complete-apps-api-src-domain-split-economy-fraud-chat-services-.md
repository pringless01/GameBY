# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analysis**: Mevcut apps/api/src yapısındaki tüm domain bileşenlerini analiz et ve hangi bileşenlerin economy, fraud ve chat hizmetlerine ait olduğunu belirle.

2. **Directory Structure Creation**: Yeni domain yapısına uygun olarak klasör yapısını oluştur. "economy", "fraud" ve "chat" adında üç ayrı klasör oluştur.

3. **Code Refactoring**: Mevcut kodu, belirlenen domainlere göre ilgili klasörlere taşımak için refactor et. Her domain için gereken dosyaları ve bağımlılıkları doğru bir şekilde yeniden düzenle.

4. **Update Imports**: Taşınan dosyalar için import yollarını güncelle. Yeni klasör yapısına uygun olarak tüm dosya içi importları kontrol et ve düzelt.

5. **Testing and Validation**: Her domain için test senaryolarını oluştur ve tüm sistemin düzgün çalıştığından emin olmak için testleri çalıştır. Başarılı sonuçlar elde edildiğinde değişiklikleri kaydet.

— Agent: GameBY Agent • 2025-08-16T12:49:37.053Z


## Fail checkpoint (attempt 1)
- time: 2025-08-16T12:50:06.107Z
- reason: Command failed: npm test

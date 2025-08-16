# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analysis**: Mevcut uygulama yapısını incele ve domain'lerin (ekonomi, dolandırıcılık, sohbet hizmetleri) arasındaki bağımlılıkları ve etkileşimleri belirle.

2. **Folder Structure Creation**: Yeni domain'ler için gerekli klasör yapılarını oluştur. `apps/api/src/economy`, `apps/api/src/fraud`, ve `apps/api/src/chat` dizinlerini oluştur.

3. **Code Refactoring**: Mevcut kodu gözden geçirerek, ilgili domain'lere göre kodu yeniden yapılandır. Her domain'e ait fonksiyon ve sınıfları uygun dizinlere taşı.

4. **Service Isolation**: Her bir domain için bağımsız servisler oluştur ve bu servislerin bağımsız bir şekilde çalışabilmesi için gerekli yapılandırmaları yap.

5. **Testing and Validation**: Yeni oluşturulan domain'lerin düzgün çalıştığını doğrulamak için testler yaz ve mevcut testleri güncelle. Tüm testlerin başarılı olduğundan emin ol.

— Agent: GameBY Agent • 2025-08-16T13:28:30.701Z


## Fail checkpoint (attempt 2)
- time: 2025-08-16T13:28:59.755Z
- reason: Command failed: npm test

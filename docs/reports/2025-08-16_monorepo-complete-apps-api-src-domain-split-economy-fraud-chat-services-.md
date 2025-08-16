# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analysis**: Mevcut `apps/api/src` yapısını incele ve her bir domain (economy, fraud, chat) için gerekli kaynakları belirle. 

2. **Folder Structure Creation**: Yeni domain yapısını oluşturmak için `apps/api/src/economy`, `apps/api/src/fraud`, ve `apps/api/src/chat` klasörlerini oluştur.

3. **Service Refactoring**: Mevcut API servislerini, ilgili domain klasörlerine taşı ve her bir domain için spesifik işlevselliği sağlayacak şekilde yeniden yapılandır.

4. **Dependency Management**: Her bir domain için bağımlılıkları güncelle ve gerekli olan kütüphaneleri yalnızca ilgili domain klasörlerinde kullanılacak şekilde yapılandır.

5. **Testing and Validation**: Yeni yapı ve domain hizmetlerinin düzgün çalıştığını doğrulamak için testleri güncelle ve çalıştır.

— Agent: GameBY Agent • 2025-08-16T11:59:10.983Z

# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analysis**: Uygulamanın mevcut mimarisini ve domainlerini analiz et. Hangi bileşenlerin ekonomi, dolandırıcılık ve sohbet hizmetlerine ayrılacağını belirle.

2. **Directory Structure Creation**: Yeni domain yapısına uygun dizin yapısını oluştur. `apps/api/src/economy`, `apps/api/src/fraud`, ve `apps/api/src/chat` dizinlerini ekle.

3. **Code Refactoring**: Mevcut kodu uygun domain dizinlerine taşı. Her domainin ilgili bileşenleri ve işlevselliğini doğru dizinlere yerleştir.

4. **Update Imports and Exports**: Taşınan kodların import ve export ifadelerini güncelle. Yeni dizin yapısına uygun olarak dosya yollarını ve modül referanslarını ayarla.

5. **Testing and Validation**: Taşınan bileşenler için testleri çalıştır ve her domainin düzgün çalıştığını doğrula. Gerekirse yeni testler ekle.

— Agent: GameBY Agent • 2025-08-16T14:39:17.705Z

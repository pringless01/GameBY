# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analysis**: Uygulama içindeki mevcut domain yapısını analiz et ve hangi bileşenlerin ekonomi, dolandırıcılık ve sohbet hizmetlerine ait olduğunu belirle.

2. **Directory Structure Creation**: Yeni domain yapısına uygun olarak dosya ve dizin yapısını oluştur. `economy`, `fraud` ve `chat` dizinlerini `apps/api/src` altında oluştur.

3. **Code Refactoring**: Mevcut kodları belirlenen yeni dizinlere taşı ve her bir service için gerekli bağımlılıkları güncelle. Kodun tüm bileşenlerinin doğru çalıştığından emin ol.

4. **Testing**: Yeni domain yapısına uygun olarak unit testleri yaz ve mevcut testleri güncelle. Tüm testlerin başarılı bir şekilde geçmesini sağla.

5. **Documentation Update**: Yeni domain yapısı ve değişiklikler hakkında belgeleri güncelle. Kullanıcıların ve geliştiricilerin yeni yapıyı anlamasını kolaylaştır.

Rapor: docs/reports/2023-10-04_domain_split_plan.md
Hafıza: agent/memory/project_facts.md append.

— Agent: GameBY Agent • 2025-08-16T13:17:54.914Z

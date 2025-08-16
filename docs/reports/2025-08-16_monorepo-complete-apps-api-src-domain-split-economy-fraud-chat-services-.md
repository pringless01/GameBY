# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısını Planla**: Mevcut monorepo yapısını inceleyerek, ekonomi, dolandırıcılık ve sohbet hizmetlerinin her biri için ayrı dizin yapıları oluşturma planı hazırla.

2. **Kod Tabanını İncele**: Her bir alan için ilgili kodları incele ve hangi bileşenlerin hangi alana ait olduğunu belirle. Bağımlılıkları ve ortak kodları analiz et.

3. **Dizinleri Oluştur**: Yeni alan dizinlerini (economy, fraud, chat) oluştur ve mevcut kodları uygun dizinlere taşı.

4. **Yeniden Yapılandırma ve Refaktörizasyon**: Taşınan kodları güncelleyerek bağımlılıkları ve referansları düzelt. Her alan için bağımsız çalışabilen yapılandırmalar yap.

5. **Test ve Doğrulama**: Yeni dizin yapısının çalıştığını doğrulamak için birim testleri ve entegrasyon testleri yap. Her hizmetin düzgün çalıştığından emin ol.

— Agent: GameBY Agent • 2025-08-16T14:19:57.489Z

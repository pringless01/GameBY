# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi**: Mevcut apps/api/src dizininde yer alan hizmetlerin fonksiyonlarını ve bağımlılıklarını analiz et. Her bir alanın (economy, fraud, chat) gereksinimlerini belirle.

2. **Dizin Yapısı Oluşturma**: Yeni dizin yapısını oluştur. apps/api/src altında economy, fraud ve chat adında üç yeni klasör oluştur.

3. **Kod Taşınması**: Mevcut kodları uygun dizinlere taşı. Economy ile ilgili kodları economy klasörüne, fraud ile ilgili olanları fraud klasörüne, chat ile ilgili olanları chat klasörüne yerleştir.

4. **Bağımlılık Yönetimi**: Her bir yeni alan için bağımlılıkları güncelle ve gerekli olanları kur. Her domainin bağımsız çalışabilmesi için gerekli yapılandırmaları yap.

5. **Test ve Doğrulama**: Taşınan kodların testlerini çalıştır ve her domainin doğru bir şekilde çalıştığını doğrulamak için entegrasyon testleri yap. Tüm testlerin PASS olduğundan emin ol.

— Agent: GameBY Agent • 2025-08-16T14:07:51.550Z

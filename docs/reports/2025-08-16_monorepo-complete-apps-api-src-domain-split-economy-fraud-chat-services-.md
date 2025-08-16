# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analysis**: Mevcut uygulama yapısının ve bölümlerin detaylı analizi yapılacak. Ekonomi, dolandırıcılık ve sohbet servisleri arasındaki bağımlılıklar ve etkileşimler belirlenecek.

2. **Directory Structure Creation**: Yeni dizin yapısı oluşturulacak. Her bir alan için (economy, fraud, chat) ayrı klasörler oluşturulacak ve gerekli dosya yerleşimleri planlanacak.

3. **Service Migration**: Mevcut kod tabanındaki ilgili hizmetlerin yeni dizin yapısına taşınması gerçekleştirilecek. Her bir alan için ilgili dosyalar ve bağımlılıklar aktarılacak.

4. **Refactoring and Configuration**: Taşınan kodların gerekli refactoring işlemleri yapılacak. Servislerin bağımsız çalışabilmesi için gerekli konfigürasyon ayarları güncellenecek.

5. **Testing and Validation**: Yeni dizin yapısındaki hizmetlerin düzgün çalıştığından emin olmak için testler yapılacak. Tüm sistemin entegrasyon testleri gerçekleştirilecek ve sonuçlar değerlendirilecek.

— Agent: GameBY Agent • 2025-08-16T14:57:33.796Z

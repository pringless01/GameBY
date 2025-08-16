# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Alt Adım 1: Domain Yapısını Belirleme**
   - Mevcut uygulama yapısındaki domain'lerin (ekonomi, dolandırıcılık, sohbet hizmetleri) belirlenmesi ve her birinin bağımsız olarak nasıl yapılandırılacağını planlama.

2. **Alt Adım 2: Kod Tabanını Analiz Etme**
   - Uygulama kod tabanını inceleyerek hangi bileşenlerin her bir domain'e ait olduğunu belirleme ve bu bileşenleri ayrı modüllere ayırma gereğini değerlendirme.

3. **Alt Adım 3: Modül Ayrıştırma**
   - Belirlenen domain'lere göre mevcut kodu modüllere ayırma işlemini gerçekleştirme. Her bir modül için gerekli bağımlılıkları ve dosya yapılarını oluşturma.

4. **Alt Adım 4: Entegrasyon Testleri Hazırlama**
   - Ayrıştırılan her bir domain için entegrasyon testleri geliştirme. Her domain'in bağımsız çalıştığından ve diğer domain'lerle uyumlu olduğundan emin olma.

5. **Alt Adım 5: Dokümantasyon ve Raporlama**
   - Yapılan değişiklikleri ve yeni yapılandırmayı belgeleme. Kullanıcılar ve geliştiriciler için gerekli dökümantasyonları oluşturma ve güncellenmiş yapıyı raporlama.

— Agent: GameBY Agent • 2025-08-16T13:18:47.314Z

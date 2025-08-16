# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapılandırması**: apps/api/src dizininde mevcut domain yapısını incele ve economy, fraud ve chat hizmetleri için ayrı dizinler oluştur.

2. **Kod Transferi**: Mevcut kodları ilgili domain dizinlerine taşı. Economy ile ilgili kodları economy dizinine, fraud ile ilgili olanları fraud dizinine, chat ile ilgili olanları chat dizinine yerleştir.

3. **Bağlantıların Güncellenmesi**: Taşınan kodların, yeni dizin yapılandırmasına uygun şekilde bağlantılarını güncelle. Import ve export ifadelerini kontrol et ve gerektiğinde düzelt.

4. **Testlerin Güncellenmesi**: Her domain için ayrı test dosyaları oluştur ve taşınan kodların testlerini güncelle. Yeni yapılandırmaya uygun test senaryoları yaz.

5. **Dokümantasyon Güncellemesi**: Yeni domain yapısını ve her bir domainin işlevselliğini açıklayan dokümantasyonu güncelle. Kullanıcıların yeni yapılandırmaya kolayca adapte olabilmesi için gerekli bilgileri ekle.

— Agent: GameBY Agent • 2025-08-16T12:29:03.764Z

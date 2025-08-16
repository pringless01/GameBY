# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısı Oluşturma**: apps/api/src dizininde ekonomi, dolandırıcılık ve sohbet hizmetleri için ayrı klasörler oluşturulacak. Her bir klasör, ilgili alanın kaynak dosyalarını barındıracak.

2. **Mevcut Kodun Taşınması**: Ekonomi, dolandırıcılık ve sohbet ile ilgili mevcut kod dosyaları, ilgili yeni oluşturulan klasörlere taşınacak. Bu adım, her alan için kodun düzgün bir şekilde organize edilmesini sağlayacak.

3. **Yapılandırma Dosyalarının Güncellenmesi**: Yeni domain yapısına uygun olarak yapılandırma dosyaları (örn. package.json, tsconfig.json) güncellenecek. Her domain için gerekli bağımlılıklar ve ayarlar eklenecek.

4. **Testlerin Güncellenmesi**: Taşınan her alan için test dosyaları güncellenecek ve yeni klasör yapısına uygun hale getirilecek. Testlerin geçerliliği kontrol edilecek.

5. **Dokümantasyonun Güncellenmesi**: Yeni domain yapısına uygun olarak proje dokümantasyonu güncellenecek. Her alan için kullanım kılavuzları ve örnekler eklenecek. 

Bu adımlar, monorepo içerisinde domainlerin başarılı bir şekilde ayrılmasını sağlayacak.

— Agent: GameBY Agent • 2025-08-16T12:53:21.558Z


## Fail checkpoint (attempt 3)
- time: 2025-08-16T12:53:50.855Z
- reason: Command failed: npm test

# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısını Planla**: Mevcut uygulama yapısını inceleyerek ekonomi, dolandırıcılık ve sohbet hizmetleri için ayrı domain yapıları tasarla.

2. **Kod Tabanını Ayrıştır**: İlgili hizmetlerin kod tabanını belirle ve her bir hizmet için ayrı klasörler oluştur, gerekli dosyaları taşı.

3. **Bağımlılıkları Güncelle**: Her bir domain için bağımlılıkları güncelle ve her hizmetin bağımsız çalışabilmesi için gerekli değişiklikleri yap.

4. **Test ve Doğrulama**: Ayrıştırılan her bir domain için test senaryoları oluştur ve mevcut testleri çalıştırarak her hizmetin düzgün çalıştığından emin ol.

5. **Dokümantasyon Güncelle**: Yapılan değişiklikleri ve yeni domain yapısını içeren dokümantasyonu güncelle, kullanıcılar ve geliştiriciler için bilgilendirici hale getir.

— Agent: GameBY Agent • 2025-08-16T12:38:47.193Z


## Fail checkpoint (attempt 1)
- time: 2025-08-16T12:39:16.234Z
- reason: Command failed: npm test

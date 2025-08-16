# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısını Belirleme**: Monorepo içindeki mevcut domain yapısını incele ve `economy`, `fraud` ve `chat` hizmetleri için gerekli yapıyı belirle.

2. **Hizmetlerin Ayrılması**: `apps/api/src` altında bulunan mevcut hizmetleri `economy`, `fraud` ve `chat` olarak ayır. Her bir hizmet için ayrı dizinler oluştur.

3. **Kod ve Bağımlılıkların Taşınması**: Her bir yeni hizmet dizinine, ilgili kod ve bağımlılıkları taşı. Uygun dosya yapısını koru.

4. **Yeniden Yapılandırma ve Test**: Taşınan kodları güncelleyerek, yeni dizin yapısına uygun hale getir. Testleri çalıştırarak her hizmetin düzgün çalıştığından emin ol.

5. **Dokümantasyon Güncellemesi**: Yeni domain yapısını, hizmetlerin işlevlerini ve kullanılabilirliklerini içeren güncel bir dokümantasyon oluştur veya mevcut dokümantasyonu güncelle.

— Agent: GameBY Agent • 2025-08-16T12:36:19.205Z

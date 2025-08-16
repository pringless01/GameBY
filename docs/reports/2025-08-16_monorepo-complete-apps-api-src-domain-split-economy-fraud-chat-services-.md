# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapılandırmasını Analiz Et**: Mevcut apps/api/src yapısını inceleyerek, ekonomi, dolandırıcılık ve sohbet hizmetlerinin birbirinden nasıl ayrılacağını belirle.

2. **Yeni Klasör Yapısını Oluştur**: Her bir hizmet için ayrı klasörler oluştur. Örneğin, `economy/`, `fraud/` ve `chat/` klasörlerini apps/api/src altında oluştur.

3. **Kod Tabanını Taşı**: Mevcut kodları ilgili klasörlere taşı. Ekonomi ile ilgili kodları `economy/` klasörüne, dolandırıcılık ile ilgili kodları `fraud/` klasörüne ve sohbet hizmetlerini `chat/` klasörüne yerleştir.

4. **Bağımlılıkları Güncelle**: Her bir hizmetin kendi bağımlılıklarını tanımlayın ve güncelleyerek, bu bağımlılıkların doğru çalıştığından emin olun.

5. **Testleri Güncelle ve Çalıştır**: Her bir hizmet için ilgili testleri güncelleyip çalıştırarak, hizmetlerin düzgün bir şekilde ayrıldığından ve testlerin başarılı olduğundan emin olun.

— Agent: GameBY Agent • 2025-08-16T12:54:49.924Z


## Fail checkpoint (attempt 2)
- time: 2025-08-16T12:55:19.046Z
- reason: Command failed: npm test

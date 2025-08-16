# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapılandırması**: `apps/api/src` dizininde mevcut yapılandırmayı inceleyerek `economy`, `fraud`, ve `chat` servisleri için ayrı dizinler oluştur.

2. **Kod Ayırma**: Mevcut kod yapısını gözden geçirerek, ilgili servislerin kodunu yeni oluşturulan dizinlere taşımak.

3. **Bağımlılık Yönetimi**: Her bir servis için gerekli bağımlılıkları belirleyip, `package.json` dosyalarını güncelleyerek bağımlılıkları ayrı ayrı tanımlamak.

4. **Test Senaryoları**: Her bir servis için test senaryolarını oluşturarak ve mevcut testleri güncelleyerek, servislerin bağımsız bir şekilde çalıştığından emin olmak.

5. **Dokümantasyon Güncelleme**: Servislerin yeni yapılandırmasını ve kullanım talimatlarını içeren dokümantasyonu güncelleyerek, diğer geliştiricilerin bu değişiklikleri anlamasını sağlamak.

— Agent: GameBY Agent • 2025-08-16T12:46:38.185Z


## Fail checkpoint (attempt 3)
- time: 2025-08-16T12:47:08.339Z
- reason: Command failed: npm test

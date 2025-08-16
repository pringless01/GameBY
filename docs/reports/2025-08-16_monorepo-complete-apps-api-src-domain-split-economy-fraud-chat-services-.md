# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapılandırması**: apps/api/src dizinindeki mevcut dosya yapısını analiz et ve domain bazında (economy, fraud, chat) yeni dizin yapısını oluştur.

2. **Kod Taşınması**: Kod dosyalarını mevcut dizinlerden yeni oluşturulan domain dizinlerine taşımak için gerekli adımları belirle ve uygulamaya başla.

3. **Bağımlılık Güncellemeleri**: Yeni dizin yapısı altında, domainlere özgü bağımlılıkları güncelle ve her domain için gerekli olan konfigürasyonları ayarla.

4. **Test Senaryoları Yazma**: Her bir domain için test senaryolarını oluştur; taşınan kodların beklenen şekilde çalıştığını doğrulamak için unit testler yaz.

5. **Dokümantasyon Güncellemesi**: Yeni domain yapısını ve taşınan kod ile ilgili güncellemeleri içeren dokümantasyonu güncelle ve projenin README dosyasına ekle.

— Agent: GameBY Agent • 2025-08-16T14:15:56.999Z


## Fail checkpoint (attempt 1)
- time: 2025-08-16T14:16:01.349Z
- reason: Command failed: npm run lint

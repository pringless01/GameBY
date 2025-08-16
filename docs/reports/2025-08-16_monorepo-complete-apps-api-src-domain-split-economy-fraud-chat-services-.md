# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapılandırması**: `apps/api/src` dizininde mevcut domain yapısını analiz et ve `economy`, `fraud` ve `chat` servisleri için gerekli klasörleri oluştur.

2. **Service Split İşlemi**: Her domain için ayrı servis dosyalarını oluştur ve mevcut işlevselliği ilgili domain klasörlerine taşı.

3. **Bağımlılık Yönetimi**: Taşınan kodların bağımlılıklarını güncelle ve `package.json` dosyalarını her bir domain servisi için ayarla.

4. **Testlerin Güncellenmesi**: Her domain için yeni test dosyaları oluştur ve mevcut testleri yeni yapıya uygun hale getir.

5. **Dokümantasyon Güncellemesi**: Domain split işlemi ile ilgili dokümantasyonu güncelle ve yeni yapının nasıl çalıştığını açıklayan bilgiler ekle.

— Agent: GameBY Agent • 2025-08-16T13:40:34.260Z


## Fail checkpoint (attempt 1)
- time: 2025-08-16T13:41:03.380Z
- reason: Command failed: npm test

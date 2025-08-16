# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

### Alt Adım 1: Proje Yapısını Gözden Geçir
- Mevcut `apps/api/src` yapısını incele ve hangi dosya ve klasörlerin bölünmesi gerektiğini belirle.

### Alt Adım 2: Domain Tanımlarını Oluştur
- Her bir domain için (economy, fraud, chat) gerekli olan sınıfları ve arayüzleri tanımla.

### Alt Adım 3: Klasör Yapısını Oluştur
- `apps/api/src` altında yeni klasörler oluştur: `economy`, `fraud`, `chat`.

### Alt Adım 4: Kodları Taşı
- Mevcut kodları belirlenen domain klasörlerine uygun olarak taşı.

### Alt Adım 5: Testleri Güncelle
- Yeni yapı ve taşınan kodlara uygun testleri yaz ve mevcut testlerin çalıştığını doğrula.

— Agent: GameBY Agent • 2025-08-16T13:42:44.531Z


## Fail checkpoint (attempt 1)
- time: 2025-08-16T13:43:13.552Z
- reason: Command failed: npm test

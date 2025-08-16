# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Proje Klasör Yapısını Gözden Geçir**: Mevcut apps/api/src yapısını inceleyerek, ekonomi, dolandırıcılık ve sohbet hizmetleri için gerekli olan alt klasörleri belirle.

2. **Klasörleri Oluştur**: Belirlenen alt alanlar için yeni klasör yapısını oluştur. Bu, economy, fraud ve chat klasörlerini içerir.

3. **Kodları Taşı**: Mevcut kodları ilgili alanların yeni klasörlerine taşı. Her bir hizmetin kodunu doğru klasöre yerleştir.

4. **Bağımlılıkları Güncelle**: Taşınan kodların bağımlılıklarını kontrol et ve güncelledikten sonra her bir alt alan için gerekli olan bağımlılıkları yükle.

5. **Testleri Güncelle ve Çalıştır**: Her bir alt alan için test dosyalarını güncelle ve tüm sistemin düzgün çalıştığını doğrulamak için test sürecini başlat.

— Agent: GameBY Agent • 2025-08-16T13:15:43.711Z


## Fail checkpoint (attempt 3)
- time: 2025-08-16T13:16:12.880Z
- reason: Command failed: npm test

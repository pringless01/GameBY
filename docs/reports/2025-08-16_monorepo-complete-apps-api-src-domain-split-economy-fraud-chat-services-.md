# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Tanımlama ve Analiz**: Mevcut apps/api/src yapısını inceleyerek, ekonomi, dolandırıcılık ve sohbet hizmetleri için gerekli olan domain bileşenlerini tanımla ve analiz et.

2. **Klasör Yapısı Oluşturma**: apps/api/src altında ekonomi, dolandırıcılık ve sohbet hizmetleri için ayrı klasörler oluştur. Her bir domain için gerekli alt klasörleri ve dosya yapısını belirle.

3. **Kod Taşıma ve Ayrıştırma**: Var olan kodu ilgili domain klasörlerine taşı ve her bir domain için bağımsız hale getir. Kodun doğru çalıştığından emin olmak için gerekli testleri gerçekleştir.

4. **Bağımlılıkların Yeniden Yapılandırılması**: Her bir domainin bağımlılıklarını ve konfigürasyon ayarlarını belirle. Gerekli olan bağımlılıkları güncelle ve projeyi yeniden yapılandır.

5. **Dokümantasyon ve Temizlik**: Yapılan değişiklikleri ve yeni yapılandırmaları belgeleyerek, gereksiz dosyaları ve kodları temizle. Böylece proje düzenli ve anlaşılır bir hale getirilsin.

— Agent: GameBY Agent • 2025-08-16T14:15:36.393Z


## Fail checkpoint (attempt 3)
- time: 2025-08-16T14:15:40.817Z
- reason: Command failed: npm run lint

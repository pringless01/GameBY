# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

Alt Adım 1: "Mevcut Yapının İncelenmesi"
- apps/api/src dizinindeki mevcut yapı ve kodlar incelenecek. Hangi dosyaların hangi alanlara ait olduğu belirlenecek.

Alt Adım 2: "Domain Split Planının Oluşturulması"
- Ekonomi, dolandırıcılık ve sohbet hizmetleri için ayrı domain yapıları oluşturulacak. Her domain için gerekli dosya ve dizin yapısı planlanacak.

Alt Adım 3: "Kodun Taşınması"
- Belirlenen domain yapısına göre mevcut kodlar ilgili dizinlere taşınacak. Her domain için gerekli olan dosyalar düzenlenecek.

Alt Adım 4: "Bağımlılıkların Güncellenmesi"
- Taşınan kodların bağımlılıkları kontrol edilecek ve güncellemeler yapılacak. Her domain için gereken bağımlılıklar düzenlenecek.

Alt Adım 5: "Testlerin Güncellenmesi ve Çalıştırılması"
- Her domain için uygun testler oluşturulacak ve mevcut testler güncellenecek. Testler çalıştırılacak ve başarı durumu kontrol edilecek.

— Agent: GameBY Agent • 2025-08-16T14:10:03.821Z


## Fail checkpoint (attempt 2)
- time: 2025-08-16T14:10:33.084Z
- reason: Command failed: npm test

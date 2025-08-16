# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

Alt Adım 1: "Domain Yapısını Analiz Et"
- apps/api/src dizinindeki mevcut yapı incelenecek.
- Ekonomi, dolandırıcılık ve sohbet hizmetlerine ait dosyalar belirlenecek.

Alt Adım 2: "Yeni Dizin Yapısını Oluştur"
- Ekonomi, dolandırıcılık ve sohbet hizmetleri için yeni dizinler oluşturulacak.
- apps/api/src altında `economy`, `fraud`, ve `chat` dizinleri oluşturulacak.

Alt Adım 3: "Dosyaları Taşı"
- Belirlenen hizmetlere ait dosyalar uygun yeni dizinlere taşınacak.
- Taşınma sırasında dosya bağlantıları ve içe aktarmalar güncellenecek.

Alt Adım 4: "Yeniden Düzenlenen Yapıyı Test Et"
- Taşınan dosyaların doğru çalıştığını doğrulamak için testler yazılacak.
- Tüm hizmetlerin işlevselliği test edilecek.

Alt Adım 5: "Dokümantasyonu Güncelle"
- Yeni dizin yapısı ve taşınan dosyalar hakkında dokümantasyon güncellenecek.
- Geliştirici rehberi ve kullanım kılavuzları düzenlenecek.

— Agent: GameBY Agent • 2025-08-16T13:35:37.336Z


## Fail checkpoint (attempt 3)
- time: 2025-08-16T13:36:06.699Z
- reason: Command failed: npm test

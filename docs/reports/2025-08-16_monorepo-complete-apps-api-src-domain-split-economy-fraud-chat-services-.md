# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

Alt Adım 1: **Ekonomi Servisini Ayırma**
- apps/api/src/economy dizini oluşturulacak.
- Mevcut ekonomi ile ilgili kodlar bu dizine taşınacak.
- Ekonomi servisi için gerekli bağımlılıklar güncellenecek.

Alt Adım 2: **Dolandırıcılık Servisini Ayırma**
- apps/api/src/fraud dizini oluşturulacak.
- Mevcut dolandırıcılık ile ilgili kodlar bu dizine taşınacak.
- Dolandırıcılık servisi için gerekli bağımlılıklar güncellenecek.

Alt Adım 3: **Sohbet Servisini Ayırma**
- apps/api/src/chat dizini oluşturulacak.
- Mevcut sohbet ile ilgili kodlar bu dizine taşınacak.
- Sohbet servisi için gerekli bağımlılıklar güncellenecek.

Alt Adım 4: **Yapılandırma Dosyalarını Güncelleme**
- Her bir servis için yapılandırma dosyaları güncellenecek.
- Servislerin bağımsız çalışabilmesi için gerekli ayarlar yapılacak.

Alt Adım 5: **Test ve Doğrulama**
- Yeni dizin yapısında her servisin testleri çalıştırılacak.
- Tüm servislerin düzgün çalıştığından emin olunacak ve gerekli düzeltmeler yapılacak.

— Agent: GameBY Agent • 2025-08-16T12:07:31.843Z

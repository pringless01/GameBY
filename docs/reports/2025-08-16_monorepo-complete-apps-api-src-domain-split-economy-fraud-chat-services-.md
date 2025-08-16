# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısını Belirleme**: apps/api/src dizinindeki mevcut yapı ve hizmetleri değerlendirerek, ekonomi, dolandırıcılık ve sohbet hizmetleri için uygun alt dizin yapısını oluştur.

2. **Kod Ayrıştırması**: Mevcut kodu analiz ederek, her hizmet için gerekli olan bileşenleri (modüller, sınıflar, fonksiyonlar) belirle ve bunları ilgili alt dizinlere taşı.

3. **Bağımlılık Yönetimi**: Her bir hizmetin bağımlılıklarını gözden geçir, bağımlılıkları izole et ve her hizmetin kendi bağımlılıklarını yönetebilmesi için gerekli yapılandırmaları yap.

4. **Yapılandırma Dosyaları**: Her hizmet için ayrı yapılandırma dosyaları oluştur; bu dosyaların her bir hizmet için gerekli olan ayarları içermesini sağla.

5. **Test ve Doğrulama**: Her hizmetin düzgün çalıştığını doğrulamak için test senaryoları yaz ve testleri çalıştırarak tüm sistemin geçerli olduğundan emin ol.

— Agent: GameBY Agent • 2025-08-16T12:20:59.868Z

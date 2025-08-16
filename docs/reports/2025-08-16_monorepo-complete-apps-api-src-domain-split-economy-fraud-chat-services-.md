# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Split Planlama**: Mevcut apps/api/src yapısını analiz et ve ekonomi, dolandırıcılık ve sohbet hizmetleri için ayrı dizin yapıları oluştur. 

2. **Kod Tabanını Bölme**: Ekonomi, dolandırıcılık ve sohbet hizmetleri için gerekli dosyaları ve sınıfları mevcut kod tabanından ayırarak yeni dizinlere taşı.

3. **Bağımlılık Yönetimi**: Yeni dizinlerde kullanılacak bağımlılıkları tanımla ve yönet; her bir domain için ayrı bağımlılık dosyaları oluştur.

4. **Test Senaryolarını Güncelleme**: Her bir domain için test senaryolarını güncelle ve yeni dizin yapısına uygun hale getir.

5. **CI/CD Ayarları**: Sürekli Entegrasyon ve Sürekli Dağıtım süreçlerini güncelle; her bir domain için ayrı pipeline'lar oluştur ve testlerin başarılı olduğundan emin ol.

— Agent: GameBY Agent • 2025-08-16T13:03:13.015Z

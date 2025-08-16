# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

### Alt Adım 1: Mevcut Yapının Analizi
Mevcut apps/api/src yapısını analiz et ve hangi dosya ve klasörlerin hangi domainlere ait olduğunu belirle.

### Alt Adım 2: Domain Klasörlerinin Oluşturulması
Yeni domainler için gerekli klasörleri oluştur: `economy`, `fraud`, `chat`. Her bir klasör içinde başlangıç dosyalarını ayarla.

### Alt Adım 3: Dosya Taşımaları
Mevcut dosyaları analiz ederek, uygun domain klasörlerine taşı. Her dosyanın doğru yere taşındığından emin ol.

### Alt Adım 4: Bağımlılıkların Güncellenmesi
Taşınan dosyaların bağımlılıklarını güncelle. İlgili modüller ve bileşenler arasında doğru referansların olduğundan emin ol.

### Alt Adım 5: Testlerin Güncellenmesi
Yeni yapı üzerinde test dosyalarını güncelle ve her domain için testlerin geçerli olduğundan emin olmak için testleri çalıştır.

— Agent: GameBY Agent • 2025-08-16T11:56:01.117Z

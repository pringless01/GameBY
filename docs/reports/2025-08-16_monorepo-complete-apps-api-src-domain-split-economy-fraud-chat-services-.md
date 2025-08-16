# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Analyze Current Structure**: Mevcut apps/api/src yapısını inceleyerek her bir alanın (economy, fraud, chat services) bağımlılıklarını ve etkileşimlerini belirle.

2. **Create Domain Directories**: Yeni domain dizinlerini oluştur. Her bir domain için ayrı bir klasör yapısı kurarak economy, fraud ve chat services için gerekli dosyaları yerleştir.

3. **Refactor Code**: Mevcut kodu her bir domain dizinine uygun olarak yeniden yapılandır. Fonksiyonları ve sınıfları uygun domain klasörlerine taşı.

4. **Update Configuration**: Yapılandırma dosyalarını güncelle. Her bir domain için gerekli ayarları ve bağımlılıkları yeni dizin yapısına göre düzenle.

5. **Run Tests and Validate**: Kodun yeni yapısının doğru çalıştığını doğrulamak için testleri çalıştır. Tüm testlerin başarılı olduğunu kontrol et.

— Agent: GameBY Agent • 2025-08-16T12:56:21.205Z

# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Tanımlaması ve Analizi**: Mevcut uygulama yapısını inceleyerek, ekonomi, dolandırıcılık ve sohbet hizmetleri için gereken alanları tanımla. Her bir domainin gereksinimlerini ve fonksiyonlarını belirle.

2. **Dosya ve Klasör Yapısı Oluşturma**: Her domain için yeni dosya ve klasör yapısını oluştur. `apps/api/src` altında `economy`, `fraud`, ve `chat` adında alt klasörler oluştur.

3. **Kod Ayrıştırma**: Mevcut kod tabanındaki ilgili fonksiyonları ve bileşenleri analiz ederek, her domain için uygun olanları ilgili klasörlere taşı.

4. **Bağımlılıkların Güncellenmesi**: Taşınan kodlarda kullanılmakta olan bağımlılıkları güncelleyerek, her domainin bağımsız çalışabilmesi için gerekli bağımlılıkları kontrol et ve düzenle.

5. **Testlerin Güncellenmesi ve Bakımı**: Her domain için yeni yapılandırmaya uygun test senaryolarını güncelle veya oluştur. Testlerin geçerliliğini kontrol et ve her domainin doğru çalıştığından emin ol.

— Agent: GameBY Agent • 2025-08-16T12:16:07.550Z

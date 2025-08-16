# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Split Planı Oluşturma**: Mevcut uygulamaların yapılandırmalarını analiz ederek, ekonomi, dolandırıcılık ve sohbet hizmetleri için domain split planı oluşturulacak.

2. **Klasör Yapılandırmasını Güncelleme**: apps/api/src dizininde mevcut klasör yapısını güncelleyerek, her bir domain için ayrı klasörler oluşturulacak (economy, fraud, chat).

3. **Kod Ayrıştırma**: Mevcut kod tabanını analiz ederek ilgili domainlere ait kod parçaları ayrıştırılacak ve yeni oluşturulan klasörlere taşınacak.

4. **Bağımlılık ve Konfigürasyon Güncellemeleri**: Domainlere özgü bağımlılıkları ve konfigürasyon ayarlarını güncelleyerek her bir domainin bağımsız çalışmasını sağlamak için gerekli değişiklikler yapılacak.

5. **Test Süreçlerinin Güncellenmesi**: Yeni yapılandırmaya uygun olarak test senaryoları güncellenecek ve her bir domain için test süreçleri oluşturulacak ve doğrulanacak.

— Agent: GameBY Agent • 2025-08-16T12:28:11.988Z

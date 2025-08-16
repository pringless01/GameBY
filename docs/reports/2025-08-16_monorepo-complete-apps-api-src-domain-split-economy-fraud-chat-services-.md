# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Split Planlama**: Uygulamanın mevcut yapısını inceleyerek, economy, fraud ve chat servisleri için ayrı domain yapıları oluşturulacak. Her bir domainin sorumlulukları ve etkileşimleri belirlenecek.

2. **Kod Tabanını Analiz Etme**: Mevcut kod tabanındaki API'lerin ve servislerin hangi domainlere ait olduğunu belirlemek için detaylı bir analiz yapılacak. Bu aşamada gereksiz bağımlılıklar ve kod tekrarları da tespit edilecek.

3. **Yeni Domain Yapılarının Oluşturulması**: Economy, fraud ve chat domainleri için gerekli klasör yapılarını oluşturulacak. Her domain için ilgili dosyalar ve kaynaklar taşınacak veya yeniden yapılandırılacak.

4. **Bağımlılıkların Düzenlenmesi**: Domainler arası bağımlılıkları minimize etmek için gerekli revizyonlar yapılacak. API çağrıları ve servis etkileşimleri yeniden yapılandırılacak.

5. **Test ve Doğrulama**: Yeni oluşturulan domainlerin doğru çalıştığından emin olmak için testler yazılacak ve mevcut testler güncellenecek. Tüm sistemin entegrasyon testleri gerçekleştirilecek. 

Bu adımların her biri, uygulamanın domain bazında daha modüler ve yönetilebilir hale gelmesini sağlayacak.

— Agent: GameBY Agent • 2025-08-16T12:03:26.202Z

# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısının Belirlenmesi**: Uygulamanın ekonomi, dolandırıcılık ve sohbet hizmetleri alanlarına göre domain yapısını belirle.

2. **Kod Tabanının Analizi**: Mevcut kod tabanını inceleyerek hangi bileşenlerin hangi domainlere ait olduğunu analiz et.

3. **Domainlere Göre Dosya ve Klasörlerin Ayrılması**: Kod dosyalarını ve klasörlerini ilgili domainlere göre yeniden yapılandır.

4. **Bağımlılıkların Güncellenmesi**: Ayrılan domainler için gerekli olan bağımlılıkları güncelle ve her bir domainin bağımlılıklarını kontrol et.

5. **Testlerin Güncellenmesi ve Çalıştırılması**: Yeni yapılandırmaya göre testleri güncelle ve tüm testlerin başarılı bir şekilde çalıştığını doğrula.

— Agent: GameBY Agent • 2025-08-16T14:15:05.082Z


## Fail checkpoint (attempt 1)
- time: 2025-08-16T14:15:09.444Z
- reason: Command failed: npm run lint

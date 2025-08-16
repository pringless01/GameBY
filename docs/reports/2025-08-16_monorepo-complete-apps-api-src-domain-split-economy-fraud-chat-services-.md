# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısını Belirleme**: apps/api/src dizininde mevcut yapıyı inceleyerek, ekonomi, dolandırıcılık ve sohbet hizmetlerinin hangi dosya ve klasörleri kapsadığını belirle.

2. **Klasör Yapısını Oluşturma**: Belirlenen domainlere göre yeni klasör yapısını oluştur. apps/api/src dizininde "economy", "fraud", ve "chat" klasörlerini oluştur.

3. **Dosyaları Taşıma**: Mevcut kod dosyalarını ilgili domain klasörlerine taşı. Ekonomi ile ilgili dosyalar "economy" klasörüne, dolandırıcılık ile ilgili olanlar "fraud" klasörüne ve sohbet ile ilgili olanlar "chat" klasörüne yerleştirilecek.

4. **Bağlantıları Güncelleme**: Taşınan dosyalar arasındaki bağlantıları ve import ifadelerini güncelleyerek, yeni klasör yapısına göre uyumlu hale getir.

5. **Test ve Doğrulama**: Tüm değişikliklerin ardından uygulamanın işlevselliğini test et ve gerekli testlerin geçtiğinden emin ol. 

Bu adımlar tamamlandığında, monorepo içerisindeki domain ayrımı başarıyla gerçekleştirilmiş olacaktır.

— Agent: GameBY Agent • 2025-08-16T14:21:01.811Z

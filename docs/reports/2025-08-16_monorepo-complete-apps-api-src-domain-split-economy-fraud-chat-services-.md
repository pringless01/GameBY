# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Split Planlama**: Mevcut apps/api/src yapısını analiz et ve domain'leri (economy, fraud, chat) belirle. Bu aşamada, hangi dosyaların hangi domain'e ait olduğunu tanımla.

2. **Kod Tablosu Hazırlığı**: Her domain için ilgili kod tablosunu oluştur. Bu, her domain'in hangi dosya ve bağımlılıkları içereceğini gösterecek.

3. **Dosya Taşıma**: Belirlenen dosyaları uygun domain klasörlerine taşı. Bu aşamada, kodun derlenebilirliğini sağlamak için gerekli güncellemeleri yap.

4. **Bağımlılık Yönetimi**: Domain'ler arası bağımlılıkları kontrol et ve gerekli olanları güncelle. Bu, her domain'in bağımsız çalışabilmesi için önemli.

5. **Test ve Doğrulama**: Her domain için test senaryolarını oluştur ve testleri çalıştır. Tüm işlemlerin başarılı olduğunu doğrula. 

Bu adımlar tamamlandığında, monorepo domain split işlemi gerçekleştirilmiş olacak.

— Agent: GameBY Agent • 2025-08-16T12:39:28.669Z

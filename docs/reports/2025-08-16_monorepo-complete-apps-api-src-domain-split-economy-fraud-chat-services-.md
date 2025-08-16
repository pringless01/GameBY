# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi ve Planlama**: Mevcut monorepo yapısını inceleyerek, ekonomi, dolandırıcılık ve sohbet hizmetleri için ayrı alanlar oluşturma planı geliştirilir. 

2. **Kod Yapısının Ayırılması**: Uygulama kodları, ilgili domainlere göre (economy, fraud, chat) fiziksel olarak ayrılacak şekilde yeniden yapılandırılır.

3. **Yapılandırma Dosyalarının Güncellenmesi**: Her bir domain için gerekli yapılandırma dosyaları (örn. package.json, tsconfig.json) oluşturulacak ve güncellenecek.

4. **Bağımlılıkların Yönetimi**: Her domain için gerekli bağımlılıklar belirlenecek ve yönetilecektir, böylece her domain kendi bağımsız yapısına sahip olacaktır.

5. **Testlerin Güncellenmesi ve Doğrulama**: Tüm domainler için test senaryoları güncellenecek ve her bir domainin işlevselliği doğrulanacaktır.

— Agent: GameBY Agent • 2025-08-16T14:10:45.697Z

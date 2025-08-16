# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısını Tasarlama**: Uygulama için ekonomi, dolandırıcılık ve sohbet hizmetlerini kapsayan bir domain yapısı belirle. Her domain için gerekli bileşenleri ve bağımlılıkları tanımla.

2. **Kodu Bölme Planı Oluşturma**: Mevcut kod tabanını analiz et ve her bir domain için bağımsız modüller veya dizinler oluşturacak şekilde bir bölme planı hazırla.

3. **Kod Tabanını Bölme**: Belirlenen plan doğrultusunda mevcut kodu ekonomi, dolandırıcılık ve sohbet hizmetleri olarak üç ayrı bölüme ayır. Her bölümde ilgili dosyaları ve bileşenleri düzenle.

4. **Bağımlılıkların Yönetimi**: Yeni domainlerdeki bağımlılıkları gözden geçir ve gerekli olanları her bir domain için izole et. Her domainin kendi bağımlılıklarını getirmesi için ayarlamalar yap.

5. **Test ve Doğrulama**: Her bir domainin işlevselliğini doğrulamak için test senaryoları oluştur ve çalıştır. Tüm domainlerin düzgün çalıştığını ve beklenen sonuçları verdiğini kontrol et.

— Agent: GameBY Agent • 2025-08-16T13:58:44.908Z


## Fail checkpoint (attempt 2)
- time: 2025-08-16T13:59:13.930Z
- reason: Command failed: npm test

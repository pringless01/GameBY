# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi**: Ekonomi, dolandırıcılık ve sohbet hizmetleri için mevcut yapının analizi yapılacak. Her domainin ihtiyaçları ve bağımlılıkları belirlenecek.

2. **Klasör Yapısı Tasarımı**: Yeni domain yapısına uygun klasör yapısı tasarlanacak. apps/api/src altında ekonomi, dolandırıcılık ve sohbet için ayrı dizinler oluşturulacak.

3. **Kod Taşıma**: Mevcut kodlar, ilgili domain dizinlerine taşınacak. Her domain için gerekli olan modüller ve bileşenler ayrılacak.

4. **Bağımlılık Yönetimi**: Taşınan kodların bağımlılıkları kontrol edilecek. Gereksiz bağımlılıklar kaldırılacak ve her domainin kendi bağımlılıkları netleştirilecek.

5. **Test Entegrasyonu**: Yeni yapı ile birlikte her domain için test senaryoları oluşturulacak ve mevcut testlerin entegrasyonu sağlanacak. Testlerin başarılı bir şekilde çalıştığı doğrulanacak.

— Agent: GameBY Agent • 2025-08-16T13:45:44.066Z


## Fail checkpoint (attempt 2)
- time: 2025-08-16T13:46:12.969Z
- reason: Command failed: npm test

# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Split Planlama**: Mevcut yapı ve modüllerin analizi yapılacak. Ekonomi, dolandırıcılık ve sohbet hizmetleri için gerekli bileşenler belirlenecek.

2. **Klasör Yapısının Oluşturulması**: Yeni domain yapısına uygun olarak klasörler (economy, fraud, chat) oluşturulacak. Her bir domain için gerekli başlangıç dosyaları hazırlanacak.

3. **Kod Taşıma İşlemi**: Mevcut kodların ilgili domain klasörlerine taşınması sağlanacak. Her bir domain için spesifik modüller ve bileşenler, yeni yapıya uygun şekilde düzenlenecek.

4. **Bağımlılıkların Yönetimi**: Her bir domain için gerekli bağımlılıklar belirlenecek ve uygun şekilde yönetilecek. Paket yöneticisi ile bağımlılıkların güncellenmesi sağlanacak.

5. **Test ve Doğrulama**: Yeni yapı üzerinde testler gerçekleştirilecek. Her domain için ilgili test senaryoları oluşturulacak ve başarıyla geçmeleri sağlanacak. 

Bu adımların ardından domain bölünmesi tamamlanmış olacak.

— Agent: GameBY Agent • 2025-08-16T12:42:17.648Z


## Fail checkpoint (attempt 3)
- time: 2025-08-16T12:42:46.593Z
- reason: Command failed: npm test

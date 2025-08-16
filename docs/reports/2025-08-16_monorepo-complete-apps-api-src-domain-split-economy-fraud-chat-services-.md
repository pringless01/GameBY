# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısının İncelenmesi**  
   apps/api/src içindeki mevcut domain yapısını incele. Hangi dosyaların hangi domainlere ait olduğunu belirle.

2. **Yeni Domain Klasörlerinin Oluşturulması**  
   economy, fraud ve chat hizmetleri için yeni klasör yapısını oluştur. Uygun dizin yapısını ayarlayarak, bu klasörlerde gerekli başlangıç dosyalarını oluştur.

3. **Kodun Taşınması**  
   Var olan kodları uygun şekilde yeni domain klasörlerine taşı. Her domain için ilgili dosyaları ve alt dosyaları doğru şekilde yerleştir.

4. **Bağlantıların Güncellenmesi**  
   Taşınan kodların referanslarını güncelle. Kod içindeki import ifadelerini ve diğer bağlantıları yeni klasör yapısına uygun hale getir.

5. **Testlerin Güncellenmesi ve Çalıştırılması**  
   Yeni yapıya uygun olarak test dosyalarını güncelle ve tüm testlerin geçerli olduğunu doğrulamak için testleri çalıştır.

— Agent: GameBY Agent • 2025-08-16T12:44:29.175Z

# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Klasör Yapısının Oluşturulması**  
   `apps/api/src` altında `economy`, `fraud` ve `chat` klasörlerinin oluşturulması. Böylece her alan için ayrı bir yapı oluşturulmuş olacak.

2. **Modül Dosyalarının Taşınması**  
   Mevcut kodun ilgili alanlara göre (economy, fraud, chat) taşınması. Her modülün dosyaları uygun klasörlere yerleştirilecek.

3. **Bağımlılıkların Güncellenmesi**  
   Her yeni modül için gerekli bağımlılıkların `package.json` dosyalarına eklenmesi. Böylece her hizmet bağımsız çalışabilir hale getirilecek.

4. **Yapılandırma Dosyalarının Ayrıştırılması**  
   Ortak yapılandırmaların ve ayarların her bir modül için ayrı dosyalara ayrılması. Bu, modüllerin bağımsızlığını artıracaktır.

5. **Testlerin Güncellenmesi**  
   Modüllerin taşınmasından sonra uygun testlerin güncellenmesi ve her bir modül için testlerin çalıştığının doğrulanması. Testlerin başarılı bir şekilde geçmesi sağlanacak.

— Agent: GameBY Agent • 2025-08-16T13:55:57.847Z


## Fail checkpoint (attempt 1)
- time: 2025-08-16T13:56:27.321Z
- reason: Command failed: npm test

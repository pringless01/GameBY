# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Tanımlama ve Analiz**: Economy, Fraud ve Chat hizmetleri için mevcut kod tabanını inceleyerek her bir domainin gereksinimlerini ve bağımlılıklarını belirle.

2. **Klasör Yapısı Oluşturma**: Yeni domainler için `apps/api/src/economy`, `apps/api/src/fraud` ve `apps/api/src/chat` klasörlerini oluştur.

3. **Kod Taşıma**: Mevcut kodu ilgili domain klasörlerine taşıyarak her domain için ayrı bir yapı oluştur. 

4. **Bağımlılık Yönetimi**: Her bir domain için gerekli bağımlılıkları güncelleyerek, bağımlılıkların doğru bir şekilde yönetildiğinden emin ol.

5. **Test Entegrasyonu**: Her domain için test senaryolarını güncelleyerek yeni yapıya uygun hale getir ve testlerin başarıyla geçtiğini doğrula.

— Agent: GameBY Agent • 2025-08-16T14:00:17.437Z


## Fail checkpoint (attempt 1)
- time: 2025-08-16T14:00:46.476Z
- reason: Command failed: npm test

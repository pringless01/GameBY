# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi**: Mevcut `apps/api/src` yapısını inceleyerek, `economy`, `fraud`, ve `chat` alanlarının ihtiyaçlarını ve bağımlılıklarını belirle.

2. **Klasör Yapısı Oluşturma**: Yeni domainler için uygun klasör yapısını oluştur. `apps/api/src/economy`, `apps/api/src/fraud`, ve `apps/api/src/chat` dizinlerini oluştur.

3. **Kod Taşıma**: Mevcut kodu ilgili domain klasörlerine taşı. Her bir domainin özelliklerine göre dosyaları uygun şekilde yerleştir.

4. **Bağımlılık Yönetimi**: Taşınan kodların bağımlılıklarını güncelle ve her domainin kendi bağımlılıklarını yönetebilmesi için gerekli değişiklikleri yap.

5. **Test ve Doğrulama**: Yeni domain yapısının düzgün çalıştığını doğrulamak için testleri güncelle ve çalıştığını test et. Başarılı sonuçlar alındığında, yeni yapı üzerinde onayla.

— Agent: GameBY Agent • 2025-08-16T13:17:13.003Z


## Fail checkpoint (attempt 2)
- time: 2025-08-16T13:17:43.160Z
- reason: Command failed: npm test

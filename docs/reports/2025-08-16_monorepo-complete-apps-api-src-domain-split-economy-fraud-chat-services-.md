# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapılandırması**: Uygulama dizinlerinde `economy`, `fraud` ve `chat` servislerine yönelik klasör yapılarının oluşturulması ve mevcut kaynakların uygun dizinlere taşınması.

2. **Bağımlılık Yönetimi**: Her bir domain için gerekli bağımlılıkların belirlenmesi ve güncellenmesi. `package.json` dosyalarının güncellenmesi.

3. **API Tanımlamaları**: Her domain için API sözleşmelerinin (OpenAPI/Swagger) oluşturulması ve dokümantasyonun güncellenmesi.

4. **Unit Testlerin Güncellenmesi**: Taşınan ve yeni oluşturulan kaynaklar için unit testlerin yazılması ve mevcut testlerin güncellenmesi.

5. **CI/CD Pipeline Güncellemesi**: Yeni domain yapısına uygun şekilde CI/CD süreçlerinin gözden geçirilmesi ve güncellenmesi. 

Her alt adım tamamlandığında gerekli değişiklikler yapılacak ve rapor oluşturulacaktır.

— Agent: GameBY Agent • 2025-08-16T14:11:31.972Z


## Fail checkpoint (attempt 1)
- time: 2025-08-16T14:12:01.060Z
- reason: Command failed: npm test

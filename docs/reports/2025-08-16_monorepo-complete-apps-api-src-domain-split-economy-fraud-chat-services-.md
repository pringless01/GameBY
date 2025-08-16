# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi ve Tanımlama**: Uygulama içindeki mevcut domain'lerin (economy, fraud, chat services) analizini yaparak her birinin sorumluluklarını ve işlevlerini netleştir.

2. **Klasör Yapısının Oluşturulması**: Yeni domain'ler için uygun klasör yapısını oluştur. `apps/api/src/economy`, `apps/api/src/fraud`, `apps/api/src/chat` dizinlerini oluştur.

3. **Kodun Taşınması**: Her domain'e ait mevcut kodları (model, service, controller vb.) ilgili dizinlere taşımak için gerekli değişiklikleri yap.

4. **Bağımlılıkların Güncellenmesi**: Taşınan kodların bağımlılıklarını gözden geçirerek, her bir yeni domain için gerekli olan bağımlılıkların güncellenmesini sağla.

5. **Testlerin Güncellenmesi ve Doğrulama**: Her domain için taşınan kodların testlerini güncelleyerek, tüm testlerin geçerli olduğundan emin ol ve gerekli testleri yeniden çalıştır.

— Agent: GameBY Agent • 2025-08-16T14:02:35.450Z


## Fail checkpoint (attempt 1)
- time: 2025-08-16T14:03:05.146Z
- reason: Command failed: npm test

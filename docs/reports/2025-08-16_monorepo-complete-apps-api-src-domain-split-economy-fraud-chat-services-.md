# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısının Belirlenmesi**: Mevcut apps/api/src yapısını analiz ederek, her bir domain (economy, fraud, chat) için gerekli dosya ve klasör yapısını belirle.

2. **Dosyaların Taşınması**: Belirlenen domain yapısına göre, mevcut dosyaları uygun domain klasörlerine taşı.

3. **Bağımlılıkların Güncellenmesi**: Taşınan dosyaların bağımlılıklarını güncelleyerek, her domainin kendi bağımlılık yönetimini sağlamasını sağla.

4. **Testlerin Güncellenmesi**: Taşınan dosyalar için mevcut test senaryolarını güncelleyerek, her domainin test kapsamını koru.

5. **Dokümantasyonun Güncellenmesi**: Domain split işlemi ile ilgili olarak dokümantasyonu güncelleyip, değişikliklerin ve yeni yapının açıklamalarını ekle.

— Agent: GameBY Agent • 2025-08-16T14:38:01.251Z


## Fail checkpoint (attempt 3)
- time: 2025-08-16T14:38:32.804Z
- reason: Command failed: npm test

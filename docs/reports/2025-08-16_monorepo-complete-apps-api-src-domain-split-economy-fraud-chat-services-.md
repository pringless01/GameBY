# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Tanımlaması**: `apps/api/src` dizinindeki mevcut domain yapısını analiz et ve `economy`, `fraud`, `chat` domainlerini belirle.

2. **Dizin Yapısının Oluşturulması**: Yeni domainler için gerekli dizin yapısını oluştur. `economy`, `fraud` ve `chat` için ayrı klasörler oluştur.

3. **Kodun Taşınması**: Mevcut kodları ilgili yeni domain dizinlerine taşımak için gerekli dosya ve modül taşımalarını gerçekleştir.

4. **Yapılandırma ve Bağımlılık Yönetimi**: Yeni domainler için yapılandırma dosyalarını güncelle ve gerekli bağımlılıkları yönet.

5. **Testlerin Güncellenmesi**: Taşınan kodlar için test dosyalarını güncelle ve her domain için testlerin başarıyla geçmesini sağla.

— Agent: GameBY Agent • 2025-08-16T12:40:56.659Z


## Fail checkpoint (attempt 1)
- time: 2025-08-16T12:41:25.819Z
- reason: Command failed: npm test

# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Tanımlama**: Mevcut uygulamaların her birinin (economy, fraud, chat) işlevlerini ve sorumluluklarını net bir şekilde tanımlayın. Bu, doğru bölme için temel sağlar.

2. **Kod Tabanı İncelemesi**: apps/api/src içinde mevcut kod yapısını gözden geçirin. Hangi dosyaların hangi domainlere ait olduğunu belirleyin ve gereksiz bağımlılıkları not alın.

3. **Dosya ve Klasör Yapısı Oluşturma**: Her domain için yeni klasör yapısını oluşturun. Örneğin, `apps/api/src/economy`, `apps/api/src/fraud`, ve `apps/api/src/chat` dizinlerini oluşturun.

4. **Kod Taşınması**: Belirlenen domain'lere ait kodları yeni dizinlere taşıyın. Her domain için uygun olan dosyaları dikkatlice yerleştirin ve eski dizinlerde gereksiz dosyaları kaldırın.

5. **Bağımlılıkların Güncellenmesi**: Taşınan kodda bağımlılıkları güncelleyin. Her domain için gerekli olan bağımlılıkların doğru şekilde tanımlandığından emin olun ve testleri çalıştırarak her şeyin düzgün çalıştığını kontrol edin.

— Agent: GameBY Agent • 2025-08-16T12:47:27.415Z

# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Analyze Current Structure**: Mevcut uygulama yapısını incele. Mevcut domain'leri (economy, fraud, chat) tanımla ve her birinin bağımlılıklarını belirle.

2. **Create New Directories**: Her bir domain için yeni dizinler oluştur. `apps/api/src/economy`, `apps/api/src/fraud`, ve `apps/api/src/chat` dizinlerini oluştur.

3. **Move Code**: İlgili kod dosyalarını mevcut yapısından yeni oluşturulan dizinlere taşı. Her domain için ilgili dosyaları doğru dizine aktar.

4. **Update Imports and Exports**: Taşınan dosyalar için import ve export yollarını güncelle. Yeni dizin yapısına uygun hale getir.

5. **Run Tests**: Taşımadan sonra tüm uygulama testlerini çalıştır. Herhangi bir hata olmadığından emin ol ve gerekli düzeltmeleri yap.

— Agent: GameBY Agent • 2025-08-16T13:41:56.201Z


## Fail checkpoint (attempt 3)
- time: 2025-08-16T13:42:25.153Z
- reason: Command failed: npm test

# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi**: Mevcut uygulama yapısını ve domainleri incele, ekonomi, dolandırıcılık ve sohbet hizmetleri için gerekli bileşenleri belirle.

2. **Klasör Yapısı Oluşturma**: Yeni domain yapılarını yansıtacak şekilde, `apps/api/src` altında `economy`, `fraud` ve `chat` adında klasörler oluştur.

3. **Kod Taşıma**: Mevcut kodları ilgili domain klasörlerine taşıyarak, her bir domainin kendi bağımsız yapısını oluştur.

4. **Bağımlılık Yönetimi**: Domainler arasında gerekli bağımlılıkları gözden geçir ve her bir domainin bağımsız çalışabilmesi için gereken güncellemeleri yap.

5. **Test ve Doğrulama**: Taşınan kodların düzgün çalıştığını ve her domainin beklenen şekilde işlediğini doğrulamak için testleri güncelle ve çalıştır.

— Agent: GameBY Agent • 2025-08-16T14:16:12.431Z


## Fail checkpoint (attempt 2)
- time: 2025-08-16T14:16:16.924Z
- reason: Command failed: npm run lint

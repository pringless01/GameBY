# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Analiz ve Planlama:** Uygulama kodunun mevcut yapısını incele ve ekonomi, dolandırıcılık ve sohbet hizmetleri için ayrı domain yapısını belirle.

2. **Klasör Yapısını Oluştur:** Yeni domain yapısına uygun olarak `apps/api/src` altında `economy`, `fraud`, ve `chat` adında yeni klasörler oluştur.

3. **Kod Taşıma:** Mevcut `apps/api/src` kodunu uygun domain klasörlerine taşı ve gerekli bağımlılıkları güncelle.

4. **Yapılandırma Güncellemeleri:** Her domain için gerekli yapılandırma dosyalarını güncelle ve yeni domain yapısına uygun hale getir.

5. **Test ve Doğrulama:** Taşınan kodun düzgün çalıştığını doğrulamak için testleri çalıştır ve her domain için gerekli test senaryolarını oluştur.

— Agent: GameBY Agent • 2025-08-16T13:33:33.160Z


## Fail checkpoint (attempt 3)
- time: 2025-08-16T13:34:02.048Z
- reason: Command failed: npm test

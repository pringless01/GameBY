# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi ve Planlama**: Uygulamanın mevcut yapısını analiz et ve ekonomi, dolandırıcılık ve sohbet hizmetleri için ayrı domain yapıları oluşturma planı hazırla.

2. **Kod Yapısının Hazırlanması**: Yeni domainler için gerekli klasör ve dosya yapısını oluştur. `apps/api/src` altında `economy`, `fraud`, ve `chat` dizinlerini oluştur.

3. **Service'lerin Ayrılması**: Mevcut kodu, ilgili domainlere göre ayırarak her bir domain için gerekli olan service’leri oluştur.

4. **Bağımlılıkların Yönetimi**: Her yeni domain için bağımlılıkları düzenle ve güncelle. Gerekli kütüphaneleri her domain için ekle.

5. **Testlerin Güncellenmesi**: Her domain için oluşturulan yeni yapı ve fonksiyonlar üzerinde testleri güncelle ve gerekli testleri yaz. Testlerin geçerli olduğundan emin ol. 

Her adımda gerekli dosyalar ve commit işlemleri yapılacak.

— Agent: GameBY Agent • 2025-08-16T14:08:32.866Z


## Fail checkpoint (attempt 3)
- time: 2025-08-16T14:09:01.869Z
- reason: Command failed: npm test

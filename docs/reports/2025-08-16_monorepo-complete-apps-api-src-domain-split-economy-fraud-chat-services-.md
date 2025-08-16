# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısı Analizi**: Mevcut apps/api/src dizin yapısını incele ve domain'leri (economy, fraud, chat) belirle.

2. **Yeni Dizin Oluşturma**: Her bir domain için ayrı dizinler oluştur; economy, fraud ve chat için gerekli klasör yapısını kur.

3. **Kodun Taşınması**: Mevcut kodları uygun domain dizinlerine taşımak için gerekli dosya ve kod yapılandırmalarını yap.

4. **Bağımlılıkların Güncellenmesi**: Taşınan kodların bağımlılıklarını güncelle; her domain için bağımlılıkları belirle ve uygun şekilde yapılandır.

5. **Testlerin Güncellenmesi**: Her domain için gerekli testleri oluştur ve mevcut testlerin geçerliliğini kontrol et, tüm testlerin PASS olduğundan emin ol.

— Agent: GameBY Agent • 2025-08-16T13:24:04.867Z


## Fail checkpoint (attempt 2)
- time: 2025-08-16T13:24:34.169Z
- reason: Command failed: npm test

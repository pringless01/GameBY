# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısının Analizi**: Mevcut apps/api/src yapısını incele ve her bir domain (economy, fraud, chat) için gerekli dosya ve klasörleri belirle.

2. **Yeni Domain Klasörlerinin Oluşturulması**: economy, fraud ve chat için ayrı klasörler oluştur. Her klasör içinde ilgili yapı ve dosyalar için başlangıç noktaları ayarla.

3. **Kodun Taşınması**: Mevcut kodu belirlenen domain klasörlerine taşı. Her domain için ilgili dosyaların doğru konumda olduğundan emin ol.

4. **Bağımlılıkların Güncellenmesi**: Taşınan kodların bağımlılıklarını kontrol et ve gerekirse güncelle. Her domain için gerekli olan bağımlılıkları belirle ve ekle.

5. **Testlerin Güncellenmesi**: Yapılan değişikliklere uygun testleri güncelle ve her domain için testlerin geçerliliğini sağla. Testlerin başarıyla geçip geçmediğini kontrol et.

— Agent: GameBY Agent • 2025-08-16T14:04:00.484Z


## Fail checkpoint (attempt 3)
- time: 2025-08-16T14:04:29.435Z
- reason: Command failed: npm test

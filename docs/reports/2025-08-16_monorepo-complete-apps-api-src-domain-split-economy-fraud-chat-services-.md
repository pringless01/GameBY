# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapılandırması**: Mevcut uygulama yapısını incele ve domain'leri (economy, fraud, chat) belirle. Her bir domain için gerekli olan dosya ve klasör yapılarını oluştur.

2. **Kod Ayrıştırma**: apps/api/src içindeki mevcut kodu analiz et ve her domain'e ait parçaları (servisler, model, controller vb.) ayır. Her domain için ayrı dosyalara taşı.

3. **Bağımlılık Yönetimi**: Domain'ler arasındaki bağımlılıkları gözden geçir ve her bir domain için gerekli bağımlılıkları güncelle. Geçiş sonrası uyumsuzlukları çözüme kavuştur.

4. **Test Güncellemesi**: Her domain için ayrıştırılan kod parçalarının testlerini güncelle ve yeni test senaryoları ekle. Testlerin geçerliliğini sağlamak için tüm testleri çalıştır.

5. **Dokümantasyon ve Dağıtım**: Yapılan değişiklikleri belgelendir ve her domain için güncellenmiş dokümantasyonu oluştur. Yeni yapı ile ilgili dağıtım adımlarını planla ve uygulamaya geçir.

— Agent: GameBY Agent • 2025-08-16T13:13:30.444Z


## Fail checkpoint (attempt 3)
- time: 2025-08-16T13:13:59.542Z
- reason: Command failed: npm test

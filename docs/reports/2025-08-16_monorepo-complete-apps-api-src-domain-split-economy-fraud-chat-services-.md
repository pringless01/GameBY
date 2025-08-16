# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi**: Mevcut `apps/api/src` yapısını incele. Her bir alanın (economy, fraud, chat) gereksinimlerini ve bağımlılıklarını belirle.

2. **Klasör Yapısını Oluştur**: Yeni domain yapısına uygun olarak `economy`, `fraud` ve `chat` klasörlerini oluştur. Her bir klasör içerisinde gerekli dosya yapısını kur.

3. **Kod Taşınması**: Mevcut kodları, belirlenen domain yapısına göre uygun klasörlere taşı. Her bir alanın kendi bağımsız modülüne sahip olduğundan emin ol.

4. **Bağımlılıkların Güncellenmesi**: Taşınan kodların bağımlılıklarını güncelle. Her bir domain için gerekli olan bağımlılıkları kontrol et ve güncellemeleri yap.

5. **Testlerin Güncellenmesi**: Taşınan kodlar için mevcut testleri uyarlayıp güncelle. Her bir domain için testlerin başarılı bir şekilde çalıştığından emin ol.

— Agent: GameBY Agent • 2025-08-16T13:32:14.000Z

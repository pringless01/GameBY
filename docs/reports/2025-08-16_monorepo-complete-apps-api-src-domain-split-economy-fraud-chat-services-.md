# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi ve Planlama**: Mevcut apps/api/src yapısını analiz et ve her bir domain (economy, fraud, chat) için gerekli bileşenleri ve bağımlılıkları belirle.

2. **Klasör Yapısını Oluşturma**: apps/api/src altında economy, fraud ve chat klasörlerini oluştur ve her birine ilgili dosyaları taşı.

3. **Kod Refaktörü**: Taşınan dosyalar içinde gerekli kod değişikliklerini yaparak, her domainin bağımsız çalışmasını sağla.

4. **Bağımlılık Yönetimi**: Her domain için bağımlılıkları güncelle ve gerekli paketleri yükle.

5. **Test ve Doğrulama**: Her domain için testleri çalıştırarak, tüm fonksiyonların doğru çalıştığından emin ol ve sonuçları dökümante et.

— Agent: GameBY Agent • 2025-08-16T14:38:50.665Z


## Fail checkpoint (attempt 1)
- time: 2025-08-16T14:39:03.576Z
- reason: Command failed: npm test

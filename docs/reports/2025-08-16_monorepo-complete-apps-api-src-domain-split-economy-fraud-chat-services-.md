# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

Alt Adım 1: "Domain Yapısının Analizi"
- Uygulamanın mevcut domain yapısını analiz et ve hangi dosya ve bileşenlerin hangi domain'e ait olduğunu belirle.

Alt Adım 2: "Domain Klasörlerinin Oluşturulması"
- Yeni domain'ler için gerekli klasör yapısını oluştur. (economy, fraud, chat)

Alt Adım 3: "Kodun Taşınması"
- Mevcut kodu ilgili domain klasörlerine taşı. Her bir domain için gerekli dosyaları uygun şekilde yerleştir.

Alt Adım 4: "Bağımlılıkların Güncellenmesi"
- Taşınan dosyaların bağımlılıklarını güncelle ve her bir domain'in doğru çalıştığından emin ol.

Alt Adım 5: "Testlerin Güncellenmesi ve Çalıştırılması"
- Domain'lere özgü testleri güncelle ve tüm testlerin başarılı bir şekilde geçtiğinden emin ol.

— Agent: GameBY Agent • 2025-08-16T14:01:47.866Z


## Fail checkpoint (attempt 3)
- time: 2025-08-16T14:02:16.699Z
- reason: Command failed: npm test

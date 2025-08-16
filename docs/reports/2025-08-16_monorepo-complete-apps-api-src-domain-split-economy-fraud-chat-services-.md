# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Proje Analizi ve Planlama**: Mevcut apps/api/src yapısını incele, domain'lerin nasıl ayrılacağını belirle ve her bir domain için gerekli dosya ve dizin yapısını planla.

2. **Domain Yapılandırması**: economy, fraud ve chat domain'leri için ayrı dizinler oluştur ve ilgili dosyaları bu dizinlere taşı.

3. **Bağımlılık Güncellemeleri**: Yeni domain yapısına göre bağımlılıkları güncelle. Her domain’in ihtiyaç duyduğu kütüphaneleri ve araçları belirle.

4. **Test Güncellemeleri**: Taşınan dosyalar ve yeni domain yapısına göre mevcut testleri güncelle. Her domain için ayrı test dosyaları oluştur.

5. **Dokümantasyon ve Son Kontroller**: Yeni yapı ile ilgili dokümantasyonu güncelle ve tamamlanan domain'ler için son kontrolleri yaparak her şeyin düzgün çalıştığından emin ol.

— Agent: GameBY Agent • 2025-08-16T12:59:59.001Z


## Fail checkpoint (attempt 3)
- time: 2025-08-16T13:00:28.361Z
- reason: Command failed: npm test

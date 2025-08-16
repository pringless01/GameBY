# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısının Analizi:** Mevcut apps/api/src dizinindeki domain yapılarını analiz et. Her bir domain (economy, fraud, chat) için bağımlılıkları ve ilişkileri belirle.

2. **Yeni Dizin Yapısının Oluşturulması:** Economy, fraud ve chat servisleri için yeni dizin yapısını oluştur. Her bir domain için ayrı klasörler oluştur ve gerekli dosya şablonlarını ekle.

3. **Kod Tabanının Taşınması:** Mevcut apps/api/src dizinindeki kodları, belirlenen yeni dizin yapısına taşımaya başla. Her domain için ilgili kodları uygun klasörlere yerleştir.

4. **Bağımlılıkların Güncellenmesi:** Taşınan kodların bağımlılıklarını güncelle. Yeni dizin yapısına bağlı olarak import ve require ifadelerini düzenle.

5. **Testlerin Güncellenmesi ve Çalıştırılması:** Taşınma işlemi sonrası tüm birim testlerini güncelle ve çalıştır. Her domain için testlerin başarılı olduğundan emin ol.

— Agent: GameBY Agent • 2025-08-16T14:55:10.793Z

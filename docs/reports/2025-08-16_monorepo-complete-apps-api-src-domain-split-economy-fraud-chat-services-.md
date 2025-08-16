# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Split Planlama**: Mevcut `apps/api/src` yapısını incele ve `economy`, `fraud`, ve `chat services` için ayrı domain yapıları oluşturacak bir plan hazırla. 

2. **Kod Tabanının Ayrıştırılması**: Mevcut kod tabanını inceleyerek `economy`, `fraud` ve `chat services` ile ilgili kodları belirle ve bu kodları ilgili domain dizinlerine taşı.

3. **Bağımlılıkların Yönetimi**: Her bir domain için bağımlılıkları güncelle, gerekirse yeni bağımlılıkları ekle ve mevcut olanları kaldırarak temizle.

4. **Testlerin Güncellenmesi**: Taşınan kodların testlerini gözden geçir ve her domain için uygun test senaryolarını yaz; geçerliliklerini sağlamak için testleri çalıştır.

5. **Dokümantasyon Güncellemesi**: Yeni domain yapısını ve değişiklikleri detaylandıran bir dokümantasyon hazırla ve mevcut dokümantasyonu güncelle.

— Agent: GameBY Agent • 2025-08-16T14:23:24.484Z

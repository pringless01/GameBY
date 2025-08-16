# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

**Alt Adım 1: Mevcut Yapının Analizi**
- Mevcut apps/api/src yapısını incele ve domain'lerin (economy, fraud, chat) ayrımını belirle.

**Alt Adım 2: Domain Yapısının Oluşturulması**
- Yeni dizin yapısını oluştur: apps/api/src/economy, apps/api/src/fraud, apps/api/src/chat.

**Alt Adım 3: Kodun Taşınması**
- İlgili kodları mevcut yapısından yeni oluşturulan domain dizinlerine taşı.

**Alt Adım 4: Bağımlılıkların Güncellenmesi**
- Taşınan kodların bağımlılıklarını kontrol et ve gerekli güncellemeleri yap.

**Alt Adım 5: Testlerin Güncellenmesi ve Çalıştırılması**
- Yeni domain yapısına uygun testleri güncelle ve tüm testlerin başarıyla geçtiğinden emin ol.

— Agent: GameBY Agent • 2025-08-16T13:06:08.728Z

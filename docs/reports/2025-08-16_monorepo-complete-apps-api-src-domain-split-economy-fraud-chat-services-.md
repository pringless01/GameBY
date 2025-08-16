# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi:** Mevcut `apps/api/src` dizinindeki kod yapısını ve bağımlılıkları incele. Hangi dosyaların ekonomi, dolandırıcılık ve sohbet hizmetlerine ait olduğunu belirle.

2. **Dizin Yapısı Oluşturma:** Yeni dizin yapısını oluştur. `apps/api/src/economy`, `apps/api/src/fraud` ve `apps/api/src/chat` dizinlerini oluştur ve uygun alt dizinleri ekle.

3. **Kod Taşıma:** Belirlenen dosyaları ve ilgili kod parçalarını uygun yeni dizinlere taşı. Her bir hizmet için gerekli olan dosyaları doğru şekilde yerleştir.

4. **Bağımlılıkları Güncelleme:** Taşınan dosyaların bağımlılıklarını güncelle. Yeni dizin yapısına uygun şekilde import ve export ifadelerini düzenle.

5. **Testleri Güncelleme ve Çalıştırma:** Her hizmet için gerekli testleri güncelleyip çalıştır. Tüm testlerin başarılı olduğundan emin ol ve varsa hataları düzelt.

— Agent: GameBY Agent • 2025-08-16T13:23:21.775Z

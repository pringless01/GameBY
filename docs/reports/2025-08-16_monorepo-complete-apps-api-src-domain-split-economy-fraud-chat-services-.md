# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analysis and Structure Planning**: Ekonomi, dolandırıcılık ve sohbet hizmetleri için mevcut uygulama yapısını analiz et. Her domain için gerekli bileşenleri ve bağımlılıkları belirle.

2. **Directory Creation**: Yeni domainler için gerekli dizin yapısını oluştur. `apps/api/src/economy`, `apps/api/src/fraud` ve `apps/api/src/chat` dizinlerini yarat.

3. **Code Migration**: Mevcut kodu uygun dizinlere taşı. Ekonomi ile ilgili kodları `economy`, dolandırıcılık ile ilgili kodları `fraud` ve sohbet ile ilgili kodları `chat` dizinine yerleştir.

4. **Update Imports and Dependencies**: Taşınan kodların içindeki importları ve bağımlılıkları güncelle. Yeni dizin yapısına uygun şekilde dosyaların birbirleriyle olan bağlantılarını kontrol et.

5. **Testing and Validation**: Her domain için testleri çalıştır ve geçerli sonuçlar al. Kodun düzgün çalıştığından emin olmak için gerekli testleri yap. 

Her alt adım tamamlandıktan sonra hafızaya ekleme yapacağım.

— Agent: GameBY Agent • 2025-08-16T13:45:00.466Z

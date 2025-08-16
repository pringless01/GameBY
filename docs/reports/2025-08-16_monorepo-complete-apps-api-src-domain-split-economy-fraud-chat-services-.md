# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi**: Mevcut `apps/api/src` dizinindeki kodları analiz ederek, ekonomi, dolandırıcılık ve sohbet hizmetlerinin sınırlarını belirle.

2. **Dizin Yapısı Oluşturma**: Yeni dizin yapısını oluştur; `apps/api/src/economy`, `apps/api/src/fraud`, ve `apps/api/src/chat` dizinlerini ekle.

3. **Kod Taşıma**: İlgili hizmetlere ait kodları mevcut dizinden yeni oluşturulan dizinlere taşı.

4. **Bağımlılık Güncellemesi**: Taşınan kodların bağımlılıklarını güncelleyerek her bir hizmetin kendi bağımsız çalışma yeteneğini sağla.

5. **Test ve Doğrulama**: Her bir hizmetin düzgün çalıştığını doğrulamak için testleri çalıştır ve sonuçları kontrol et.

— Agent: GameBY Agent • 2025-08-16T13:36:20.806Z

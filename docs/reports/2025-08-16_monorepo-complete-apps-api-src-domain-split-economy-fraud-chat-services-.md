# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

Aksiyon: "Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)" için alt adımlar:

1. **Analiz ve Planlama**: Mevcut kod yapısını inceleyerek domain'leri (ekonomi, dolandırıcılık, sohbet hizmetleri) belirle ve her bir domain için gereken kaynakları ve dosyaları planla.

2. **Klasör Yapısını Oluşturma**: `apps/api/src` altında `economy`, `fraud` ve `chat` adında yeni klasörler oluştur ve her bir domain için başlangıç dosyalarını yerleştir.

3. **Kod Ayrıştırma**: Mevcut kodu analiz et ve ilgili domain'lere ait olan kod parçalarını uygun klasörlere taşımaya başla. Her bir domain için ayrı modüller oluştur.

4. **Bağımlılıkların Düzenlenmesi**: Domain'ler arası bağımlılıkları kontrol et ve güncelle. Her domain'in bağımsız çalışabilmesi için gereken ayarlamaları yap.

5. **Test ve Doğrulama**: Her domain için oluşturulan yapıyı test et. Birim testleri yaz ve tüm testlerin geçip geçmediğini kontrol et. 

Bu adımlar tamamlandığında, monorepo yapısı belirtilen domain'lere göre bölünmüş olacak.

— Agent: GameBY Agent • 2025-08-16T12:08:19.727Z

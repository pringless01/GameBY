# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısını Analiz Et:** Monorepo içindeki mevcut API yapısını incele ve ekonomi, dolandırıcılık ve sohbet hizmetleri için gerekli olan domain yapı taşlarını belirle.

2. **Domain Klasörlerini Oluştur:** Her bir hizmet için ayrı klasörler oluştur. `economy`, `fraud`, ve `chat` klasörleri altında gerekli dosya yapısını oluştur.

3. **Kodları Taşı:** Mevcut kodları uygun domain klasörlerine taşı. Her bir hizmetin ilgili dosyalarını yeni oluşturulan klasörlere yerleştir.

4. **Bağımlılıkları Güncelle:** Taşınan kodların gerekli bağımlılıklarını gözden geçir ve güncelle. Her bir domain için gerekli olan kütüphaneleri ve bağımlılıkları kontrol et.

5. **Testleri Güncelle ve Çalıştır:** Her bir domain için test dosyalarını gözden geçir, güncelle ve tüm testlerin başarıyla geçip geçmediğini doğrula. 

Rapor hazırlanacak.

— Agent: GameBY Agent • 2025-08-16T12:55:31.376Z


## Fail checkpoint (attempt 3)
- time: 2025-08-16T12:56:00.910Z
- reason: Command failed: npm test

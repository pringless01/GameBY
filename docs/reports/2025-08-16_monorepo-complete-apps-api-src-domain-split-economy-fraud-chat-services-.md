# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Proje Yapısını Değerlendirme**: Mevcut `apps/api/src` dizin yapısını incele ve hangi dosya ve klasörlerin ekonomi, dolandırıcılık ve sohbet servislerine ait olduğunu belirle.

2. **Domain Split Tasarımı**: Ekonomi, dolandırıcılık ve sohbet hizmetleri için ayrı dizin yapıları oluştur. Her bir domain için gerekli olan dosya ve klasör isimlerini belirle.

3. **Kodu Taşıma**: Belirlenen dosya ve klasörleri uygun domain dizinlerine taşı. Her taşınma işleminden sonra dosya yollarını ve referanslarını güncelle.

4. **Test Güncellemesi**: Taşınan dosyalar için mevcut testleri gözden geçir ve gerekli değişiklikleri yaparak her domain için ayrı test dosyaları oluştur.

5. **Dokümantasyon Güncellemesi**: Yapılan değişiklikleri ve yeni dizin yapısını belgeleyerek proje dokümantasyonunu güncelle. Her domain için gereken bilgileri ekle.

— Agent: GameBY Agent • 2025-08-16T13:19:28.161Z


## Fail checkpoint (attempt 2)
- time: 2025-08-16T13:19:57.149Z
- reason: Command failed: npm test

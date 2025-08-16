# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısını Planla**: Mevcut `apps/api/src` dizin yapısını analiz et ve `economy`, `fraud`, ve `chat` servisleri için ayrı domain yapıları oluştur.

2. **Service Dosyalarını Taşı**: `apps/api/src` dizinindeki ilgili dosyaları `economy`, `fraud`, ve `chat` dizinlerine taşı ve uygun şekilde yeniden adlandır.

3. **Bağımlılıkları Güncelle**: Taşınan dosyaların bağımlılıklarını kontrol et ve gerekli güncellemeleri yaparak her servisin kendi bağımlılıklarını tanımla.

4. **Testleri Güncelle**: Her yeni domain için mevcut testleri güncelle ve yeni test senaryoları ekle, böylece her servisin düzgün çalıştığını doğrula.

5. **Dokümantasyonu Güncelle**: Yeni domain yapısını ve servislerin çalışma şekillerini açıklayan güncel bir dokümantasyon oluştur.

— Agent: GameBY Agent • 2025-08-16T14:23:42.865Z


## Fail checkpoint (attempt 2)
- time: 2025-08-16T14:23:47.113Z
- reason: Command failed: npm run lint

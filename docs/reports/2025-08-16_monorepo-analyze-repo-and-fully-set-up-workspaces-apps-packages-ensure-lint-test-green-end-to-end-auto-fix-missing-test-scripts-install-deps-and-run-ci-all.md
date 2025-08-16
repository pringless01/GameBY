# Next Action: Monorepo: Analyze repo and fully set up workspaces (apps/*, packages/*), ensure lint/test green end-to-end; auto-fix missing test scripts; install deps and run ci:all

1. **Repo Analizi**: Mevcut monorepo yapısını incele ve `apps/*` ve `packages/*` dizinlerindeki bileşenleri belirle. Gerekli yapılandırmaları ve bağımlılıkları belirle.

2. **Workspace Kurulumu**: `apps/*` ve `packages/*` dizinleri için gerekli workspace ayarlarını yapılandır. Her bir uygulama ve paket için bağımlılıkları kur.

3. **Lint ve Test Kontrolü**: Tüm projelerde kodun lint ve test durumunu kontrol et. Hataları belirle ve gerekli düzeltmeleri yaparak kodun yeşil durumda olmasını sağla.

4. **Eksik Test Script'lerinin Otomatik Düzeltmesi**: Projelerde eksik test script’lerini tespit et ve otomatik olarak bu script’leri oluştur veya var olanları güncelle.

5. **Bağımlılıkların Kurulumu ve CI Çalıştırılması**: Tüm bağımlılıkları kur ve `ci:all` komutunu çalıştırarak sürekli entegrasyon sürecini başlat. Sonuçları gözlemle ve raporla.

— Agent: GameBY Agent • 2025-08-16T22:08:34.897Z

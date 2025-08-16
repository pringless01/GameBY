# Next Action: Monorepo: Analyze repo and fully set up workspaces (apps/*, packages/*), ensure lint/test green end-to-end; auto-fix missing test scripts; install deps and run ci:all

Alt Adım 1: "Repo Analizi"
- Mevcut monorepo yapısını analiz et. `apps/*` ve `packages/*` dizinlerini kontrol et, gerekli bağımlılıkları ve yapılandırmaları belirle.

Alt Adım 2: "Workspace Kurulumu"
- `apps/*` ve `packages/*` dizinlerinde gerekli workspace ayarlarını yapılandır. Her bir uygulama ve paket için bağımlılıkları ve konfigürasyonları ekle.

Alt Adım 3: "Lint ve Test Kontrolü"
- Tüm dizinlerde lint kontrollerini çalıştır ve testlerin yeşil olduğundan emin ol. Herhangi bir lint hatasını düzelt.

Alt Adım 4: "Eksik Test Senaryolarını Otomatik Düzelt"
- Her bir uygulama ve paket için eksik test senaryolarını tespit et, otomatik olarak düzelt ve test dosyalarını oluştur.

Alt Adım 5: "Bağımlılıkları Yükle ve CI'yi Çalıştır"
- Tüm bağımlılıkları yükle ve `ci:all` komutunu çalıştırarak sürekli entegrasyonu başlat. Tüm süreçlerin başarılı bir şekilde tamamlandığını doğrula.

— Agent: GameBY Agent • 2025-08-16T22:32:26.342Z

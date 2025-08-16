# Next Action: Monorepo: Analyze repo and fully set up workspaces (apps/*, packages/*), ensure lint/test green end-to-end; auto-fix missing test scripts; install deps and run ci:all

### Alt Adım 1: Repo Analizi
- Monorepo yapısı incelenecek ve `apps/*` ile `packages/*` dizinleri belirlenecek.
- Uygulama ve paketlerin güncel durumu değerlendirilecek.

### Alt Adım 2: Workspace Ayarları
- Gerekli workspace konfigürasyon dosyaları (örneğin, `package.json`, `tsconfig.json`) oluşturulacak veya güncellenecek.
- `apps/*` ve `packages/*` için uygun bağımlılıklar tanımlanacak.

### Alt Adım 3: Lint Kontrolü
- Tüm kod tabanı için linting yapılacak.
- Belirlenen hatalar düzeltilecek ve kod standardına uygun hale getirilecek.

### Alt Adım 4: Test Script'lerinin Otomatik Düzeltmesi
- Eksik test script'leri belirlenecek ve otomatik olarak eklenecek.
- Test yapılarının düzgün çalıştığından emin olunacak.

### Alt Adım 5: Bağımlılıkların Kurulumu ve CI Çalıştırma
- Gerekli bağımlılıklar kurulacak.
- `ci:all` komutu çalıştırılarak tüm testler ve işlemler kontrol edilecek.

— Agent: GameBY Agent • 2025-08-16T22:59:21.354Z

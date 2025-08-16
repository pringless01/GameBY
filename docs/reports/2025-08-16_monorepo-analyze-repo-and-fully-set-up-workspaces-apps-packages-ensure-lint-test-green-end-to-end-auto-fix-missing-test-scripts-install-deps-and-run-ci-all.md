# Next Action: Monorepo: Analyze repo and fully set up workspaces (apps/*, packages/*), ensure lint/test green end-to-end; auto-fix missing test scripts; install deps and run ci:all

### Alt Adım 1: Repo Analizi
Repo yapısını analiz et ve mevcut `apps/*` ve `packages/*` dizinlerini kontrol et. Gerekli dosya ve dizinlerin varlığını doğrula.

### Alt Adım 2: Workspace'lerin Kurulumu
`apps/*` ve `packages/*` dizinlerindeki workspace'leri oluştur. Her bir workspace için uygun yapılandırmaları ayarla.

### Alt Adım 3: Lint Kontrolü
Tüm kod tabanında lint kontrollerini çalıştır. Hataları belirle ve düzeltmek için gerekli değişiklikleri yap.

### Alt Adım 4: Test Senaryolarının Kontrolü
Mevcut test senaryolarını kontrol et ve eksik olan test script'lerini otomatik olarak düzelt. Gerekirse yeni test senaryoları ekle.

### Alt Adım 5: Bağımlılıkların Yüklenmesi ve CI Çalıştırma
Projede ihtiyaç duyulan bağımlılıkları yükle. Ardından, `ci:all` komutunu çalıştırarak tüm testlerin ve lint kontrollerinin geçmesini sağla.

— Agent: GameBY Agent • 2025-08-16T23:07:53.935Z


## Fail checkpoint (attempt 3)
- time: 2025-08-16T23:07:57.893Z
- reason: Command failed: npm run lint

# Next Action: Monorepo: Analyze repo and fully set up workspaces (apps/*, packages/*), ensure lint/test green end-to-end; auto-fix missing test scripts; install deps and run ci:all

**Alt Adım 1: Repo Analizi ve Workspace Yapılandırması**
- Tüm `apps/*` ve `packages/*` dizinlerini analiz et.
- Gerekli yapılandırmaları yaparak workspace'leri oluştur.

**Alt Adım 2: Lint Kontrolü**
- Kodun lint kurallarına uygunluğunu kontrol et.
- Gerekirse lint hatalarını düzelt.

**Alt Adım 3: Testlerin Çalıştırılması**
- Mevcut testleri çalıştırarak durumlarını kontrol et.
- Testlerin yeşil (geçerli) olduğundan emin ol.

**Alt Adım 4: Eksik Test Scriptlerinin Otomatik Düzeltmesi**
- Eksik test scriptlerini tespit et.
- Gerekli scriptleri otomatik olarak ekle veya düzelt.

**Alt Adım 5: Bağımlılıkların Kurulması ve CI Sürecinin Çalıştırılması**
- Tüm bağımlılıkları yükle.
- CI sürecini `ci:all` komutuyla çalıştır.

— Agent: GameBY Agent • 2025-08-16T23:41:35.280Z

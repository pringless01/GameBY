# Next Action: Monorepo: Analyze repo and fully set up workspaces (apps/*, packages/*), ensure lint/test green end-to-end; auto-fix missing test scripts; install deps and run ci:all

1. **Repo Analizi ve Workspace Kurulumu**: Monorepo'yu analiz et ve `apps/*` ile `packages/*` dizinlerini yapılandır. Gerekli dosya ve dizin yapılarını oluştur.

2. **Lint ve Test Kontrolü**: Tüm kodu gözden geçir ve lint hatalarını düzelt. Testlerin çalıştığından emin ol ve testlerin yeşil olduğuna dair onay al.

3. **Eksik Test Scriptlerinin Otomatik Düzeltmesi**: Projelerde eksik olan test scriptlerini tespit et ve otomatik olarak düzelt. Her bir uygulama ve paket için gerekli test scriptlerini ekle.

4. **Bağımlılıkların Kurulumu**: Tüm projelerin bağımlılıklarını güncelle ve kur. `npm install` veya benzeri bir komut kullanarak gerekli kütüphaneleri yükle.

5. **CI Sürecinin Çalıştırılması**: CI sürecini başlat. `ci:all` komutunu çalıştırarak tüm testlerin ve lint kontrollerinin başarılı bir şekilde geçip geçmediğini kontrol et.

— Agent: GameBY Agent • 2025-08-16T22:42:16.019Z

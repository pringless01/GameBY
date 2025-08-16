# Next Action: Monorepo: Analyze repo and fully set up workspaces (apps/*, packages/*), ensure lint/test green end-to-end; auto-fix missing test scripts; install deps and run ci:all

1. **Repo Analizi**: Mevcut monorepo yapısını analiz ederek `apps/*` ve `packages/*` dizinlerinin içeriğini gözden geçir. Tüm uygulama ve paketlerin doğru yapılandırıldığından emin ol.

2. **Workspace Ayarları**: `apps/*` ve `packages/*` dizinleri için gerekli workspace ayarlarını yap. Bu, tüm projelerin doğru bir şekilde çalışması için gerekli bağımlılıkları ve yapılandırmaları içermelidir.

3. **Lint ve Test Kontrolü**: Projede linting kurallarını uygula ve tüm testlerin geçerli olduğundan emin ol. Herhangi bir lint hatası veya test başarısızlığı durumunda düzeltmeler yap.

4. **Eksik Test Script'lerini Düzelt**: Projede eksik olan test script'lerini otomatik olarak tespit et ve gerekli düzeltmeleri yaparak eksiklikleri gider.

5. **Bağımlılıkların Kurulumu ve CI Çalıştırma**: Tüm bağımlılıkları kur ve `ci:all` komutunu çalıştırarak sürekli entegrasyonu test et. Bu adım, projenin tüm bileşenlerinin sorunsuz bir şekilde çalıştığını doğrulamak için kritik öneme sahiptir. 

Her adım sonunda dosya değişiklikleri, commit ve rapor güncellemeleri yapılacaktır.

— Agent: GameBY Agent • 2025-08-16T23:38:18.215Z

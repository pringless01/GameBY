# Next Action: Monorepo: Analyze repo and fully set up workspaces (apps/*, packages/*), ensure lint/test green end-to-end; auto-fix missing test scripts; install deps and run ci:all

1. **Repo Analizi**: Monorepo yapısını inceleyecek ve `apps/*` ve `packages/*` dizinlerinin mevcut durumunu değerlendirecek. Gerekli yapılandırmaları belirleyecek.

2. **Workspace Kurulumu**: `apps/*` ve `packages/*` için gerekli workspace yapılandırmalarını oluşturacak ve her birinin bağımlılıklarını kontrol edecek.

3. **Lint ve Test Kontrolü**: Tüm kod tabanında lint ve testlerin geçerliliğini kontrol edecek. Gerekirse lint hatalarını düzeltecek ve testlerin başarılı olduğundan emin olacak.

4. **Eksik Test Scriptlerini Düzeltme**: Test scriptlerinin eksik olduğu yerleri otomatik olarak tespit edip, eksik olanları ekleyecek.

5. **Bağımlılıkları Yükleme ve CI Çalıştırma**: Tüm bağımlılıkları yükleyecek ve `ci:all` komutunu çalıştırarak sürekli entegrasyon süreçlerini başlatacak.

— Agent: GameBY Agent • 2025-08-16T22:39:47.232Z

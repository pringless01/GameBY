# Next Action: Monorepo: Analyze repo and fully set up workspaces (apps/*, packages/*), ensure lint/test green end-to-end; auto-fix missing test scripts; install deps and run ci:all

1. **Repo Analizi**: Monorepo içindeki `apps/*` ve `packages/*` dizinlerini analiz et. Uygulamaların ve paketlerin yapılandırmalarını incele ve ihtiyaç duyulan bağımlılıkları belirle.

2. **Workspace Kurulumu**: `apps/*` ve `packages/*` dizinlerinde gerekli workspace yapılandırmalarını oluştur. Gerekli dosyaları ve ayarları ekle.

3. **Lint ve Test Kontrolü**: Tüm projelerde lint kontrollerini ve testleri çalıştır. Hataları belirle ve düzeltme gereksinimlerini not al.

4. **Eksik Test Script'lerini Düzeltme**: Elde edilen hata ve eksikliklere dayanarak eksik test script'lerini otomatik olarak ekle. Her projenin `package.json` dosyasını güncelle.

5. **Bağımlılıkların Kurulumu ve CI Çalıştırma**: Gerekli bağımlılıkları kur ve `ci:all` komutunu çalıştırarak tüm testlerin ve yapıların başarılı bir şekilde geçmesini sağla.

— Agent: GameBY Agent • 2025-08-16T22:30:22.227Z

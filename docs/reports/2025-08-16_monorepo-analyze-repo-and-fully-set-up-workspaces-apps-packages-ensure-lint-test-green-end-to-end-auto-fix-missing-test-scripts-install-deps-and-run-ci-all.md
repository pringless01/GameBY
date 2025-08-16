# Next Action: Monorepo: Analyze repo and fully set up workspaces (apps/*, packages/*), ensure lint/test green end-to-end; auto-fix missing test scripts; install deps and run ci:all

1. **Repo Analizi ve Workspace Kurulumu**: Monorepo'daki mevcut dosya yapısını analiz ederek `apps/*` ve `packages/*` dizinlerini oluştur ve yapılandır. 

2. **Lint ve Test Kontrolü**: Tüm kod parçalarını lint'le ve testleri çalıştırarak yeşil (geçerli) olduğundan emin ol. 

3. **Eksik Test Script'lerinin Otomatik Düzeltmesi**: Projelerde eksik olan test script'lerini otomatik olarak ekle ve düzelt. 

4. **Bağımlılıkların Kurulumu**: Tüm bağımlılıkları yükle ve güncelledikten sonra, `ci:all` komutunu çalıştır. 

5. **Sonuçların Raporlanması**: Yapılan değişiklikler ve sonuçlar hakkında bir rapor oluştur ve kaydet. 

— Agent: GameBY Agent • 2025-08-16T22:37:47.321Z


## Fail checkpoint (attempt 1)
- time: 2025-08-16T22:37:51.502Z
- reason: Command failed: npm run lint

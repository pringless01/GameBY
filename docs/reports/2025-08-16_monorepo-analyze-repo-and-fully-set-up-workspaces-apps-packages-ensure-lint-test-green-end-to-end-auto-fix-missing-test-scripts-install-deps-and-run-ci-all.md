# Next Action: Monorepo: Analyze repo and fully set up workspaces (apps/*, packages/*), ensure lint/test green end-to-end; auto-fix missing test scripts; install deps and run ci:all

1. **Repo Analizi**: Monorepo'daki dizin yapısını inceleyerek mevcut `apps/*` ve `packages/*` dizinlerini belirle.

2. **Workspace Kurulumu**: Belirlenen dizinlerde gerekli workspace yapılandırmalarını yaparak, `package.json` dosyalarını güncelle.

3. **Lint ve Test Kontrolü**: Tüm projelerde linting ve test süreçlerinin düzgün çalıştığından emin olmak için mevcut kuralları kontrol et.

4. **Eksik Test Scriptlerini Düzeltme**: Her projede eksik olan test scriptlerini otomatik olarak ekleyerek bunları güncelle.

5. **Bağımlılıkları Yükleyip CI Sürecini Çalıştırma**: Tüm bağımlılıkları yükleyip, CI sürecini (`ci:all`) çalıştırarak entegrasyonu sağla.

— Agent: GameBY Agent • 2025-08-16T22:56:44.733Z

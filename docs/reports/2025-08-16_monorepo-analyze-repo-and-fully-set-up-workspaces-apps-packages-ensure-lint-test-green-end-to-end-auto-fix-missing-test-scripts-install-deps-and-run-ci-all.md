# Next Action: Monorepo: Analyze repo and fully set up workspaces (apps/*, packages/*), ensure lint/test green end-to-end; auto-fix missing test scripts; install deps and run ci:all

1. **Workspace Analizi**: Monorepo içerisindeki `apps/*` ve `packages/*` dizinlerini analiz et. Her bir uygulama ve paket için gerekli yapılandırmaları ve bağımlılıkları belirle.

2. **Lint ve Test Kontrolü**: Tüm workspace'lerde lint ve test süreçlerini çalıştırarak, her birinin başarılı bir şekilde geçmesini sağla. Hatalı kodları düzelt.

3. **Eksik Test Scriptlerini Otomatik Düzeltme**: Her bir paket ve uygulama için eksik olan test scriptlerini otomatik olarak oluştur ve mevcut olanları güncelle.

4. **Bağımlılıkları Yükleme**: Gerekli bağımlılıkları belirle ve tüm projelerde `npm install` veya `yarn install` komutunu çalıştırarak yükle.

5. **CI Sürecini Çalıştırma**: Tüm workspace'lerde `ci:all` komutunu çalıştırarak sürekli entegrasyon süreçlerini başlat ve tüm testlerin geçmesini sağla.

— Agent: GameBY Agent • 2025-08-16T22:46:20.567Z

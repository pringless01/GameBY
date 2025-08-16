# Next Action: Monorepo: Analyze repo and fully set up workspaces (apps/*, packages/*), ensure lint/test green end-to-end; auto-fix missing test scripts; install deps and run ci:all

1. **Repo Analizi ve Workspace Ayarı**: Monorepo içindeki `apps/*` ve `packages/*` dizinlerini analiz ederek gerekli workspace yapılandırmalarını oluştur. Çıktı: Workspace yapılandırma dosyaları güncellenecek.

2. **Lint ve Test Kontrolü**: Tüm projelerde lint ve testlerin doğru çalıştığını kontrol et. Çıktı: Lint ve test sonuç raporu oluşturulacak.

3. **Eksik Test Scriptlerini Düzeltme**: Eksik olan test scriptlerini otomatik olarak ekleyerek projelerin test kapsamını artır. Çıktı: Test scriptleri eklenecek ve güncellenecek.

4. **Bağımlılıkların Kurulması**: Projelerde gereken tüm bağımlılıkları yükle. Çıktı: `npm install` veya `yarn install` komutları ile bağımlılıklar kurulacak.

5. **CI Sürecini Çalıştırma**: Tüm projelerde CI sürecini çalıştırarak kod kalitesini ve entegrasyonu kontrol et. Çıktı: CI sonuç raporu oluşturulacak.

— Agent: GameBY Agent • 2025-08-16T22:30:55.364Z

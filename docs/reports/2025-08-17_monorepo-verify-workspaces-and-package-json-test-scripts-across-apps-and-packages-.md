# Next Action: Monorepo: verify workspaces and package.json test scripts across apps/* and packages/*

1. **Workspaces Kontrolü**: Monorepo'daki tüm uygulama ve paket dizinlerindeki `package.json` dosyalarını kontrol ederek, mevcut workspace yapılandırmalarını doğrulama.

2. **Test Scriptlerinin İncelenmesi**: `apps/*` ve `packages/*` dizinlerindeki `package.json` dosyalarındaki test scriptlerini inceleyerek, her birinin geçerliliğini ve uyumluluğunu kontrol etme.

3. **Bağımlılıkların Doğrulanması**: Test scriptlerinin çalışabilmesi için gerekli olan bağımlılıkların doğru bir şekilde yüklendiğini ve tanımlandığını kontrol etme.

4. **Testlerin Çalıştırılması**: Her bir uygulama ve paket için `npm test` veya eşdeğer komutları çalıştırarak, testlerin başarılı bir şekilde geçtiğini doğrulama.

5. **Raporlama**: Yapılan kontroller ve test sonuçlarını içeren bir rapor hazırlayarak, sonuçları belgede toplama. 

Şimdi bu adımları sırayla işleyeceğim. İlk adım olan "Workspaces Kontrolü" ile başlayalım.

— Agent: GameBY Agent • 2025-08-17T00:13:28.357Z

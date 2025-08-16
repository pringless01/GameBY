# Next Action: Monorepo: verify workspaces and package.json test scripts across apps/* and packages/*

1. **Workspace Kontrolü**: Tüm `apps/*` ve `packages/*` dizinlerindeki `package.json` dosyalarını kontrol et ve mevcut workspace yapılandırmalarını not al.

2. **Test Scriptleri İncelemesi**: Her `package.json` dosyasındaki `test` scriptlerini incele ve bunların geçerliliğini değerlendirmek için örnek bir test çalıştır.

3. **Hataları Belirleme**: Test scriptleri çalışmadığı takdirde, hataları tespit et ve hangi `package.json` dosyalarında sorunlar olduğunu kaydet.

4. **Düzeltme Önerileri**: Belirlenen hatalar için düzeltme önerileri oluştur ve her bir `package.json` dosyası için önerilen değişiklikleri not al.

5. **Raporlama**: Yapılan inceleme ve düzeltme önerilerini içeren bir rapor hazırla ve bunu `docs/reports/YYYY-MM-DD_verify_workspaces.md` şeklinde kaydet.

— Agent: GameBY Agent • 2025-08-16T23:57:06.362Z

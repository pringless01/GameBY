# Next Action: Monorepo: verify workspaces and package.json test scripts across apps/* and packages/*

1. **Workspace Kontrolü**: Monorepo içindeki tüm `apps/*` ve `packages/*` dizinlerinde bulunan `package.json` dosyalarını gözden geçirerek her birinin doğru workspace ayarlarına sahip olduğunu doğrula.

2. **Test Scriptleri İncelemesi**: Her bir `package.json` dosyasında bulunan `test` scriptlerini kontrol et. Scriptlerin beklenen formatta olup olmadığını ve gerekli bağımlılıkların tanımlı olduğunu doğrula.

3. **Çalıştırma ve Geri Bildirim**: Her `test` scriptini çalıştırarak, tüm uygulama ve paketlerin testlerinin başarılı bir şekilde geçip geçmediğini kontrol et. Hatalı olanları not al.

4. **Düzenleme ve Düzeltme**: Eğer herhangi bir `test` scriptinde hata veya eksiklik varsa, gerekli düzeltmeleri yap. Gerekirse `package.json` dosyalarını güncelle.

5. **Raporlama**: Yapılan tüm kontroller, düzeltmeler ve test sonuçlarını içeren bir rapor oluştur. Raporu `docs/reports/YYYY-MM-DD_verify_workspaces_tests.md` şeklinde kaydet. 

İşlemlere geçiyorum.

— Agent: GameBY Agent • 2025-08-16T23:55:32.066Z

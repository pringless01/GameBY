# Next Action: Monorepo: verify workspaces and package.json test scripts across apps/* and packages/*

1. **Workspace Kontrolü**: Tüm `apps/*` ve `packages/*` dizinlerindeki `package.json` dosyalarını kontrol et. Her bir `package.json` dosyasının `workspaces` alanını doğrula.

2. **Test Scriptlerini İnceleme**: Her `package.json` dosyasındaki `scripts` bölümünden `test` scriptlerini al ve bunları listele.

3. **Test Scriptlerini Çalıştırma**: Belirlenen `test` scriptlerini sırayla çalıştır ve sonuçları kaydet. Başarılı olanları ve başarısız olanları not al.

4. **Hata Analizi**: Herhangi bir testin başarısız olması durumunda, ilgili `package.json` dosyalarını ve hata mesajlarını incele. Gerekli düzeltmeleri yap.

5. **Raporlama**: Gerçekleştirilen tüm işlemleri ve elde edilen sonuçları özetleyerek `docs/reports/YYYY-MM-DD_verify_workspaces_tests.md` dosyasına kaydet. 

Bu adımlar tamamlandığında, sürecin tüm aşamalarını belgeleyip hafızaya ekleyeceğim.

— Agent: GameBY Agent • 2025-08-17T00:21:24.144Z

# Next Action: Monorepo: verify workspaces and package.json test scripts across apps/* and packages/*

1. **Workspace Kontrolü**: `apps/*` ve `packages/*` dizinlerindeki workspace'leri kontrol et. Her bir dizinin doğru bir şekilde tanımlandığından emin ol.

2. **package.json Dosyası İncelemesi**: Her bir `package.json` dosyasını açarak test scriptlerinin varlığını ve içeriğini kontrol et. Özellikle `test` anahtarının doğru bir şekilde ayarlandığını doğrula.

3. **Test Scriptlerinin Çalıştırılması**: Her `package.json` dosyasında tanımlanan test scriptlerini çalıştır. Tüm testlerin başarıyla geçip geçmediğini kontrol et.

4. **Hata Raporlama**: Herhangi bir testin başarısız olması durumunda, ilgili dizin ve hata mesajlarıyla birlikte bir rapor oluştur.

5. **Sonuçların Belgelendirilmesi**: Yapılan kontroller ve test sonuçlarını içeren bir rapor oluştur. Bu raporu docs/reports/ dizinine kaydet.

— Agent: GameBY Agent • 2025-08-16T23:54:45.676Z

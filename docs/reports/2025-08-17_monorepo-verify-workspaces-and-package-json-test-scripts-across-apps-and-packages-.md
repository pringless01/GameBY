# Next Action: Monorepo: verify workspaces and package.json test scripts across apps/* and packages/*

1. **Workspace Kontrolü**: Monorepo içindeki tüm `apps/*` ve `packages/*` dizinlerinde bulunan `package.json` dosyalarını listele. Her bir dizinin doğru bir workspace olarak tanımlandığını doğrula.

2. **Test Scriptlerinin Kontrolü**: Her `package.json` dosyasında bulunan `test` scriptini incele. Scriptin geçerli olup olmadığını ve beklenen test komutlarını içerip içermediğini kontrol et.

3. **Dependencies Kontrolü**: Her `package.json` dosyasındaki bağımlılıkları (dependencies ve devDependencies) kontrol et. Geçerli ve güncel bağımlılıkların listelendiğinden emin ol.

4. **Çalışma Zamanı Testi**: Her bir `test` scriptini çalıştırarak testlerin başarıyla geçip geçmediğini kontrol et. Hataları ve başarısız testleri kaydet.

5. **Raporlama**: Yapılan kontrollerin ve test sonuçlarının bir raporunu oluştur. Bu rapor, her uygulama ve paket için sonuçları özetlemeli ve herhangi bir hata veya uyarıyı içermelidir. 

Her alt adım için gerekli dosya değişiklikleri ve rapor güncellemelerini gerçekleştireceğim.

— Agent: GameBY Agent • 2025-08-17T00:09:11.631Z

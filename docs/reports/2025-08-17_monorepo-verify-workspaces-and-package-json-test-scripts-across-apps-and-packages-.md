# Next Action: Monorepo: verify workspaces and package.json test scripts across apps/* and packages/*

1. **Workspace Kontrolü:** Tüm `apps/*` ve `packages/*` dizinlerindeki workspace ayarlarını kontrol et. Her bir dizinde `package.json` dosyasının varlığını ve doğru yapılandırıldığını doğrula.

2. **Test Scriptlerinin İncelemesi:** Her `package.json` dosyasındaki test scriptlerini incele. `test` scriptinin varlığını ve doğru bir şekilde tanımlandığını kontrol et.

3. **Testlerin Çalıştırılması:** `apps/*` ve `packages/*` dizinlerindeki test scriptlerini sırayla çalıştır. Her bir testin başarıyla geçtiğinden emin ol.

4. **Hata Ayıklama:** Eğer testlerden biri başarısız olursa, ilgili `package.json`'da veya test scriptinde hata olup olmadığını kontrol et ve gerekli düzeltmeleri yap.

5. **Raporlama:** Yapılan kontroller, test sonuçları ve varsa hata düzeltmeleri hakkında detaylı bir rapor hazırla ve uygun bir dosyaya kaydet. 

Bu adımlar başarıyla tamamlandığında, bir sonraki aşamaya geçebilirsin.

— Agent: GameBY Agent • 2025-08-17T00:22:11.145Z

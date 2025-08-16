# Next Action: Monorepo: verify workspaces and package.json test scripts across apps/* and packages/*

1. **Workspace Kontrolü:** Monorepo'daki tüm alt dizinlerdeki `package.json` dosyalarını gözden geçirerek, her bir workspace için doğru yapılandırmanın yapıldığından emin olunacak.

2. **Test Scriptlerinin Listelemesi:** `apps/*` ve `packages/*` altında bulunan `package.json` dosyalarındaki test scriptlerinin listesi çıkarılacak.

3. **Test Scriptlerinin Geçerliliği:** Her bir test scriptinin mevcut olup olmadığını ve doğru şekilde tanımlandığını kontrol etmek için `npm run` komutu kullanılacak.

4. **Hata Tespiti:** Eğer herhangi bir test scripti eksik ya da hatalı ise, bu durumlar raporlanacak ve gerekli düzeltmeler için önerilerde bulunulacak.

5. **Dokümantasyon Güncellemesi:** Yapılan kontroller ve tespit edilen sorunlar ile bunlara ilişkin çözümleri içeren bir rapor hazırlanacak ve dokümantasyon güncellenerek hafızaya eklenecek.

— Agent: GameBY Agent • 2025-08-16T23:52:26.517Z

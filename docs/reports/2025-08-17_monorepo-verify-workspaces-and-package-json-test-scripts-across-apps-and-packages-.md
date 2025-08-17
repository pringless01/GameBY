# Next Action: Monorepo: verify workspaces and package.json test scripts across apps/* and packages/*

1. **Workspace Yapılandırmalarını Gözden Geçir**: Monorepo içerisindeki tüm `apps/*` ve `packages/*` dizinlerindeki `package.json` dosyalarını kontrol ederek, workspace ayarlarının doğru yapılandırıldığını doğrula.

2. **Test Scriptlerini İncele**: Her bir `package.json` dosyasındaki test scriptlerini gözden geçir. `test`, `test:unit`, `test:integration` gibi scriptlerin mevcut ve doğru tanımlandığını kontrol et.

3. **Test Scriptlerini Çalıştır**: Doğrulanan test scriptlerini sırayla çalıştır. Her bir scriptin başarılı bir şekilde tamamlandığından emin ol.

4. **Hata Mesajlarını Kaydet**: Eğer herhangi bir test scripti başarısız olursa, hata mesajlarını kaydet ve hangi dosyada sorun yaşandığını belirt.

5. **Rapor Hazırla**: Yapılan kontroller ve test sonuçları ile ilgili bir rapor oluştur. Rapor, hangi testlerin başarılı, hangilerinin başarısız olduğunu içermelidir.

Her adımda gerçek değişiklik yapılacak ve sonuçlar kaydedilecektir.

— Agent: GameBY Agent • 2025-08-17T00:04:08.980Z

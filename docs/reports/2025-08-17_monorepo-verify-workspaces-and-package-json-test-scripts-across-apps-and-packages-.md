# Next Action: Monorepo: verify workspaces and package.json test scripts across apps/* and packages/*

1. **Workspaces Kontrolü**: Tüm `apps/*` ve `packages/*` dizinlerindeki `package.json` dosyalarını kontrol ederek, monorepo yapılandırmasındaki `workspaces` ayarlarının doğru olduğundan emin olunacak.

2. **Test Scriptleri İncelemesi**: Her bir `package.json` dosyasında bulunan `test` scriptlerinin varlığı ve doğru yapılandırılması kontrol edilecek.

3. **Script Çalıştırma**: `test` scriptlerini her bir uygulama ve paket için çalıştırarak, beklenen sonuçların alınıp alınmadığı test edilecek.

4. **Hata Kayıtları**: Eğer herhangi bir test scripti hatalı çalışıyorsa, bu hatalar kaydedilecek ve ilgili dosyalar üzerinde düzeltme yapılacak.

5. **Raporlama**: Yapılan tüm kontroller ve test sonuçları, bir rapor dosyasına yazılacak ve hafızaya eklenecek. 

Her bir alt adımda gerekli değişiklikler, dosya güncellemeleri ve raporlar oluşturulacak.

— Agent: GameBY Agent • 2025-08-17T00:16:36.679Z

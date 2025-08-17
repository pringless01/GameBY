# Next Action: Monorepo: verify workspaces and package.json test scripts across apps/* and packages/*

1. **Workspace Kontrolü**: `apps/*` ve `packages/*` altındaki tüm workspace'leri kontrol ederek doğru yapılandırıldıklarından emin olunacak.

2. **package.json Dosyası İncelemesi**: Her bir `package.json` dosyasını açarak test scriptlerinin mevcut olup olmadığını ve doğru tanımlandığını doğrulama işlemi gerçekleştirilecek.

3. **Test Scriptlerinin Çalıştırılması**: Her bir uygulama ve paket için tanımlanan test scriptlerinin çalıştırılması ve sonuçlarının gözlemlenmesi sağlanacak.

4. **Hata Ayıklama**: Test scriptlerinden herhangi birinde hata çıkması durumunda detaylı hata ayıklama yapılacak ve gerekli düzeltmeler gerçekleştirilecek.

5. **Raporlama**: Testlerin sonuçları, elde edilen bulgular ve yapılan düzeltmelerle ilgili bir rapor hazırlanarak `docs/reports/` dizinine kaydedilecek. 

Her adımda gerekli değişiklikler yapılacak, lint kontrolü sağlanacak ve testlerin başarılı olduğu onaylanacak.

— Agent: GameBY Agent • 2025-08-17T00:07:27.432Z

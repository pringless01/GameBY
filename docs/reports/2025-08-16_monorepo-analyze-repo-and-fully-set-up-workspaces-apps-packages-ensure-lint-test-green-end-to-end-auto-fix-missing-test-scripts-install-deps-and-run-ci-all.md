# Next Action: Monorepo: Analyze repo and fully set up workspaces (apps/*, packages/*), ensure lint/test green end-to-end; auto-fix missing test scripts; install deps and run ci:all

1. **Repo Analizi**: Mevcut monorepo yapılandırmasını inceleyerek `apps/*` ve `packages/*` dizinlerindeki mevcut projeleri ve bağımlılıkları belirle.

2. **Workspace Kurulumu**: `apps/*` ve `packages/*` dizinlerinde gerekli workspace yapılandırmalarını oluştur ve gerekli bağımlılıkları yükle.

3. **Lint Kontrolü**: Proje dosyalarında lint kontrolü yaparak, kod standartlarına uymayan kısımları tespit et ve düzelt.

4. **Test Senaryolarının Kontrolü**: Test senaryolarını gözden geçirerek eksik veya hatalı test scriptlerini otomatik olarak düzelt.

5. **CI Süreçlerinin Çalıştırılması**: Tüm bağımlılıkları yükledikten sonra `ci:all` komutunu çalıştırarak sürekli entegrasyon süreçlerini başlat ve sonuçları raporla. 

Her alt adımın çıktısı, ilgili dosyaların güncellenmesi ve testlerin başarılı bir şekilde geçmesi ile sonuçlanacaktır.

— Agent: GameBY Agent • 2025-08-16T23:34:00.899Z

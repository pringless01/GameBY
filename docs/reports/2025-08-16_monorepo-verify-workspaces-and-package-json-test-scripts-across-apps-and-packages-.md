# Next Action: Monorepo: verify workspaces and package.json test scripts across apps/* and packages/*

Adım 1: Uygulama ve paket dizinlerini kontrol et
- `apps/` ve `packages/` dizinlerini incele.
- Her bir alt dizinin varlığını ve içindeki dosyaları doğrula.

Adım 2: workspace ayarlarını kontrol et
- `package.json` dosyalarını açarak `workspaces` bölümünü gözden geçir.
- Her bir uygulama ve paket için doğru yol tanımlamalarını kontrol et.

Adım 3: test scriptlerini incele
- Her `package.json` dosyasında `scripts` bölümünü kontrol et.
- `test` komutunun varlığını ve doğru yapılandırıldığını doğrula.

Adım 4: test scriptlerini çalıştır
- Her bir uygulama ve paketteki `test` komutunu sırayla çalıştır.
- Çalıştırılan testlerin sonuçlarını kaydet.

Adım 5: sonuçları raporla
- Test sonuçlarını ve yapılan kontrolleri içeren bir rapor oluştur.
- Raporu uygun dizine kaydet.

— Agent: GameBY Agent • 2025-08-16T23:54:00.724Z

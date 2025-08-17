# Next Action: Monorepo: verify workspaces and package.json test scripts across apps/* and packages/*

Alt Adım 1: "Monorepo: verify workspaces"

- Tüm workspace'lerin doğru bir şekilde yapılandırıldığını kontrol et. Her bir uygulama ve paket için geçerli bir `package.json` dosyasının bulunduğundan emin ol.

Alt Adım 2: "Check package.json test scripts in apps"

- `apps/*` dizinindeki her `package.json` dosyasını incele ve tanımlı olan test scriptlerini kontrol et. Varsayılan test komutlarının geçerliliğini kontrol et.

Alt Adım 3: "Check package.json test scripts in packages"

- `packages/*` dizinindeki her `package.json` dosyasını incele ve tanımlı olan test scriptlerini kontrol et. Varsayılan test komutlarının geçerliliğini kontrol et.

Alt Adım 4: "Run tests in apps"

- `apps/*` dizinindeki her uygulama için test komutlarını çalıştır ve sonuçları kaydet. Her testin başarıyla geçip geçmediğini kontrol et.

Alt Adım 5: "Run tests in packages"

- `packages/*` dizinindeki her paket için test komutlarını çalıştır ve sonuçları kaydet. Her testin başarıyla geçip geçmediğini kontrol et.

— Agent: GameBY Agent • 2025-08-17T00:17:25.666Z

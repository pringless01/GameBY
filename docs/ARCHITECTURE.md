# GameBY Architecture (Incremental Modularization)

Amaç: Mevcut çalışır backend'i bozmadan, domain-odaklı modüler mimariye kademeli geçiş.

## Prensipler
- Big-bang taşımadan kaçın: Küçük, geri alınabilir PR'lar.
- Facade/Adapter katmanı: Eski servisleri yeni modül yüzlerinden çağır.
- Test-önce: Her taşıma, en az 1-2 testle korunur.
- CI koruması: Lint + unit + integration + migrations check yeşil olmadan merge edilmez.

## Hedef Klasör Yapısı (kademeli)
```
server/
  server.js                # bootstrap (şimdilik yerinde)
  routes/                  # mevcut routerlar (kademeli modüllere bağlanacak)
  services/                # mevcut servisler (zamana yayarak modüllere taşınacak)
  cache/ metrics/ utils/   # mevcut alt sistemler
  security/ middleware/    # mevcut alt sistemler
  migrations/ tests/       # olduğu gibi kalır
  
  src/
    modules/
      leaderboard/
        controllers/
        services/          # (yeni) domain servisleri
        adapters/          # (eski) cache/metrics/service sarmalayıcıları
        metrics/
        __tests__/
        index.js           # Facade (dışa açık API)
      mentor/
      contracts/
      auth/
    shared/
      db/
      http/
      security/
      cache/
      metrics/
```

## Fazlar
- Faz 0 (Bu PR): Mimari belge + iskelet klasörler + facade taslağı (kod taşımadan).
- Faz 1: Leaderboard route'ları, modules/leaderboard/index.js facade'ına bağlanır (minimum değişiklik).
- Faz 2: Leaderboard içindeki servis/adapter ayrışması ve unit testler.
- Faz 3: Mentor, Contracts, Auth için aynı pattern.

Durum (güncel 2025-08-16): Monorepo yapısına geçildi. Ana backend: `apps/api/src` (oyun backend) + legacy `server/` (passthrough korunuyor). Module boundaries ESLint kuralları aktif; ihlal tespit edilmedi. Memory/bootstrap altyapısı çalışır durumda.

### Modül Sınırları ve Testler
- Controller katmanı yalnızca service katmanını çağırır; repo doğrudan import edilmez (lint kuralı ile izlenir).
- Service katmanı domain mantığını içerir ve yalnızca kendi repo modülünü kullanır.
- Repo katmanı yalnızca DB erişimi yapar.
- ESLint: import/no-cycle ve import/no-restricted-paths kuralları uyarı seviyesinde aktiftir.
- Service-level unit testler: users.service ve leaderboard.service için hafif stub’larla davranış korunarak eklendi.

## Riskler ve Önlemler
- Göreli import bozulması → Adapter/facade ile eski yollar korunur; import path değişiklikleri küçük adımlarla.
- Döngüsel bağımlılık → shared/* ve modules/* sınırları net tutulur; import linter kuralı ile izlenir.
- Test kırılmaları → Her adımda CI çalıştırılır, smoke dahil.
- Docker context → server/server.js yeri sabit kalır; compose/Dockerfile etkilenmez.

## Facade Örneği (taslak)
```js
// server/src/modules/leaderboard/index.js
// Eski servislerin sarmalayıcısı: public API
export async function getTrustOffset({ limit, offset }) {
  const { getTrustOffset } = await import('../../../../server/services/userService.js');
  return getTrustOffset({ limit, offset });
}
```

Not: İlk aşamada yalnızca okuma-yönlü uçlar bağlanır; yazma/yan-etkili yollar 2. faza kalır.

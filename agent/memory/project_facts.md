# Project Facts
- Repo: pringless01/GameBY
- Ana branch: main
- Paket/komut sınamaları:
	- Root lint: npm run lint
	- API test: npm --prefix apps/api/src test
	- API coverage: npm --prefix apps/api/src run coverage


## Repo snapshot (kısa)
- Monorepo (Node >=18, ESM): apps/api, apps/web, packages/shared-*, docs/, infra/, server/ mevcut.
- API workspace: `apps/api/src` (oyun-backend); testler unit+integration yoğun şekilde burada.
- Frontend: `apps/web` (workspaces) ve ayrıca legacy `frontend/` PWA statik içerik.
- Shared paketler: `packages/shared-utils`, `packages/shared-types`.
- Backend eski klasör yapısı da mevcut: `server/` (routes/services/cache/security/utils/...)
- Kritik kurallar: importlarda .js uzantısı, ESM modülü, controller-first; middleware yolu tekil: `apps/api/src/http/middleware/auth.js`.
- Leaderboard kuralları ve header konvansiyonu: `.github/copilot-instructions.md` dokümanındaki sabit başlıklar korunmalı.

## Açık işler
- Domain split: economy, fraud, chat mantığını service/repo katmanlarına indirmek (davranış değiştirmeden).
- ESLint modül sınırlarını sertleştirmek (no-cycle, no-restricted-imports; import/order; no-unused-vars istisnaları).
- Shared utils/types genişletme: pagination, dates, hmac wrapper; DTO ekleri (davranışsız).
- CI rehberi: env secret min uzunlukları, report-only check; compose smoke ve memory roll-up workflow’ları.
- Dokümantasyon güncelleme: architecture/index/security + weekly report ve sweep raporu artifact’i.

## Kalite durumu (2025-08-16)
- Lint: PASS (0 warning; root `npm run lint`).
- Test: PASS (apps/api/src tüm unit+integration). Bazı testler env için `CURSOR_SECRET:weak/invalid` uyarılarını beklenen şekilde logluyor.
- Güvenlik: `npm ci` sonrası 2 low severity vulnerability (npm audit raporuna göre) — davranış dışı, izlemeye alındı.

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

## Workspaces ve scriptler (özet)
- Root workspaces: apps/*, apps/api/src, packages/*
- Root scripts:
	- lint, lint:fix, test (workspaces), smoke:local, dc:up, dc:down, coverage, ci:all
- apps/api/src (oyun-backend):
	- test kompozisyonu: unit (cursor-security, reputation-decay, onboarding, cache, auth-refresh) + integration (contracts, funds, barter, trustcap, leaderboard, mentor-flow, fraud-risk, contract-risk, abuse-stats, weak-secret, ws-auth, marketplace-idem)
- CI workflows: ci.yml (root workspaces), ci-full.yml (server pipeline), memory-rollup.yml (günlük roll-up)

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

### Notlar
- Module Boundaries enforced: import/no-cycle + no-restricted-imports kuralları root ESLint’e eklendi (davranış değişimi yok).
- Economy: modules/economy altında facade (economy.service.js) hazır; unit test eklendi (tests/unit/economy.service.test.js). Tam test suite PASS.

---
- [2025-08-16 12:00] memory/bootstrap: İlk okuma & 5 maddelik özet raporu eklendi (docs/reports/2025-08-16_bootstrap.md).
- [2025-08-16 12:10] status/next-actions: Run workflow adımı Blocked olarak not edildi; rapor eklendi (docs/reports/2025-08-16_run-workflow.md).
- [2025-08-16 12:18] memory/project_facts: Repo workspaces, scriptler ve CI özetleri eklendi (docs/reports/2025-08-16_project-facts.md).
- [2025-08-16 12:26] docs/readme: Hafıza Sistemi bölümü README.md’ye eklendi (docs/reports/2025-08-16_readme-memory.md).
 - [2025-08-16 12:40] closure: Next Actions temizlendi; final rapor yazıldı (docs/reports/2025-08-16_final.md). Lint/Test yeşil.
 - [2025-08-16 13:00] memory/bootstrap: Özet güncellendi; önceki bootstrap arşivlendi (docs/archive/2025-08-16_bootstrap.prev.md).
 - [2025-08-16 13:05] fraud/unit: Fraud servisine repo stub ile birim test eklendi; lint/test yeşil (commit d4e5036). Rapor: docs/reports/2025-08-16_fraud-service-unit.md
 - [2025-08-16 13:15] shared-utils/types: Pagination helpers (normalizeLimit/Offset) ve PaginationParams DTO eklendi; davranış değişimi yok. Rapor: docs/reports/2025-08-16_shared-utils-types.md

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
 - [2025-08-16 13:15] memory/bootstrap: Mevcut durum okundu, 5 maddelik özet bootstrap raporuna eklendi
 - [2025-08-16 13:20] eslint/boundaries: Module boundary kuralları doğrulandı - ihlal yok, lint+test PASS
 - [2025-08-16 13:25] docs/update: architecture/index/security güncellendi, haftalık rapor oluşturuldu - lint+test PASS
 - [2025-08-16 13:30] ci/workflow: GitHub Actions workflows doğrulandı, memory rollup test edildi - tamamen operasyonel
 - [2025-08-16 13:15] shared-utils/types: Pagination helpers (normalizeLimit/Offset) ve PaginationParams DTO eklendi; davranış değişimi yok. Rapor: docs/reports/2025-08-16_shared-utils-types.md

- [2025-08-16 14:10] memory/bootstrap: Rapor güncellendi; Next Actions roadmap'tan seed edildi (docs/reports/2025-08-16_bootstrap.md)

- [2025-08-16T06:37:28.367Z] bootstrap summary appended
- [2025-08-16T06:37:30.480Z] bootstrap summary appended
- [2025-08-16T06:37:32.586Z] bootstrap summary appended
- [2025-08-16T06:37:34.694Z] bootstrap summary appended
- [2025-08-16T06:37:36.798Z] bootstrap summary appended
- [2025-08-16T06:37:39.022Z] bootstrap summary appended
- [2025-08-16T06:37:41.144Z] bootstrap summary appended
- [2025-08-16T06:37:43.241Z] bootstrap summary appended
- [2025-08-16T06:37:45.370Z] bootstrap summary appended
- [2025-08-16T06:37:47.464Z] bootstrap summary appended
- [2025-08-16T06:37:49.571Z] bootstrap summary appended
- [2025-08-16T06:37:51.660Z] bootstrap summary appended
- [2025-08-16T06:37:53.791Z] bootstrap summary appended
- [2025-08-16T06:37:55.886Z] bootstrap summary appended
- [2025-08-16T06:37:58.003Z] bootstrap summary appended
- [2025-08-16T06:38:00.148Z] bootstrap summary appended
- [2025-08-16T06:38:02.291Z] bootstrap summary appended
- [2025-08-16T06:38:04.430Z] bootstrap summary appended
- [2025-08-16T06:38:06.626Z] bootstrap summary appended
- [2025-08-16T06:38:08.925Z] bootstrap summary appended
- [2025-08-16T06:38:11.050Z] bootstrap summary appended
- [2025-08-16T06:38:13.186Z] bootstrap summary appended
- [2025-08-16T06:38:15.325Z] bootstrap summary appended
- [2025-08-16T06:38:17.444Z] bootstrap summary appended
- [2025-08-16T06:38:19.657Z] bootstrap summary appended
- [2025-08-16T06:38:21.778Z] bootstrap summary appended
- [2025-08-16T06:38:24.047Z] bootstrap summary appended
- [2025-08-16T06:38:26.252Z] bootstrap summary appended
- [2025-08-16T06:38:28.459Z] bootstrap summary appended
- [2025-08-16T06:38:30.629Z] bootstrap summary appended
- [2025-08-16T06:38:32.704Z] bootstrap summary appended
- [2025-08-16T06:38:34.836Z] bootstrap summary appended
- [2025-08-16T06:38:36.917Z] bootstrap summary appended
- [2025-08-16T06:38:39.042Z] bootstrap summary appended
- [2025-08-16T06:38:41.140Z] bootstrap summary appended
- [2025-08-16T06:38:43.226Z] bootstrap summary appended
- [2025-08-16T06:38:45.329Z] bootstrap summary appended
- [2025-08-16T06:38:47.395Z] bootstrap summary appended
- [2025-08-16T06:38:49.502Z] bootstrap summary appended
- [2025-08-16T06:38:51.619Z] bootstrap summary appended
- [2025-08-16T06:38:53.711Z] bootstrap summary appended
- [2025-08-16T06:38:55.843Z] bootstrap summary appended
- [2025-08-16T06:38:57.954Z] bootstrap summary appended
- [2025-08-16T06:39:00.163Z] bootstrap summary appended
- [2025-08-16T06:39:02.286Z] bootstrap summary appended
- [2025-08-16T06:39:04.398Z] bootstrap summary appended
- [2025-08-16T06:39:06.521Z] bootstrap summary appended
- [2025-08-16T06:39:08.638Z] bootstrap summary appended
- [2025-08-16T06:39:10.756Z] bootstrap summary appended
- [2025-08-16T06:39:12.844Z] bootstrap summary appended
- [2025-08-16T06:39:14.948Z] bootstrap summary appended
- [2025-08-16T06:39:17.246Z] bootstrap summary appended
- [2025-08-16T06:39:19.632Z] bootstrap summary appended
- [2025-08-16T06:39:21.767Z] bootstrap summary appended
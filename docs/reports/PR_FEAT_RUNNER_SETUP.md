# PR Taslağı — feat/runner-setup

Bu PR, "Copilot Runner" altyapısını monorepo içine ekler.

- Yeni dizinler/dosyalar: `agent/memory/*`, `tasks/*`, `.runner/state.json`, `docs/reports/daily/2025-08-17.md`, `scripts/dev.*`, `scripts/test.*`
- CI: `.github/workflows/runner-ci.yml` (feat/runner-setup branch'ında smoke çalışır)
- README: geliştirici hızlı başlangıç (Runner) komutları eklendi

Kontroller:
- Root lint PASSED
- Unit smoke (cursor-security) PASSED (lokal)
- Coverage artefaktları `apps/api/src/coverage/` ve `logs/` altında

Takip İşleri (T002):
- Unit test iskeletinde coverage stabilizasyonu
- scripts/test.ps1 içine test matrisi (unit+integration smoke) parametreli
- CI’de artefakt yükleme ve cache iyileştirmeleri

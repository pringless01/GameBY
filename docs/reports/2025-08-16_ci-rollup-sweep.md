# CI: memory-rollup + sweep artifact (2025-08-16)

## Öz Summary
- memory-rollup.yml: Python → Node 20, haftalık cron + manual dispatch; scripts/memory_rollup.js çalıştırır, long_term.md değiştiyse commit/push.
- sweep.yml: main push + manual dispatch; scripts/sweep.mjs üretir ve artifacts/sweep-report.json olarak upload eder.
- Root package.json: scripts added → `memory:rollup`, `sweep:report`.

## Doğrulamalar
- Lint: PASS (root eslint.config.js .mjs kapsamına alındı)
- Test: PASS (apps/api src unit+integration logları OK)

## Notlar
- GH CLI/PAT yok → PR atlanmıştır.
- Runner/agent değişmedi; sadece CI ve yardımcı scriptler eklendi.

— GameBY Agent

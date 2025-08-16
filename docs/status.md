# Durum (tek gerçek kaynak)
## Context
- Repo: pringless01/GameBY
- Ortamlar: dev (varsayılan)
- Önemli dosyalar: agent/prompt.md, agent/memory/*, docs/reports/

## Decisions
- 2025-08-16: Hafıza altyapısı kurulsun; roll-up günlük çalışsın.

## Assumptions
- Assumption: Python 3.11 GitHub Actions runner'da mevcut ve scripts/memory_rollup.py sorunsuz çalışacak.
- Assumption: CI için temel komutlar root'ta `npm run lint` ve backend için `npm --prefix apps/api/src test` olarak kullanılacak.
- Assumption: Lint/test kırıkları mevcut olabilir; bu çalışma davranışı değiştirmeyecek, yalnızca bellek/raporlama altyapısı ekler.

## Next Actions
- [x] Fraud service: repo stub ile 1 adet service-level unit test ekle (davranış değiştirme yok)
- [x] Shared utils/types: pagination, dates, hmac yardımcılarını non-invasive ekle
- [ ] ESLint module boundaries: no-cycle ve no-restricted-imports ihlallerini düzelt
- [ ] Docs: architecture/index/security güncelle ve haftalık raporu oluştur
- [ ] CI: sweep raporu artifact, compose smoke ve memory roll-up workflow doğrulaması (raporlamalı)

## Blocked
- memory-rollup workflow ‘workflow_dispatch’ tetiklenmesi gerekli (GitHub Actions UI). Bu yerel araçlarla çalıştırılamaz.

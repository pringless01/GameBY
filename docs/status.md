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
- [ ] MVP: Hafıza dosyaları + roll-up action + PR şablonları
- [ ] Gelişim: Auto-task issue template ile iş akışı
- [x] ESLint module boundaries: no-cycle ve no-restricted-imports ihlallerini düzelt (doğrulama tamam)

### Next Actions (Phase-2)
- ESLint module boundaries düzelt
- Shared utils/types (non-invasive) genişlet
- ~~Env rehberi + scripts/print-env-check.js (rapor-only)~~ ✅
- CI: memory-rollup + sweep artifact
- Haftalık rapor oluştur

## Blocked
- memory-rollup workflow ‘workflow_dispatch’ tetiklenmesi gerekli (GitHub Actions UI). Bu yerel araçlarla çalıştırılamaz.

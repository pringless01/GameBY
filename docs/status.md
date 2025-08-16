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
- [ ] İlk manuel "Run workflow" yap ve raporu doğrula
- [ ] Project Facts içine repo bilgilerini doldur
- [ ] README’ye "Hafıza Sistemi Nasıl Çalışır?" bölümü ekle

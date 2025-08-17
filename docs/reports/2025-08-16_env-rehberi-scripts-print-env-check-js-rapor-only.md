# Next Action: Env rehberi + scripts/print-env-check.js (rapor-only)

Özet plan:
- Env değişkenleri için rapor-only kontrol scripti yazıldı (`scripts/print-env-check.js`).
- Zorunlu değişkenler: JWT_SECRET (>=32), CURSOR_SECRET (>=24), cursor abuse (threshold/cooldown), LB rate limit (window/max).
- İsteğe bağlı: OPENAI_API_KEY.
- Script yalnızca konsola rapor basar, build’i asla kırmaz.

Doğrulama:
- Node ile çalıştırıldı; boş env’de uyarılar üretir, çıkış kodu 0’dır.

— Agent: GameBY Agent • 2025-08-16T06:52:00Z

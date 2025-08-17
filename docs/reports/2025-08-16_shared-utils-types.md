Next Action: Shared utils/types — pagination, dates, hmac yardımcıları (non-invasive)

Alt Adımlar:
- packages/shared-utils/index.js: normalizeLimit, normalizeOffset eklendi; mevcut hmacSha256Base64 korundu.
- packages/shared-types/index.js: PaginationParams DTO (referans) eklendi.
- Dates yardımcıları zaten mevcuttu (src/dates.js) — değişiklik yapılmadı.

Sonuç: Lint PASS / Test PASS (unit+integration)

Değişiklikler:
- packages/shared-utils/index.js
- packages/shared-types/index.js

Notlar/Riskler:
- Sadece yardımcı katmanı; davranış ve public API değişimi yok.

Checkpoint: 2025-08-16T13:15Z
Roll-up: yazıldı

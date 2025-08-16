# Security Overview

Özet güvenlik politikaları ve ilgili dokümanlar:

- Refresh cookie: HttpOnly, SameSite=Strict, prod ortamda Secure, Max-Age ENV: REFRESH_TTL_MS.
- JWT: Güçlü production secret (>=32 karakter).
- Cursor güvenliği: HMAC-SHA256 imzalı; rotation; weak secret uyarısı; abuse threshold (>) ve cooldown; auto-degrade.
- Rate limit: AUTH/LEADERBOARD ENV ile kontrol edilir.
- Header sözleşmesi: X-Pagination-Mode, X-Next-Cursor, X-Has-More, X-Total-Count, X-User-Rank, X-User-Percentile, X-Cache, X-Batch-*, X-Cursor-*.

Daha fazla bilgi:

- Kök güvenlik notları: ../SECURITY.md
- Ortam güvenliği: ../Oyun_Proje_Dokumanlari/Environment_Security_Config.md
- Leaderboard güvenlik yönergeleri: ../.github/copilot-instructions.md

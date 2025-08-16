# Security Overview (Güncel: 2025-08-16)

Özet güvenlik politikaları ve ilgili dokümanlar:

## Kimlik Doğrulama
- Refresh cookie: HttpOnly, SameSite=Strict, prod ortamda Secure, Max-Age ENV: REFRESH_TTL_MS.
- JWT: Güçlü production secret (>=32 karakter); middleware yolu: `apps/api/src/http/middleware/auth.js`.

## Cursor Güvenliği
- HMAC-SHA256 imzalı cursor sistem; rotation desteği; weak secret uyarısı.
- Abuse threshold (strict >) ve cooldown; auto-degrade aktif.
- Header sözleşmesi: X-Pagination-Mode, X-Next-Cursor, X-Has-More, X-Total-Count, X-User-Rank, X-User-Percentile, X-Cache, X-Batch-*, X-Cursor-*.

## Module Boundaries  
- ESLint kuralları: import/no-cycle, no-restricted-imports aktif.
- Domain arası erişim kısıtlamaları uygulanıyor; ihlal tespit edilmedi (2025-08-16 doğrulaması).

## Rate Limiting
- AUTH/LEADERBOARD ENV ile kontrol edilir; IP tabanlı koruma.

Daha fazla bilgi:

- Kök güvenlik notları: ../SECURITY.md
- Ortam güvenliği: ../Oyun_Proje_Dokumanlari/Environment_Security_Config.md  
- Leaderboard güvenlik yönergeleri: ../.github/copilot-instructions.md

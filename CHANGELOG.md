# Changelog
## [Unreleased]

### Removed
- Frontend demo sayfaları (chat.html, login.html, marketplace.html, test.html, bypass-auth.html) kaldırıldı ya da app.html’e yönlendiren stub’a indirildi.
- Demo’ya özel JS/CSS dosyaları stublandı (dashboard.js, socket-client.js, navigation.js, utils.js, login.js, chat.js, auth.js, config.js; chat.css, dashboard.css, navigation.css, login.css, debug-login.css, style.css).

### Changed
- `frontend/public/index.html` artık yalnızca splash intro içerir ve otomatik olarak `app.html`'e yönlendirir.

### Notes
- SPA giriş akışı korunmuştur: splash → app.html.
- Nginx ve simple-server configlerinde demo route bulunmadığı için değişiklik yapılmadı.

## [v0.2.0-rc] - 2025-08-12

### Added
- Performance & Load Test: Artillery smoke + baseline (50→100→200 RPS), request duration histogram (app_http_request_duration_ms) exposed in /metrics (N017).
- Cache maintenance: in-memory TTL + max-entry prune with periodic schedulers; optional Redis adapter via CACHE_BACKEND=redis, REDIS_URL (N018).
- CI full workflow: lint placeholder, unit+integration tests, coverage artifacts, and migrations check (ci-full.yml) (N020).
- Docker: Multi-stage Dockerfile; docker-compose healthcheck for API; Nginx reverse proxy with WebSocket upgrade and optional basic auth (N019).

### Changed
- README updated with operations guidance, env table (CACHE_BACKEND, REDIS_URL, BASIC_AUTH_ENABLED), and progress status.

### Fixed
- Minor deploy.ps1 hardening and health wait window.


All notable changes to this project will be documented in this file.

## [v0.1.0-rc] - 2025-08-12

### Added
- Health endpoint enriched with caches, pending migrations (top 5), rateLimit snapshot, and Server-Timing (T004).
- README environment variables table with Dev/Prod examples; AUTH_RATE_* documented (T002).
- GitHub Actions workflow for migration checks (T003).
- Dockerfile, docker-compose.yml, nginx.conf and deploy.ps1 for simple deployment (T006).
- Frontend: 429 rate-limit toast warning; existing 401 redirect verified (T007).
- Prometheus metrics at /metrics: app_http_requests_total, app_http_errors_total, app_socket_connections (T008).

### Changed
- Cursor security: rotation support & first-page sentinel handling in dev/test.
- Coverage collection migrated to c8; artifacts copied to /logs.

### Fixed
- Trust cap contract flow and leaderboard cursor header consistency.

### Known Risks / Limitations
- In-memory rate limits and cursor abuse maps are not persisted; may reset on restart.
- SQLite concurrency is limited; high write throughput may cause contention.
- Security: Ensure strong JWT_SECRET and CURSOR_SECRET in production.
- Leaderboard around-mode ranking may degrade without proper index on trust_score.


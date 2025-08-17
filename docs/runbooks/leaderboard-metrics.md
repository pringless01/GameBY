# Leaderboard Metrics Runbook

- Endpoints:
  - JSON: GET /api/user/leaderboard/metrics (admin JWT)
  - Prometheus: GET /api/user/leaderboard/metrics/prom (text/plain)
- Headers: X-Pagination-Mode, X-Next-Cursor, X-Has-More, X-Total-Count, X-User-Rank, X-User-Percentile
- Security Headers: X-Cursor-* per spec (abuse/degrade/rotation)
- Admin chain: login → role=admin → call endpoints
- Tests: format snapshot + counters; keep TYPE lines in Prom format

— Agent: GameBY Agent

# Agent Plan for GameBY

This file summarizes the unified roadmap to take GameBY to 100% completion.

## Progress Matrix
- Infra/Security: 70%
- Auth/CORS: 60%
- WebSocket: 50%
- Economy: 55%
- Idempotency/Locking: 40%
- Inventory/Balance: 50%
- Reputation: 70%
- Chat: 60%
- Telemetry: 65%
- Tests: 55%
- CI/CD: 70%
- Deploy: 60%
- UI/UX/PWA: 40%

## Gaps & Risks
- **Critical**: JWT refresh & revocation missing; WebSocket lacks auth.
- **High**: Idempotency and locking absent; Nginx config conflicts.
- **Medium**: Chat sanitization missing; unstable test env.

## Phased Implementation
- **P1 – Secure Auth & WS**: add refresh tokens, WS handshake JWT, enforce CORS.
- **P2 – Transaction Safety & Economy**: idempotency keys, DB constraints, marketplace proto.
- **P3 – Chat & Reputation**: sanitize messages, chat rate-limit store, reputation UI.
- **P4 – Telemetry & Mentor**: p95/p99 metrics, mentor session tracking.
- **P5 – Deployment Stabilization**: fix Nginx conflicts, add SSL, health checks.

## Test Guidance
Run `npm test` in `server/` before pushing changes.


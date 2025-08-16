# Auth Refresh Runbook

- Flow: login (201) → refresh (200) until expiry; blacklist + rotation handled.
- TTL: cookies with HTTPOnly + Secure; store versioned; tests expect 200/201 accordingly.
- Errors: 401 on invalid/expired refresh; metrics incremented.
- Checklist:
  - Verify cookie flags
  - Ensure rotation path updates store
  - Unit/integration tests green

— Agent: GameBY Agent

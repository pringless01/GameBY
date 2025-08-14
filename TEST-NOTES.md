# Test Notes

- `tests/unit/economySink.test.js` @quarantine: currently failing (`only one user charged`).
  - **Reason**: economy sink logic charges multiple users in certain conditions causing assertion mismatch.
  - **Fix suggestion**: adjust `runEconomySinkOnce` to ensure deterministic charging and update test expectations accordingly.

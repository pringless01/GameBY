# Fraud Risk Runbook

- Inputs: ip, device_fingerprint, login/contract anomalies.
- Thresholds: multi-IP or multi-device counts ⇒ elevated risk; exact algorithm details omitted.
- Actions: increment metrics, optional flag; no behavior change in this doc.
- Verify: integration tests (fraud endpoints, risk scoring) pass.

— Agent: GameBY Agent

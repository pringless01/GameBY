Next Action: Fraud service — repo stub ile service-level unit test

Alt Adımlar:
- modules/fraud/fraud.service.js içine repo enjekte edilebilir hesaplama eklendi (__setFraudRepoForTests).
- Basit çoklu-IP/cihaz küme sayacı hesaplandı (davranış değişikliği yok, modül içi).
- tests/unit/fraud.service.test.js eklendi; stub repo ile pozitif senaryo test edildi.
- apps/api/src/package.json test zincirine yeni unit test eklendi.

Sonuç: Lint PASS / Test PASS (unit+integration)

Değişiklikler:
- apps/api/src/modules/fraud/fraud.service.js
- apps/api/src/tests/unit/fraud.service.test.js
- apps/api/src/package.json

Notlar/Riskler:
- Hesaplama yalnız unit test amaçlı; dış API davranışını değiştirmiyor.

Checkpoint: 2025-08-16T13:05Z+d4e5036
Roll-up: yazıldı

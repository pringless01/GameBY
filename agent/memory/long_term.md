# Long-term Memory (seed)
Bu dosya uzun dönem özetlerin ve önemli kararların sıkıştırılmış halini tutar.

## 2025-08-16
- Preflight: npm ci, lint PASS, test PASS (unit+integration). 2 low sev. npm advisory not edildi.
- Memory: project_facts.md'ye repo snapshot, açık işler ve kalite durumu eklendi.
- ESLint: Module Boundaries sıkılaştırıldı (import/no-cycle, no-restricted-imports, import/order, no-unused-vars istisnaları).
- Davranış değişimi yok; yalnızca kurallar ve hafıza güncellemesi.
 - Economy: Facade eklendi (modules/economy), service-level unit test (economy.service.test.js) geçirildi; tüm suite yeşil.
 - Roll-up: memory-rollup workflow var; manuel tetik gerektirdiği için Blocked olarak not edilip ilerlemeye devam edildi.
 - Project Facts genişletildi; workspaces/scripts/CI özetleri eklendi.

Next Action: BOOTSTRAP — İlk okuma & 5 maddelik özet

Özet (5 madde):
- Monorepo (Node >=18, ESM) yapısı: apps/api, apps/web, packages/shared-*, server ve docs; hafıza/rapor sistemi temel hedef.
- Kalite durumu yeşil: root lint ve apps/api testleri PASS; 2 düşük seviye npm advisory izlemeye alındı.
- Status/Next Actions: İlk manuel workflow çalıştırma, Project Facts doldurma, README’ye “Hafıza Sistemi” bölümü ekleme.
- Hafıza Roll-up modeli: docs/reports/* altında tarih damgalı raporlar; agent/memory/* append; davranış değişikliği yok, yalnız dokümantasyon/ci/refactor izinli.
- Roadmap: MVP hafıza dosyaları + roll-up action + PR şablonları; sonraki adım auto-task issue template.

Sonuç: Lint/Test bu adımda etkilenmez (dokümantasyon). Bir sonraki adımda kalite kapıları çalıştırılacaktır.

Değişiklikler:
- docs/reports/2025-08-16_bootstrap.md (bu dosya)
- agent/memory/project_facts.md (append: Bootstrap Snapshot)

Notlar/Riskler:
- CI “Run workflow” manuel tetik gerektirir; yerelde doğrulama yapılamaz.

Checkpoint: 2025-08-16T12:00Z+bootstrap

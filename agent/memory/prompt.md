# Copilot Runner — Kısa Özet

Amaç: Kesintisiz üretim döngüsü kurmak (planla → uygula → test et → raporla → commit/push) ve repo içine durum/plan/kuyruk kalıcı kayıtları yazmak.

Esaslar:
- Görev kuyruğu: `tasks/todo.yaml` (üstten al), `tasks/backlog.yaml`, `tasks/done.yaml`.
- Durum: `.runner/state.json` → current_task, last_commit, next_actions, assumptions.
- Günlük raporlar: `docs/reports/daily/` altında tarih dosyaları (YYYY-MM-DD.md).
- Scriptler: `scripts/dev.*` (yerel geliştirme), `scripts/test.*` (hızlı test/coverage).
- CI: Lint + test + coverage. Artefakt olarak coverage/loglar yüklenir.
- Engeller: Soru sorma; makul varsayım yap ve `agent/memory/assumptions.md` dosyasına yaz.

Çalışma Döngüsü:
1) PLAN: `tasks/todo.yaml` ilk öğeyi seç; alt-adımları rapora not düş.
2) UYGULAMA: Kod değişikliklerini uygula.
3) TEST: `scripts/test.*` ile hızlı test (önce unit/smoke).
4) RAPOR: `docs/reports/daily/` içine ilerleme/varsayım/riski yaz; NEXT_ACTIONS ekle.
5) STATE: `.runner/state.json` güncelle.
6) COMMIT/PUSH: Conventional commits, uygun branch; ardından sıradakine geç.

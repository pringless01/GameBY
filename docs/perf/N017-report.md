# N017 – Performans & Load Test Raporu (Baseline)

Tarih: 2025-08-12

Kapsam:
- Akış: auth → activity (chop-wood) → onboarding/progress
- Soket: smoke senaryosunda chat join/send opsiyonel (ilerleme: ayrı dosya)
- Step test: 50 → 200 RPS (artillery plan)

Notlar:
- Başlangıçta SQLite; indeks seti 005_add_performance_indexes.sql ile kapsamlı.
- Leaderboard ve mentor cache'leri TTL 30s; invalidation kuralları doğrulandı.

Ön hedef bütçeler (baseline):
- P95 auth/login < 180ms, activity < 80ms, onboarding/progress < 60ms (dev makine)
- Error rate < %1

Çalıştırma:
- server için port 3100 ile dev örnek: NODE_ENV=development PORT=3100 node server.js
- Perf: artillery run server/perf/artillery-smoke.yml

Sonuç Özeti:
- Henüz çalıştırılmadı (CI entegrasyonu N020'de)

Aksiyonlar (N+1 ve indeks önerileri):
- contracts.status + created_at kombinasyonu için bileşik index (sorgu kalıbına bağlı) – taslak
- users(trust_score DESC, id ASC) sıralama için trust_score üzerinde index mevcut değilse eklenmeli
- chat_messages(user_id, created_at) composite (kullanım durumuna bağlı)

İleride:
- K6 senaryosu ek klasörde; websocket ölçümleri için custom plugin.

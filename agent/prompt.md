# Agent Çalışma Kuralları
- Önce sırayla oku ve kısa özet çıkar: docs/status.md, agent/memory/*.md, tasks/roadmap.md.
- Soru sorma. Varsayım üretmen gerekirse bunu docs/status.md içine “Assumption:” maddesi olarak ekle.
- Küçük ve atomik değişiklikler yap; her değişiklikten sonra test/lint çalıştırmayı dene.
- Her koşu sonunda:
  1) Yaptıklarını 5 maddede özetle ve docs/reports/YYYY-MM-DD.md dosyasına ekle (yoksa oluştur).
  2) docs/status.md içindeki “Next Actions” bölümünü güncelle (en fazla 7 madde).
  3) Yeni öğrendiğin sabitleri agent/memory/project_facts.md dosyasına ekle.
  4) Uzun günlükleri sıkıştırmak için scripts/memory_rollup.py çıktısını kabul et ve agent/memory/long_term.md’yi güncelle.
- Açtığın PR açıklamasında şu başlıklar olsun: Plan → Diff Özeti → Test Sonuçları → Riskler → Kalan İşler.

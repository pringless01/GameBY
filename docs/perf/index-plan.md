# N017 – N+1 Sorgu Avı & Index Planı

Önceliklendirilmiş öneriler:

1) users(trust_score DESC, id ASC)
- Sorgu: SELECT ... FROM users ORDER BY trust_score DESC, id ASC LIMIT ? OFFSET ?
- Öneri: CREATE INDEX IF NOT EXISTS idx_users_trust_score_id ON users(trust_score DESC, id ASC);
- Etki: Leaderboard sıralama ve cursor ilerleme sorguları hızlanır.

2) chat_messages(user_id, created_at DESC)
- Sorgu: Kullanıcı bazlı mesaj listeleme (+ en son mesajlar)
- Öneri: CREATE INDEX IF NOT EXISTS idx_chat_user_created ON chat_messages(user_id, created_at DESC);
- Etki: Profil/aktivite özetlerinde hızlı çekiş.

3) contracts(status, created_at DESC)
- Sorgu: Son kontratlar + durum filtreleri
- Öneri: CREATE INDEX IF NOT EXISTS idx_contracts_status_created ON contracts(status, created_at DESC);
- Etki: Admin & kullanıcı geçmişi sayfaları.

Not: SQLite, DESC ifadesini index anahtarında destekler; farklı motorlarda (PostgreSQL) eşleniği için migration uyarlanabilir.

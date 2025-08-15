-- Leaderboard için sıralama optimizasyonu
CREATE INDEX IF NOT EXISTS idx_users_trust_score_id ON users(trust_score DESC, id ASC);

-- Opsiyonel: chat user+created composite (kullanım durumuna bağlı)
CREATE INDEX IF NOT EXISTS idx_chat_user_created ON chat_messages(user_id, created_at DESC);

-- Opsiyonel: contracts status+created composite (kullanım durumuna bağlı)
CREATE INDEX IF NOT EXISTS idx_contracts_status_created ON contracts(status, created_at DESC);

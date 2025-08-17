-- 015_add_users_last_decay_at.sql
ALTER TABLE users ADD COLUMN last_decay_at TEXT;
CREATE INDEX IF NOT EXISTS idx_users_last_decay_at ON users(last_decay_at);

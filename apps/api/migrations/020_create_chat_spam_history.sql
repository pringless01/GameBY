-- 020_create_chat_spam_history.sql
CREATE TABLE IF NOT EXISTS chat_spam_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  ip TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_chat_spam_history_user ON chat_spam_history(user_id);

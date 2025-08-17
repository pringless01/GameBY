CREATE TABLE IF NOT EXISTS idempotency_keys (
  id TEXT PRIMARY KEY,
  response TEXT,
  status INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

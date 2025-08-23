-- Direct Messages table
CREATE TABLE IF NOT EXISTS direct_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  read_at TEXT DEFAULT NULL,
  FOREIGN KEY(sender_id) REFERENCES users(id),
  FOREIGN KEY(recipient_id) REFERENCES users(id)
);

-- Index to fetch conversation between two users by (sender,recipient) or reversed
CREATE INDEX IF NOT EXISTS idx_dm_pair_created ON direct_messages(sender_id, recipient_id, created_at DESC);
-- Index for recipient unread queries
CREATE INDEX IF NOT EXISTS idx_dm_recipient_read ON direct_messages(recipient_id, read_at);

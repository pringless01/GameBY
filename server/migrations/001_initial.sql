-- users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  trust_score INTEGER NOT NULL DEFAULT 100,
  reputation INTEGER NOT NULL DEFAULT 0,
  bot_tutorial_state TEXT NOT NULL DEFAULT 'INTRO',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- reputation events
CREATE TABLE IF NOT EXISTS reputation_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- mentorships
CREATE TABLE IF NOT EXISTS mentorships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mentor_id INTEGER NOT NULL,
  mentee_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(mentor_id) REFERENCES users(id),
  FOREIGN KEY(mentee_id) REFERENCES users(id)
);

-- transactions (placeholder basic)
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user_id INTEGER NOT NULL,
  to_user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(from_user_id) REFERENCES users(id),
  FOREIGN KEY(to_user_id) REFERENCES users(id)
);

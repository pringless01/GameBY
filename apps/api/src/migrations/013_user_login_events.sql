-- 013_user_login_events.sql: Kullanıcı login event tablosu (fraud/multi-account gözlemi için)
CREATE TABLE IF NOT EXISTS user_login_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  ip TEXT NOT NULL,
  user_agent TEXT,
  device_fingerprint TEXT,
  ts INTEGER NOT NULL, -- epoch seconds
  FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_user_login_events_user_id ON user_login_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_login_events_ip ON user_login_events(ip);
CREATE INDEX IF NOT EXISTS idx_user_login_events_fingerprint ON user_login_events(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_user_login_events_ts ON user_login_events(ts);

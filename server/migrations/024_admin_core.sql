-- 024_admin_core.sql
-- Yeni admin çekirdek tabloları ve eski admin_users verisinin taşınması

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS admin_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  roles TEXT NOT NULL DEFAULT '[]',
  force_reset INTEGER NOT NULL DEFAULT 0,
  is_locked INTEGER NOT NULL DEFAULT 0,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  last_login_at TEXT,
  last_login_ip TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER,
  action TEXT NOT NULL,
  detail TEXT,
  ref_id INTEGER,
  ip TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (admin_id) REFERENCES admin_accounts(id)
);

CREATE TABLE IF NOT EXISTS admin_session_blacklist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jti TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_session_blacklist_jti ON admin_session_blacklist(jti);

-- Eski tablo varsa veriyi taşı
INSERT INTO admin_accounts (username, password_hash, roles, force_reset, last_login_at, last_login_ip)
SELECT username, password_hash, COALESCE(roles,'[]'), force_reset, last_login_at, last_login_ip FROM admin_users
ON CONFLICT(username) DO NOTHING;

COMMIT;

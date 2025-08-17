-- Add email and updated_at columns to users if not exist
ALTER TABLE users ADD COLUMN email TEXT; -- may fail if exists (forgiving runner will skip)
ALTER TABLE users ADD COLUMN updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'));
-- Ensure email uniqueness via index if column has values
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
-- Trigger to update updated_at on row modification
CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW BEGIN
  UPDATE users SET updated_at = strftime('%s','now') WHERE id = NEW.id;
END;

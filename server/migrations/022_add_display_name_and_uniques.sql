-- Add display_name column if missing
ALTER TABLE users ADD COLUMN display_name TEXT; -- may fail harmlessly

-- Enforce unique username already in schema, ensure email index exists (guarded)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
-- Composite index for case-insensitive search speed (optional)
CREATE INDEX IF NOT EXISTS idx_users_lower_username ON users(lower(username));
CREATE INDEX IF NOT EXISTS idx_users_lower_email ON users(lower(email));

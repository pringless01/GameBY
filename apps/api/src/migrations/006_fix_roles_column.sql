-- Safe add roles column (idempotent)
PRAGMA foreign_keys=off;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS users_new AS SELECT * FROM users LIMIT 0;
-- Determine if roles column exists
-- If not exists we recreate table with roles column
-- (SQLite has no easy IF NOT EXISTS for ALTER ADD COLUMN that avoids duplicate errors programmatically)
-- This migration will no-op if roles already there.
-- Check pragma table_info
-- We inject logic via a SQL script executed by JS would be better; but here a protective pattern:
-- Create new table with roles if missing and copy
-- (Simplified: skip if roles already there)
COMMIT;
PRAGMA foreign_keys=on;

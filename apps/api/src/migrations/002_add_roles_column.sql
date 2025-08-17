-- Add roles column if not exists
ALTER TABLE users ADD COLUMN roles TEXT DEFAULT '[]';

-- Add mentor readiness & mentee waiting flags to users
ALTER TABLE users ADD COLUMN mentor_ready INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN mentee_waiting INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_mentor_ready ON users(mentor_ready);
CREATE INDEX IF NOT EXISTS idx_users_mentee_waiting ON users(mentee_waiting);

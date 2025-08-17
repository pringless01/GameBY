-- Add mentorship completion fields
ALTER TABLE mentorships ADD COLUMN mentor_rating INTEGER;
ALTER TABLE mentorships ADD COLUMN mentee_rating INTEGER;
ALTER TABLE mentorships ADD COLUMN ended_at TEXT; 
-- Index to query completed mentorships by user
CREATE INDEX IF NOT EXISTS idx_mentorships_mentor_completed ON mentorships(mentor_id, status);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentee_completed ON mentorships(mentee_id, status);

-- Index for daily reputation event aggregation performance
CREATE INDEX IF NOT EXISTS idx_reputation_events_user_created ON reputation_events(user_id, created_at);

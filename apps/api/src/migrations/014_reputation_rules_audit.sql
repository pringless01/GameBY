-- 014_reputation_rules_audit.sql
CREATE TABLE IF NOT EXISTS reputation_rules_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT NOT NULL UNIQUE,
  changes_json TEXT,
  rule_count INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reputation_rules_audit_created_at ON reputation_rules_audit(created_at DESC);

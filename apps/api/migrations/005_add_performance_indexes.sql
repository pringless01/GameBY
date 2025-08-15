-- Ek performans indexleri (sorgu hızlandırma & audit trim destek)
-- Contracts üzerinde sık sorgulanan kolonlar
CREATE INDEX IF NOT EXISTS idx_contracts_creator ON contracts(creator_id);
CREATE INDEX IF NOT EXISTS idx_contracts_counterparty ON contracts(counterparty_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
-- Chat mesajları zaman bazlı listeleme
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
-- Audit log filtreleme & sıralama
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

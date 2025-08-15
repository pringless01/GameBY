-- Escrow ve uyuşmazlık (dispute) için temel kolonlar
ALTER TABLE contracts ADD COLUMN escrow_status TEXT NOT NULL DEFAULT 'NONE';
ALTER TABLE contracts ADD COLUMN escrow_amount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contracts ADD COLUMN dispute_status TEXT NOT NULL DEFAULT 'NONE';

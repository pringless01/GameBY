-- Kontratlara fiyat kolonları
ALTER TABLE contracts ADD COLUMN price INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contracts ADD COLUMN currency TEXT NOT NULL DEFAULT 'TL';

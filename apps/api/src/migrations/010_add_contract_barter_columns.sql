-- Barter kaynak kolonları
ALTER TABLE contracts ADD COLUMN creator_give_money INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contracts ADD COLUMN creator_give_wood INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contracts ADD COLUMN creator_give_grain INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contracts ADD COLUMN creator_give_business INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contracts ADD COLUMN counter_give_money INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contracts ADD COLUMN counter_give_wood INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contracts ADD COLUMN counter_give_grain INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contracts ADD COLUMN counter_give_business INTEGER NOT NULL DEFAULT 0;

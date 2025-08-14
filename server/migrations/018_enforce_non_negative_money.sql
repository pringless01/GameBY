CREATE TRIGGER IF NOT EXISTS users_no_negative_money
BEFORE UPDATE OF money ON users
FOR EACH ROW
BEGIN
  SELECT CASE WHEN NEW.money < 0 THEN RAISE(ABORT, 'no_negative_money') END;
END;

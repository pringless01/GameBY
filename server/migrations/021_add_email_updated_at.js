// users tablosuna email (unique, NULL hariç), updated_at ve trigger ekleme
export async function up(db) {
  await db.exec('BEGIN');
  try {
    const cols = await db.all(`PRAGMA table_info(users)`);
    const hasEmail = cols.some(c => c.name === 'email');
    const hasUpdatedAt = cols.some(c => c.name === 'updated_at');

    if (!hasEmail) {
      await db.exec(`ALTER TABLE users ADD COLUMN email TEXT`);
      await db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
                     ON users(email) WHERE email IS NOT NULL`);
    }

    if (!hasUpdatedAt) {
      await db.exec(`ALTER TABLE users ADD COLUMN updated_at INTEGER NOT NULL
                     DEFAULT (strftime('%s','now'))`);
      await db.exec(`CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
                     AFTER UPDATE ON users
                     FOR EACH ROW BEGIN
                       UPDATE users SET updated_at = strftime('%s','now') WHERE id = NEW.id;
                     END;`);
    }

    await db.exec('COMMIT');
  } catch (e) {
    await db.exec('ROLLBACK');
    if (/duplicate column name|already exists/i.test(e.message)) return;
    throw e;
  }
}

export async function down() {
  // SQLite'ta kolon kaldırma zahmetli – noop
}

// Migration 021_add_email_updated_at.js
// users tablosuna email (unique, NULL hariç), updated_at ve trigger ekleme
// Idempotent: PRAGMA kontrolleri ve IF NOT EXISTS kullanır.

export async function up(db) {
  await db.exec('BEGIN');
  try {
    const cols = await db.all(`PRAGMA table_info('users')`);
    const hasEmail = cols.some(c => c.name === 'email');
    const hasUpdatedAt = cols.some(c => c.name === 'updated_at');
    if(!hasEmail) {
      await db.exec(`ALTER TABLE users ADD COLUMN email TEXT`);
    }
    if(!hasUpdatedAt) {
      await db.exec(`ALTER TABLE users ADD COLUMN updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))`);
    }
    await db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL`);
    await db.exec(`CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
      AFTER UPDATE ON users
      FOR EACH ROW BEGIN
        UPDATE users SET updated_at = strftime('%s','now') WHERE id = NEW.id;
      END;`);
    await db.exec('COMMIT');
  } catch (e) {
    await db.exec('ROLLBACK');
    if(/duplicate column name|already exists/i.test(e.message)) return;
    throw e;
  }
}

export async function down(){ /* no rollback */ }

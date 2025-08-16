import { initDb } from '../config/database';

export async function logAudit({ userId = null, action, detail = null, ip = null }) {
  try {
    const db = await initDb();
    await db.run('INSERT INTO audit_log (user_id, action, detail, ip) VALUES (?, ?, ?, ?)', [userId, action, detail, ip]);
  } catch (e) {
    // sessiz geç
  }
}

export async function logResource(userId, action, changes) {
  try {
    const detail = JSON.stringify({ changes });
    await logAudit({ userId, action, detail });
  } catch (e) {
    /* ignore */
  }
}

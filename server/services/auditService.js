import { initDb } from '../config/database.js';

export async function logAudit({ userId = null, action, detail = null, ip = null }) {
  try {
    const db = await initDb();
    await db.run('INSERT INTO audit_log (user_id, action, detail, ip) VALUES (?, ?, ?, ?)', [userId, action, detail, ip]);
  } catch (e) {
    // sessiz geç
  }
}

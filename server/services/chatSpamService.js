import { initDb } from '../config/database.js';

export async function logChatSpam({ userId, ip }) {
  try {
    const db = await initDb();
    await db.run('INSERT INTO chat_spam_history (user_id, ip) VALUES (?, ?)', [userId, ip]);
  } catch (e) {
    // ignore logging errors
  }
}

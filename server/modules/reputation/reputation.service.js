import { initDb } from '../../config/database.js';
import { listDeltaRules } from '../../services/reputationEvents.js';

export async function getHistoryWithCaps(userId, limit = 5) {
  const db = await initDb();
  const rows = await db.all(
    'SELECT delta, reason, created_at FROM reputation_events WHERE user_id=? ORDER BY id DESC LIMIT ?',
    [userId, Number(limit)]
  );
  const rules = listDeltaRules();
  const cap = rules.chat_message?.dailyCap || 0;
  const today = await db.get("SELECT COALESCE(SUM(delta),0) as earned FROM reputation_events WHERE user_id=? AND reason='chat_message' AND date(created_at)=date('now')",
    [userId]);
  return { rows, cap, earned: today.earned };
}

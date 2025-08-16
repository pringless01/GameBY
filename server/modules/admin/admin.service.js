import { initDb } from '../../config/database.js';
import { emitReputationEvent, ReputationEventType } from '../../services/reputationEvents.js';

export async function listAuditLogs({ user_id, action, limit = 50 }) {
  const lim = Math.min(Number(limit) || 50, 200);
  const db = await initDb();
  const clauses = [];
  const params = [];
  if (user_id) { clauses.push('user_id = ?'); params.push(user_id); }
  if (action) { clauses.push('action = ?'); params.push(action); }
  const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
  const rows = await db.all(`SELECT id, user_id, action, detail, ip, created_at FROM audit_log ${where} ORDER BY id DESC LIMIT ?`, [...params, lim]);
  return rows;
}

export async function flagFraud(user_id) {
  await emitReputationEvent({ userId: Number(user_id), type: ReputationEventType.FRAUD_FLAG });
  return true;
}

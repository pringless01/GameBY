import express from 'express';

import { initDb } from '../config/database';
import { authRequired, roleRequired } from '../http/routes/auth';
import { emitReputationEvent, ReputationEventType } from '../services/reputationEvents';

const router = express.Router();

// Audit log listesi
router.get('/audit', authRequired, roleRequired('admin'), async (req, res) => {
  const { user_id, action, limit = 50 } = req.query;
  const lim = Math.min(Number(limit) || 50, 200);
  const db = await initDb();
  const clauses = [];
  const params = [];
  if (user_id) { clauses.push('user_id = ?'); params.push(user_id); }
  if (action) { clauses.push('action = ?'); params.push(action); }
  const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
  const rows = await db.all(`SELECT id, user_id, action, detail, ip, created_at FROM audit_log ${where} ORDER BY id DESC LIMIT ?`, [...params, lim]);
  res.json({ logs: rows });
});

// Admin fraud flag endpoint
router.post('/fraud/flag', authRequired, roleRequired('admin'), async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'missing_user_id' });
  try {
    await emitReputationEvent({ userId: Number(user_id), type: ReputationEventType.FRAUD_FLAG });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'flag_failed' });
  }
});

export default router;

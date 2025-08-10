import express from 'express';
import { initDb } from '../config/database.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authRequired, async (req, res) => {
  const db = await initDb();
  const row = await db.get('SELECT id, username, trust_score, reputation, bot_tutorial_state, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!row) return res.status(404).json({ error: 'Kullanıcı yok' });
  return res.json({ user: row });
});

export default router;

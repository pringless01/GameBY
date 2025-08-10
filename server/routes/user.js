import express from 'express';
import { initDb } from '../config/database.js';
import { authRequired } from '../middleware/auth.js';
import { updateTrust, getUserMetrics, findUserByUsername } from '../services/userService.js';

const router = express.Router();

router.get('/me', authRequired, async (req, res) => {
  const db = await initDb();
  const row = await db.get('SELECT id, username, trust_score, reputation, bot_tutorial_state, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!row) return res.status(404).json({ error: 'Kullanıcı yok' });
  return res.json({ user: row });
});

router.post('/trust/update', authRequired, async (req, res) => {
  const { username, delta, reason } = req.body;
  if (!username || typeof delta !== 'number') return res.status(400).json({ error: 'Eksik alan' });
  const user = await findUserByUsername(username);
  if (!user) return res.status(404).json({ error: 'Kullanıcı yok' });
  try {
    const updated = await updateTrust(user.id, delta, reason || 'manual_adjust');
    res.json({ user: updated });
  } catch (e) {
    res.status(500).json({ error: 'Güncelleme başarısız' });
  }
});

router.get('/metrics', async (req, res) => {
  try {
    const m = await getUserMetrics();
    res.json(m);
  } catch (e) {
    res.status(500).json({ error: 'metrics_failed' });
  }
});

export default router;

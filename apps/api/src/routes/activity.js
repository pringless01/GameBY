import express from 'express';

import { initDb } from '../config/database.js';
import { authRequired } from '../middleware/auth.js';
import { logResource } from '../services/auditService.js';
import { getIo } from '../sockets/io.js';

const router = express.Router();

async function updateAndReturn(userId, changes) {
  const db = await initDb();
  const sets = Object.keys(changes).map((k) => `${k} = ${k} + ?`).join(', ');
  const values = Object.values(changes);
  await db.run(`UPDATE users SET ${sets} WHERE id = ?`, [...values, userId]);
  const row = await db.get('SELECT id, username, trust_score, money, wood, grain, business FROM users WHERE id = ?', [userId]);
  const io = getIo();
  if (io) io.emit('resource_updated', { userId: row.id, resources: { money: row.money, wood: row.wood, grain: row.grain, business: row.business } });
  return row;
}

router.post('/chop-wood', authRequired, async (req, res) => {
  try {
    const gained = Math.floor(Math.random() * 3) + 2; // 2-4
    const moneyGain = 1;
    const u = await updateAndReturn(req.user.id, { wood: gained, money: moneyGain });
    logResource(req.user.id, 'resource_chop_wood', { wood: gained, money: moneyGain });
    res.json({ success: true, result: { woodGained: gained, moneyGained: moneyGain, wood: u.wood, money: u.money } });
  } catch (e) { res.status(500).json({ error: 'action_failed' }); }
});

router.post('/farm', authRequired, async (req, res) => {
  try {
    const gained = Math.floor(Math.random() * 4) + 1; // 1-4
    const moneyGain = 2;
    const u = await updateAndReturn(req.user.id, { grain: gained, money: moneyGain });
    logResource(req.user.id, 'resource_farm', { grain: gained, money: moneyGain });
    res.json({ success: true, result: { grainGained: gained, moneyGained: moneyGain, grain: u.grain, money: u.money } });
  } catch (e) { res.status(500).json({ error: 'action_failed' }); }
});

export default router;
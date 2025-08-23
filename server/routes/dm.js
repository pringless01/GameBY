import express from 'express';
import { initDb } from '../config/database.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

// Threads: her karşı kullanıcı için son mesaj + okunmamış sayısı
router.get('/threads', authRequired, async (req, res) => {
  try {
    const db = await initDb();
    const rows = await db.all(`
      SELECT other_id AS user_id,
             u.username,
             MAX(created_at) AS last_message_at,
             SUM(CASE WHEN recipient_id = ? AND read_at IS NULL THEN 1 ELSE 0 END) AS unread
      FROM (
        SELECT CASE WHEN sender_id = ? THEN recipient_id ELSE sender_id END AS other_id,
               sender_id, recipient_id, created_at, read_at
        FROM direct_messages
        WHERE sender_id = ? OR recipient_id = ?
      ) dm
      JOIN users u ON u.id = dm.other_id
      GROUP BY other_id
      ORDER BY last_message_at DESC
      LIMIT 50`, [req.user.id, req.user.id, req.user.id, req.user.id]);
    res.json({ threads: rows });
  } catch(e){ res.status(500).json({ error:'threads_failed' }); }
});

// Thread mesajları
router.get('/messages', authRequired, async (req, res) => {
  try {
    const other = Number(req.query.user_id);
    if(!other) return res.status(400).json({ error:'missing_user_id' });
    const limit = Math.min(100, Math.max(1, Number(req.query.limit)||50));
    const db = await initDb();
    const rows = await db.all(`
      SELECT dm.id, dm.message, dm.created_at, dm.sender_id, dm.recipient_id,
             su.username AS sender_username, ru.username AS recipient_username, dm.read_at
      FROM direct_messages dm
      JOIN users su ON su.id = dm.sender_id
      JOIN users ru ON ru.id = dm.recipient_id
      WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
      ORDER BY dm.id DESC LIMIT ?`, [req.user.id, other, other, req.user.id, limit]);
    rows.reverse();
    const toMark = rows.filter(r=> r.recipient_id === req.user.id && !r.read_at).map(r=>r.id);
    if(toMark.length){
      const ph = toMark.map(()=>'?').join(',');
      await db.run(`UPDATE direct_messages SET read_at=datetime('now') WHERE id IN (${ph})`, toMark);
    }
    res.json({ messages: rows });
  } catch(e){ res.status(500).json({ error:'messages_failed' }); }
});

// REST üzerinden gönderim (opsiyonel; socket fallback)
router.post('/send', authRequired, async (req, res) => {
  try {
    const { to, message } = req.body || {};
    const target = Number(to);
    if(!target || !message) return res.status(400).json({ error:'missing_fields' });
    if(target === req.user.id) return res.status(400).json({ error:'self' });
    const db = await initDb();
    const u = await db.get('SELECT id FROM users WHERE id=?', [target]);
    if(!u) return res.status(404).json({ error:'user_not_found' });
    const sanitized = (''+message).trim().slice(0,1000);
    if(!sanitized) return res.status(400).json({ error:'empty' });
    const ins = await db.run('INSERT INTO direct_messages (sender_id, recipient_id, message) VALUES (?,?,?)', [req.user.id, target, sanitized]);
    const row = await db.get(`SELECT dm.id, dm.message, dm.created_at, dm.sender_id, dm.recipient_id,
                                     su.username AS sender_username, ru.username AS recipient_username
                              FROM direct_messages dm
                              JOIN users su ON su.id = dm.sender_id
                              JOIN users ru ON ru.id = dm.recipient_id
                              WHERE dm.id = ?`, [ins.lastID]);
    res.json({ message: row });
  } catch(e){ res.status(500).json({ error:'send_failed' }); }
});

export default router;

import express from 'express';
import { initDb } from '../config/database.js';
import { authRequired } from '../middleware/auth.js';

// GET /api/chat/recent?limit=50
// Son mesajları (id DESC) çekip istemciye kronolojik (ASC) döner.
const router = express.Router();

router.get('/recent', authRequired, async (req, res) => {
  try {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
    const db = await initDb();
    const rows = await db.all(`SELECT cm.id, cm.message, cm.created_at, u.username
                               FROM chat_messages cm
                               JOIN users u ON u.id = cm.user_id
                               ORDER BY cm.id DESC LIMIT ?`, [limit]);
    // ASC sıraya çevir
    rows.reverse();
    res.json({ messages: rows });
  } catch (e) {
    res.status(500).json({ error: 'chat_recent_failed' });
  }
});

export default router;

import express from 'express';

import { authRequired, roleRequired } from '../middleware/auth.js';
import { AdminService } from '../modules/admin/index.js';

const router = express.Router();

// Audit log listesi
router.get('/audit', authRequired, roleRequired('admin'), async (req, res) => {
  const rows = await AdminService.listAuditLogs(req.query);
  res.json({ logs: rows });
});

// Admin fraud flag endpoint
router.post('/fraud/flag', authRequired, roleRequired('admin'), async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'missing_user_id' });
  try {
    await AdminService.flagFraud(user_id);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'flag_failed' });
  }
});

export default router;

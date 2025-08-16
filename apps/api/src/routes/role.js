import express from 'express';

import { authRequired, roleRequired } from '../http/routes/auth';
import { ensureRole, findUserByUsername } from '../services/userService';

const router = express.Router();

router.post('/add', authRequired, roleRequired('admin'), async (req, res) => {
  const { username, role } = req.body;
  if (!username || !role) return res.status(400).json({ error: 'Eksik alan' });
  const user = await findUserByUsername(username);
  if (!user) return res.status(404).json({ error: 'Kullanıcı yok' });
  const roles = await ensureRole(user.id, role);
  res.json({ user: { id: user.id, username: user.username, roles } });
});

export default router;

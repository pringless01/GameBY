import express from 'express';
import jwt from 'jsonwebtoken';
import { createUser, findUserByUsername, validatePassword } from '../services/userService.js';
import { authRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/register', authRateLimit, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Eksik alan' });
  const existing = await findUserByUsername(username);
  if (existing) return res.status(409).json({ error: 'Kullanıcı adı kullanımda' });
  try {
    const user = await createUser({ username, password });
    return res.json({ user });
  } catch (e) {
    return res.status(500).json({ error: 'Kayıt başarısız' });
  }
});

router.post('/login', authRateLimit, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Eksik alan' });
  const user = await findUserByUsername(username);
  if (!user) return res.status(401).json({ error: 'Geçersiz bilgiler' });
  if (!validatePassword(user, password)) return res.status(401).json({ error: 'Geçersiz bilgiler' });
  const token = jwt.sign({ sub: user.id, username: user.username, roles: user.roles ? JSON.parse(user.roles||'[]'):[] }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '2d' });
  return res.json({ token, user: { id: user.id, username: user.username, trust_score: user.trust_score, roles: user.roles ? JSON.parse(user.roles||'[]'):[] } });
});

export default router;

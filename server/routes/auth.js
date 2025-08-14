import express from 'express';
import jwt from 'jsonwebtoken';
import { createUser, findUserByUsername, validatePassword, recordUserLogin, findUserById } from '../services/userService.js';
import { revokeToken, isTokenRevoked } from '../security/tokenBlacklist.js';
import { getClientIp } from '../utils/ipUtils.js';
import { authRateLimit } from '../middleware/rateLimit.js';
import { logAudit } from '../services/auditService.js';

const accessTtl = process.env.ACCESS_TOKEN_TTL || '15m';
const refreshTtl = process.env.REFRESH_TOKEN_TTL || '7d';

const router = express.Router();

router.post('/register', authRateLimit, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Eksik alan' });
  const existing = await findUserByUsername(username);
  if (existing) return res.status(409).json({ error: 'Kullanıcı adı kullanımda' });
  try {
    const user = await createUser({ username, password });
    logAudit({ userId: user.id, action: 'register', detail: JSON.stringify({ username }), ip: req.ip });
    return res.json({ user });
  } catch (e) {
    logAudit({ action: 'register_failed', detail: JSON.stringify({ username }), ip: req.ip });
    return res.status(500).json({ error: 'Kayıt başarısız' });
  }
});

router.post('/login', authRateLimit, async (req, res) => {
  const { username, password, deviceFingerprint } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Eksik alan' });
  const user = await findUserByUsername(username);
  if (!user) { logAudit({ action: 'login_failed', detail: JSON.stringify({ username, reason: 'no_user' }), ip: req.ip }); return res.status(401).json({ error: 'Geçersiz bilgiler' }); }
  if (!validatePassword(user, password)) { logAudit({ userId: user.id, action: 'login_failed', detail: JSON.stringify({ username, reason:'bad_password' }), ip: req.ip }); return res.status(401).json({ error: 'Geçersiz bilgiler' }); }
  const accessToken = jwt.sign({ sub: user.id, username: user.username, roles: user.roles ? JSON.parse(user.roles||'[]'):[] }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: accessTtl });
  const refreshToken = jwt.sign({ sub: user.id, type:'refresh' }, process.env.REFRESH_SECRET || process.env.JWT_SECRET || 'dev-secret', { expiresIn: refreshTtl });
  const clientIp = getClientIp(req);
  logAudit({ userId: user.id, action: 'login_success', detail: JSON.stringify({ username }), ip: clientIp });
  // Fraud/multi-account gözlemi için login event kaydı
  try {
    await recordUserLogin(user.id, clientIp, req.headers['user-agent'] || '', deviceFingerprint);
  } catch(e) { console.warn('recordUserLogin error', e); }
  res.cookie('refreshToken', refreshToken, { httpOnly:true, sameSite:'strict', secure: process.env.NODE_ENV==='production', maxAge:7*24*60*60*1000 });
  return res.json({ token: accessToken, user: { id: user.id, username: user.username, trust_score: user.trust_score, roles: user.roles ? JSON.parse(user.roles||'[]'):[] } });
});

function getCookie(req, name){
  const cookies = req.headers.cookie;
  if(!cookies) return null;
  const found = cookies.split(';').map(c=>c.trim()).find(c=>c.startsWith(name+'='));
  return found ? decodeURIComponent(found.split('=')[1]) : null;
}

router.post('/refresh', async (req, res) => {
  const token = getCookie(req, 'refreshToken');
  if(!token) return res.status(401).json({ error:'Refresh yok' });
  if(await isTokenRevoked(token)) return res.status(401).json({ error:'Token geçersiz' });
  try {
    const payload = jwt.verify(token, process.env.REFRESH_SECRET || process.env.JWT_SECRET || 'dev-secret');
    if(payload.type !== 'refresh') return res.status(401).json({ error:'Token tip yanlış' });
    await revokeToken(token, Math.max(0, payload.exp*1000 - Date.now()));
    const user = await findUserById(payload.sub);
    if(!user) return res.status(401).json({ error:'Kullanıcı yok' });
    const roles = user.roles ? JSON.parse(user.roles||'[]'):[];
    const accessToken = jwt.sign({ sub:user.id, username:user.username, roles }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: accessTtl });
    const refreshToken = jwt.sign({ sub:user.id, type:'refresh' }, process.env.REFRESH_SECRET || process.env.JWT_SECRET || 'dev-secret', { expiresIn: refreshTtl });
    res.cookie('refreshToken', refreshToken, { httpOnly:true, sameSite:'strict', secure: process.env.NODE_ENV==='production', maxAge:7*24*60*60*1000 });
    return res.json({ token: accessToken });
  } catch(e){
    return res.status(401).json({ error:'Token geçersiz' });
  }
});

export default router;

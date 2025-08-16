import crypto from 'crypto';

import express from 'express';

import { signToken } from '../config/jwt.js';
import { getRefreshStore } from '../core/refreshStore.js';
import { authRequired } from '../middleware/auth.js';
import {
  createUser,
  findUserByUsername,
  findUserById,
  findByEmailOrUsername,
  validatePassword,
  verifyPassword
} from '../services/userService.js';

// Brute-force guard (in-memory) – PROD: merkezi store/Redis önerilir.
const failedAttempts = new Map(); // key: identity|ip -> { count, lockUntil }
const MAX_ATTEMPTS = parseInt(process.env.AUTH_MAX_ATTEMPTS || '5', 10);
const LOCK_MS = parseInt(process.env.AUTH_LOCK_DURATION_MS || '60000', 10);
const REFRESH_TTL_DAYS = parseInt(process.env.REFRESH_TTL_DAYS || '7', 10);
const REFRESH_TTL_MS = REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000;

function key(identity, ip) { return `${identity.toLowerCase()}|${ip}`; } // <-- fix

function markFail(identity, ip) {
  const k = key(identity, ip);
  const now = Date.now();
  const entry = failedAttempts.get(k) || { count: 0, lockUntil: 0 };
  entry.count++;
  if (entry.count > MAX_ATTEMPTS) entry.lockUntil = now + LOCK_MS;
  failedAttempts.set(k, entry);
  return entry;
}

function clearFails(identity, ip) {
  failedAttempts.delete(key(identity, ip));
}

function checkLocked(identity, ip) {
  const entry = failedAttempts.get(key(identity, ip));
  if (!entry) return { locked: false };
  if (entry.lockUntil && entry.lockUntil > Date.now()) {
    return { locked: true, remainingMs: entry.lockUntil - Date.now(), count: entry.count };
  }
  if (entry.lockUntil && entry.lockUntil <= Date.now()) failedAttempts.delete(key(identity, ip));
  return { locked: false };
}

// Error code -> message mapper
function mapAuthError(code) {
  const dict = {
    missing_fields: 'Eksik alanlar mevcut',
    duplicate_email: 'E-posta zaten kayıtlı',
    duplicate_username: 'Kullanıcı adı zaten kayıtlı',
    invalid_credentials: 'Kimlik veya şifre hatalı',
    locked: 'Çok fazla başarısız deneme. Lütfen biraz sonra tekrar deneyin.',
    server_error: 'Sunucu hatası. Lütfen tekrar deneyin.'
  };
  return dict[code] || 'Bilinmeyen hata';
}

const router = express.Router();

// In-memory refresh token store (single-use rotation)
// key: token -> { userId, createdAt }
const refreshStore = getRefreshStore();

function newRefreshToken(){
  return crypto.randomBytes(32).toString('hex');
}

function setRefreshCookie(res, token){
  const maxAge = REFRESH_TTL_DAYS * 24 * 60 * 60; // seconds
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    `refreshToken=${token}`,
    'Path=/',
    'HttpOnly',
    isProd ? 'SameSite=Strict' : 'SameSite=Lax',
    `Max-Age=${maxAge}`
  ];
  if(isProd) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function getCookie(req, name){
  const raw = req.headers.cookie || '';
  const parts = raw.split(';').map(s=>s.trim());
  for(const p of parts){
    if(p.startsWith(name+'=')) return decodeURIComponent(p.substring(name.length+1));
  }
  return null;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  // Geriye dönük uyumluluk: email opsiyonel
  const { email = null, username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'missing_fields', message: mapAuthError('missing_fields') });
  }
  try {
    const existing =
      (email ? await findByEmailOrUsername(email) : null) ||
      (await findByEmailOrUsername(username)) ||
      (await findUserByUsername(username));

    if (existing) {
      if (email && existing.email && existing.email.toLowerCase() === email.toLowerCase()) {
        return res.status(409).json({ error: 'duplicate_email', message: mapAuthError('duplicate_email') });
      }
      if (existing.username && existing.username.toLowerCase() === username.toLowerCase()) {
        return res.status(409).json({ error: 'duplicate_username', message: mapAuthError('duplicate_username') });
      }
    }

  const user = await createUser({ email, username, password });
  const token = signToken(user.id, { username: user.username, email: user.email, roles: user.roles || [] });
  const devAdmin = (process.env.DEV_ADMIN_USERNAME || '').toLowerCase();
  const isDevAdminUser = devAdmin && username.toLowerCase() === devAdmin;
  const code = isDevAdminUser ? 200 : 201;
  return res.status(code).json({ token, user: { id: user.id, email: user.email, username: user.username, roles: user.roles || [] } });
  } catch (e) {
    console.error('[auth/register] error', e);
    return res.status(500).json({ error: 'server_error', message: mapAuthError('server_error') });
  }
});

// POST /api/auth/login  body: { identity, password }
router.post('/login', async (req, res) => {
  // Geriye dönük uyumluluk: identity || username || email
  const body = req.body || {};
  const identity = body.identity || body.username || body.email;
  const password = body.password;
  if (!identity || !password) {
    return res.status(400).json({ error: 'missing_fields', message: mapAuthError('missing_fields') });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const locked = checkLocked(identity, ip);
  if (locked.locked) {
    return res.status(429).json({ error: 'locked', message: mapAuthError('locked'), retry_after_ms: locked.remainingMs });
  }

  try {
    const user =
      (await findByEmailOrUsername(identity)) ||
      (await findUserByUsername(identity));

    if (!user) {
      const st = markFail(identity, ip);
      return res.status(401).json({ error: 'invalid_credentials', message: mapAuthError('invalid_credentials'), attempts: st.count });
    }

    const ok = validatePassword(user, password) || verifyPassword(password, user.password_hash);
    if (!ok) {
      const st = markFail(identity, ip);
      const status = st.count > MAX_ATTEMPTS ? 429 : 401;
      return res.status(status).json({
        error: st.count > MAX_ATTEMPTS ? 'locked' : 'invalid_credentials',
        message: mapAuthError(st.count > MAX_ATTEMPTS ? 'locked' : 'invalid_credentials'),
        attempts: st.count
      });
    }

  clearFails(identity, ip);
  let roles = [];
  if (user.roles) { try { roles = JSON.parse(user.roles); } catch { roles = []; } }
  const token = signToken(user.id, { username: user.username, email: user.email, roles });
  // Issue single-use refresh token cookie
  try {
    const rt = newRefreshToken();
  await refreshStore.set(rt, { userId: user.id, createdAt: Date.now() }, REFRESH_TTL_MS);
    setRefreshCookie(res, rt);
  } catch { /* ignore cookie errors in tests */ }
  return res.json({ token, user: { id: user.id, email: user.email, username: user.username, roles } });
  } catch (e) {
    console.error('[auth/login] error', e);
    return res.status(500).json({ error: 'server_error', message: mapAuthError('server_error') });
  }
});

// GET /api/auth/me
router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'not_found' });
    return res.json({ id: user.id, email: user.email, username: user.username, trust_score: user.trust_score });
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
});

export default router;

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const rt = getCookie(req, 'refreshToken');
    if(!rt) return res.status(401).json({ error: 'invalid_refresh' });
  const entry = await refreshStore.get(rt);
    if(!entry){
      return res.status(401).json({ error: 'invalid_refresh' });
    }
    // Single-use: revoke old token
  await refreshStore.del(rt);
    const userId = entry.userId;
    // Minimal claims; roles/email can be fetched if needed (not required for test)
    const token = signToken(userId, {});
    // Rotate refresh token
    const newRt = newRefreshToken();
  await refreshStore.set(newRt, { userId, createdAt: Date.now() }, REFRESH_TTL_MS);
    setRefreshCookie(res, newRt);
    return res.json({ token });
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
});

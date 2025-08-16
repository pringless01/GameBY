import express from 'express';

import { signToken } from '../config/jwt.js';
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

// In-memory refresh token store (unit test scope). PROD: persistent store/Redis önerilir.
const refreshStore = new Map(); // token -> { userId, revoked: boolean }
const REFRESH_TTL_SECONDS = parseInt(process.env.REFRESH_TTL_SECONDS || '604800', 10); // 7 gün

function generateRefreshToken() {
  // Basit rastgele token; PROD: ek imza/rotasyon eklenebilir.
  return (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(0, 48);
}

function setRefreshCookie(res, token) {
  const parts = [
    `refreshToken=${token}`,
    'HttpOnly',
    'Path=/api/auth',
    'SameSite=Lax',
    `Max-Age=${REFRESH_TTL_SECONDS}`
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function parseRefreshCookie(req) {
  const raw = req.headers['cookie'] || req.headers['Cookie'];
  if (!raw) return null;
  const seg = raw.split(';').map(s => s.trim()).find(s => s.startsWith('refreshToken='));
  return seg ? seg.substring('refreshToken='.length) : null;
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
  const isDevAdmin = process.env.DEV_ADMIN_USERNAME && process.env.DEV_ADMIN_USERNAME === username;
  const code = isDevAdmin ? 200 : 201;
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
  const rt = generateRefreshToken();
  refreshStore.set(rt, { userId: user.id, revoked: false });
  setRefreshCookie(res, rt);
  const token = signToken(user.id, { username: user.username, email: user.email, roles });
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
    const rt = parseRefreshCookie(req);
    if (!rt) return res.status(401).json({ error: 'no_refresh' });
    const meta = refreshStore.get(rt);
    if (!meta || meta.revoked) return res.status(401).json({ error: 'revoked' });
    // Rotate
    meta.revoked = true; // eskiyi iptal et
    refreshStore.set(rt, meta);
    const newRt = generateRefreshToken();
    refreshStore.set(newRt, { userId: meta.userId, revoked: false });
    setRefreshCookie(res, newRt);
    const token = signToken(meta.userId, {});
    return res.json({ token });
  } catch (e) {
    return res.status(500).json({ error: 'refresh_failed' });
  }
});

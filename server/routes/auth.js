import express from 'express';
import { signToken, verifyToken } from '../config/jwt.js';
import { authRequired } from '../middleware/auth.js';
import { revokeToken } from '../security/tokenBlacklist.js';
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

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, username, password, display_name } = req.body || {};
  if (!email || !username || !password) {
    return res.status(400).json({ error: 'missing_fields', message: mapAuthError('missing_fields') });
  }
  try {
    // Normalize to lower for comparison
    const lowerEmail = email.toLowerCase();
    const lowerUser = username.toLowerCase();
    const existing = await findByEmailOrUsername(lowerEmail) || await findByEmailOrUsername(lowerUser) || await findUserByUsername(lowerUser);
    if (existing) {
      if (existing.email && existing.email.toLowerCase() === lowerEmail) {
        return res.status(409).json({ error: 'duplicate_email', message: mapAuthError('duplicate_email') });
      }
      if (existing.username && existing.username.toLowerCase() === lowerUser) {
        return res.status(409).json({ error: 'duplicate_username', message: mapAuthError('duplicate_username') });
      }
    }

  let user;
  try {
    user = await createUser({ email, username, password, display_name });
  } catch (e) {
    if (e && /UNIQUE/i.test(String(e.message))) {
      // Race condition fallback
      const again = await findByEmailOrUsername(email) || await findUserByUsername(username);
      if (again?.email?.toLowerCase() === email.toLowerCase()) {
        return res.status(409).json({ error: 'duplicate_email', message: mapAuthError('duplicate_email') });
      }
      if (again?.username?.toLowerCase() === username.toLowerCase()) {
        return res.status(409).json({ error: 'duplicate_username', message: mapAuthError('duplicate_username') });
      }
    }
    throw e;
  }
  const token = signToken(user.id, { username: user.username, email: user.email, roles: user.roles || [] });
    return res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username, display_name: user.display_name || display_name || username } });
  } catch (e) {
    console.error('[auth/register] error', e);
    return res.status(500).json({ error: 'server_error', message: mapAuthError('server_error') });
  }
});

// POST /api/auth/login  body: { identity, password }
router.post('/login', async (req, res) => {
  const { identity, password } = req.body || {};
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
  try { roles = user.roles ? JSON.parse(user.roles) : []; } catch { roles = []; }
  const token = signToken(user.id, { username: user.username, email: user.email, roles });
    return res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
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
    let roles = [];
    try { roles = user.roles ? JSON.parse(user.roles) : []; } catch { roles = []; }
    return res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      display_name: user.display_name || null,
      trust_score: user.trust_score,
      roles
    });
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
});

// POST /api/auth/logout
// Authorization: Bearer <token>
// JWT stateless olduğu için logout = token'ı kalan ömrü boyunca revoke listesine eklemek.
router.post('/logout', authRequired, async (req, res) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if(!token){
    // authRequired normalde engeller ama savunma amaçlı
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    let ttlMs = 0;
    try {
      const decoded = verifyToken(token); // middleware zaten doğruladı; tekrar decode için kullanıyoruz
      if (decoded?.exp) {
        const expiresAt = decoded.exp * 1000;
        ttlMs = Math.max(0, expiresAt - Date.now());
      }
    } catch { /* ignore decode issues */ }
    // Eğer exp yoksa (örn. süresiz token) yine revoke ederiz ama TTL belirtmeyiz -> bellek/redis kalıcı.
    await revokeToken(token, ttlMs || undefined);
    return res.json({ success: true, revoked_ms: ttlMs || null });
  } catch (e) {
    console.error('[auth/logout] error', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

export default router;

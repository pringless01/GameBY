import express from 'express';
import rateLimit from 'express-rate-limit';
import { signAdminToken, verifyAdminToken } from '../config/adminJwt.js';
import { createInitialAdmin, findAdminByUsername, verifyAdminPassword, recordAdminLogin, findAdminById, updateAdminPassword, listAdmins } from '../services/adminUserService.js';
import { initDb } from '../config/database.js';

const router = express.Router();

// Basit brute force koruması
const limiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 50 });
router.use(limiter);

// Bootstrap ensure
router.post('/bootstrap', async (_req, res) => {
  try { const created = await createInitialAdmin(); res.json({ created }); } catch { res.status(500).json({ error: 'bootstrap_failed' }); }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if(!username || !password){
    console.warn('[root-admin][login] missing fields from', req.ip);
    return res.status(400).json({ error: 'missing_fields' });
  }
  const admin = await findAdminByUsername(username);
  if(!admin){
    console.warn('[root-admin][login] invalid user', username, req.ip);
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  let ok = false;
  try {
    if(admin.password_hash){
      ok = await verifyAdminPassword(admin, password);
    }
  } catch (e){
    console.error('[root-admin][login] bcrypt error', e.message);
  }
  if(!ok){
    console.warn('[root-admin][login] bad password for', username, 'from', req.ip);
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  await recordAdminLogin(admin.id, req.ip);
  const roles = JSON.parse(admin.roles || '[]');
  const token = signAdminToken(admin.id, roles);
  console.log('[root-admin][login] success', username, 'roles=', roles.join(','));
  res.json({ token, force_reset: !!admin.force_reset, roles });
});

function adminAuth(req, res, next){
  const auth = req.headers.authorization;
  if(!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' });
  try {
    const payload = verifyAdminToken(auth.slice(7));
    req.admin = payload;
    next();
  } catch { return res.status(401).json({ error: 'unauthorized' }); }
}

function requireRole(role){
  return (req, res, next) => {
    if(!req.admin || !Array.isArray(req.admin.roles) || !req.admin.roles.includes(role)) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

router.get('/me', adminAuth, async (req, res) => {
  const admin = await findAdminById(req.admin.aid);
  if(!admin) return res.status(404).json({ error: 'not_found' });
  res.json({ id: admin.id, username: admin.username, roles: JSON.parse(admin.roles||'[]'), force_reset: !!admin.force_reset, last_login_at: admin.last_login_at });
});

router.post('/password', adminAuth, async (req, res) => {
  const { new_password } = req.body || {};
  if(!new_password || new_password.length < 6) return res.status(400).json({ error: 'weak_password' });
  await updateAdminPassword(req.admin.aid, new_password);
  res.json({ changed: true });
});

router.get('/admins', adminAuth, requireRole('super_admin'), async (_req, res) => {
  const admins = await listAdmins();
  res.json({ admins });
});

// Örnek: basit kullanıcı sayısı (oyun veri tabanından)
router.get('/stats/basic', adminAuth, async (_req, res) => {
  const db = await initDb();
  const u = await db.get('SELECT COUNT(*) as users FROM users');
  const c = await db.get('SELECT COUNT(*) as chats FROM chat_messages');
  res.json({ users: u.users, chat_messages: c.chats });
});

export default router;

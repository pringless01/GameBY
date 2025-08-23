import express from 'express';
import rateLimit from 'express-rate-limit';
import { signAdminCoreToken, verifyAdminCoreToken } from '../config/adminCoreJwt.js';
import {
  ensureInitialSuperAdmin,
  findByUsername,
  findById,
  verifyPassword,
  incrementFail,
  resetFails,
  recordLogin,
  changePassword,
  resetPassword,
  updateRoles,
  setLock,
  listAdmins,
  listAudit,
  createAdmin,
  stats,
  blacklistJti,
  isJtiBlacklisted,
  audit
} from '../services/adminAccountService.js';
import { initDb } from '../config/database.js';

const router = express.Router();

// Rate limit login
router.use('/login', rateLimit({ windowMs: 5*60*1000, max: 10 }));

// Bootstrap
router.post('/bootstrap', async (_req, res) => {
  try { const created = await ensureInitialSuperAdmin(); res.json({ created }); } catch(e){ res.status(500).json({ error:'bootstrap_failed' }); }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if(!username || !password) return res.status(400).json({ error:'missing_fields' });
  const acc = await findByUsername(username);
  if(!acc){ return res.status(401).json({ error:'invalid_credentials' }); }
  if(acc.is_locked){ return res.status(423).json({ error:'locked' }); }
  const ok = await verifyPassword(acc, password);
  if(!ok){ await incrementFail(acc); return res.status(401).json({ error:'invalid_credentials' }); }
  await resetFails(acc.id);
  await recordLogin(acc.id, req.ip);
  const roles = JSON.parse(acc.roles || '[]');
  const { token, jti, exp } = signAdminCoreToken(acc.id, roles);
  res.json({ token, force_reset: !!acc.force_reset, roles, exp });
});

function auth(req, res, next){
  const h = req.headers.authorization || '';
  if(!h.startsWith('Bearer ')) return res.status(401).json({ error:'unauthorized' });
  try {
    const payload = verifyAdminCoreToken(h.slice(7));
    req.admin = payload;
    isJtiBlacklisted(payload.jti).then(black => {
      if(black) return res.status(401).json({ error:'revoked' });
      next();
    }).catch(()=> res.status(401).json({ error:'unauthorized' }));
  } catch { return res.status(401).json({ error:'unauthorized' }); }
}

function requireRoles(need){
  return (req, res, next) => {
    if(!req.admin || !Array.isArray(req.admin.roles)) return res.status(401).json({ error:'unauthorized' });
    if(!need.some(r => req.admin.roles.includes(r))) return res.status(403).json({ error:'forbidden' });
    next();
  };
}

router.post('/logout', auth, async (req, res) => {
  try {
    const exp = req.admin.exp ? req.admin.exp * 1000 : Date.now() + 30*60*1000;
    await blacklistJti(req.admin.jti, exp);
    res.json({ ok:true });
  } catch { res.status(500).json({ error:'logout_failed' }); }
});

router.get('/me', auth, async (req, res) => {
  const acc = await findById(req.admin.aid);
  if(!acc) return res.status(404).json({ error:'not_found' });
  res.json({ id: acc.id, username: acc.username, roles: JSON.parse(acc.roles||'[]'), force_reset: !!acc.force_reset, is_locked: !!acc.is_locked, failed_attempts: acc.failed_attempts, last_login_at: acc.last_login_at });
});

router.post('/password', auth, async (req, res) => {
  const { new_password } = req.body || {};
  if(!new_password || new_password.length < 8) return res.status(400).json({ error:'weak_password' });
  await changePassword(req.admin.aid, new_password);
  res.json({ changed:true });
});

// Admin CRUD (super_admin)
router.post('/admins', auth, requireRoles(['super_admin']), async (req, res) => {
  const { username, password, roles } = req.body || {};
  if(!username || !password) return res.status(400).json({ error:'missing_fields' });
  if(password.length < 8) return res.status(400).json({ error:'weak_password' });
  try {
    const acc = await createAdmin(username, password, roles && roles.length ? roles : ['read_only']);
    res.json({ id: acc.id, username: acc.username });
  } catch(e){ res.status(500).json({ error:'create_failed' }); }
});

router.get('/admins', auth, requireRoles(['super_admin','security_admin']), async (_req, res) => {
  const list = await listAdmins();
  res.json({ admins: list });
});

router.patch('/admins/:id/roles', auth, requireRoles(['super_admin']), async (req, res) => {
  const roles = req.body.roles;
  if(!Array.isArray(roles) || !roles.length) return res.status(400).json({ error:'invalid_roles' });
  await updateRoles(req.params.id, roles, req.admin.aid);
  res.json({ updated:true });
});

router.patch('/admins/:id/lock', auth, requireRoles(['super_admin','security_admin']), async (req, res) => {
  await setLock(req.params.id, true, req.admin.aid);
  res.json({ locked:true });
});

router.patch('/admins/:id/unlock', auth, requireRoles(['super_admin','security_admin']), async (req, res) => {
  await setLock(req.params.id, false, req.admin.aid);
  res.json({ locked:false });
});

router.post('/admins/:id/reset-password', auth, requireRoles(['super_admin','security_admin']), async (req, res) => {
  const { new_password } = req.body || {};
  if(!new_password || new_password.length < 8) return res.status(400).json({ error:'weak_password' });
  await resetPassword(req.params.id, new_password, req.admin.aid);
  res.json({ reset:true });
});

router.get('/audit', auth, requireRoles(['super_admin','security_admin']), async (req, res) => {
  const { limit, action, admin_id } = req.query;
  const l = Math.min(Number(limit)||100, 500);
  const rows = await listAudit({ limit:l, action, admin_id });
  res.json({ audits: rows });
});

router.get('/stats', auth, requireRoles(['super_admin','ops_admin','security_admin','read_only']), async (_req, res) => {
  const s = await stats();
  res.json(s);
});

// --- Yeni: Kullanıcı listesi (fraud sütunu varsa dahil) ---
router.get('/users', auth, requireRoles(['super_admin','security_admin','read_only']), async (req, res) => {
  try {
    const db = await initDb();
    const limit = Math.min(Number(req.query.limit)||50, 200);
    const offset = Math.max(Number(req.query.offset)||0, 0);
    const search = (req.query.search||'').toString().trim();
    const fraud = await hasFraudColumn(db);
    const cols = 'id, username, email, created_at' + (fraud ? ', is_fraud' : '');
    let rows;
    if(search){
      rows = await db.all(`SELECT ${cols} FROM users WHERE lower(username) LIKE lower(?) OR lower(coalesce(email,'')) LIKE lower(?) ORDER BY id DESC LIMIT ? OFFSET ?`, [`%${search}%`,`%${search}%`,limit,offset]);
    } else {
      rows = await db.all(`SELECT ${cols} FROM users ORDER BY id DESC LIMIT ? OFFSET ?`, [limit, offset]);
    }
    res.json({ users: rows, limit, offset, search });
  } catch(e){
    console.error('[admin-core/users]', e);
    res.status(500).json({ error:'server_error' });
  }
});

// --- Yeni: Fraud flag ---
router.post('/users/:id/flag-fraud', auth, requireRoles(['super_admin','security_admin']), async (req, res) => {
  try {
    const db = await initDb();
    if(!await hasFraudColumn(db)) return res.status(400).json({ error:'fraud_flag_not_supported' });
    const id = Number(req.params.id);
    if(!id) return res.status(400).json({ error:'invalid_id' });
    await db.run('UPDATE users SET is_fraud=1 WHERE id=?', [id]);
    await audit(req.admin.aid, 'flag_fraud', `target=${id}`);
    res.json({ flagged:true });
  } catch(e){
    console.error('[admin-core/flag-fraud]', e);
    res.status(500).json({ error:'server_error' });
  }
});

async function hasFraudColumn(db){
  try { const rows = await db.all("PRAGMA table_info(users)"); return rows.some(c=>c.name==='is_fraud'); } catch { return false; }
}

export default router;

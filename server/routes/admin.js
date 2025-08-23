import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { adminRequired } from '../middleware/admin.js';
import { initDb } from '../config/database.js';
import os from 'os';
import { getAppLogs } from '../services/appLogBuffer.js';
import { logAudit } from '../services/auditService.js';
import { updateTrust, addRole } from '../services/userService.js';

const router = express.Router();

// GET /api/admin/metrics
router.get('/metrics', authRequired, adminRequired, async (req, res) => {
  try {
    const db = await initDb();
    const users = await db.get(`SELECT COUNT(*) as count FROM users`);
    const chats = await db.get(`SELECT COUNT(*) as count FROM chat_messages`);
    const avgTrust = await db.get(`SELECT AVG(trust_score) as avg_trust FROM users`);
    const recentChats = await db.all(`SELECT c.id, c.message, c.created_at, u.username FROM chat_messages c JOIN users u ON u.id = c.user_id ORDER BY c.id DESC LIMIT 20`);
    return res.json({
      users: users.count,
      chat_messages: chats.count,
      avg_trust: avgTrust.avg_trust,
      recent_chats: recentChats
    });
  } catch (e) {
    console.error('[admin/metrics]', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// GET /api/admin/system -> süreç ve kaynak snapshot
router.get('/system', authRequired, adminRequired, async (req, res) => {
  try {
    const mem = process.memoryUsage();
    const load = os.loadavg();
    const uptime = process.uptime();
    res.json({
      pid: process.pid,
      node: process.version,
      platform: process.platform,
      uptime_sec: Math.round(uptime),
      memory: {
        rss_mb: Math.round(mem.rss/1024/1024),
        heap_used_mb: Math.round(mem.heapUsed/1024/1024)
      },
      loadavg: load,
      cpu_count: os.cpus()?.length || 0,
      env: { NODE_ENV: process.env.NODE_ENV }
    });
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
});

// GET /api/admin/logs/app?limit=200
router.get('/logs/app', authRequired, adminRequired, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '200', 10), 1000);
  res.json({ logs: getAppLogs(limit) });
});

// GET /api/admin/logs/audit?limit=100&action=&user_id=
router.get('/logs/audit', authRequired, adminRequired, async (req, res) => {
  try {
    const db = await initDb();
    const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);
    const { action, user_id } = req.query;
    const clauses = [];
    const params = [];
    if(action){ clauses.push('action = ?'); params.push(action); }
    if(user_id){ clauses.push('user_id = ?'); params.push(user_id); }
    const where = clauses.length ? 'WHERE '+clauses.join(' AND ') : '';
    const rows = await db.all(`SELECT id, user_id, action, detail, ip, created_at FROM audit_log ${where} ORDER BY id DESC LIMIT ?`, [...params, limit]);
    res.json({ audits: rows });
  } catch (e) {
    res.status(500).json({ error: 'server_error' });
  }
});

// POST /api/admin/trust-adjust { user_id, delta, reason }
router.post('/trust-adjust', authRequired, adminRequired, async (req, res) => {
  const { user_id, delta, reason } = req.body || {};
  if(!user_id || !delta) return res.status(400).json({ error: 'missing_fields' });
  try {
    const updated = await updateTrust(user_id, Number(delta), reason || 'admin_adjust', req.ip);
    logAudit({ userId: req.user.id, action: 'admin_trust_adjust', detail: JSON.stringify({ target: user_id, delta, reason }) });
    res.json({ updated });
  } catch (e) {
    res.status(500).json({ error: 'server_error' });
  }
});

// POST /api/admin/add-role { user_id, role }
router.post('/add-role', authRequired, adminRequired, async (req, res) => {
  const { user_id, role } = req.body || {};
  if(!user_id || !role) return res.status(400).json({ error: 'missing_fields' });
  try {
    const roles = await addRole(user_id, role);
    logAudit({ userId: req.user.id, action: 'admin_add_role', detail: JSON.stringify({ target: user_id, role }) });
    res.json({ roles });
  } catch (e) {
    res.status(500).json({ error: 'server_error' });
  }
});

// GET /api/admin/users?limit=50&offset=0&search=term
router.get('/users', authRequired, adminRequired, async (req, res) => {
  try {
    const db = await initDb();
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const offset = parseInt(req.query.offset || '0', 10);
    const search = (req.query.search || '').toString().trim();
    let rows;
    if (search) {
      rows = await db.all(`SELECT id, username, email, display_name, trust_score, reputation, created_at, roles FROM users 
        WHERE lower(username) LIKE lower(?) OR lower(coalesce(email,'')) LIKE lower(?)
        ORDER BY id DESC LIMIT ? OFFSET ?`, [`%${search}%`, `%${search}%`, limit, offset]);
    } else {
      rows = await db.all(`SELECT id, username, email, display_name, trust_score, reputation, created_at, roles FROM users ORDER BY id DESC LIMIT ? OFFSET ?`, [limit, offset]);
    }
    const users = rows.map(r => ({ ...r, roles: safeParse(r.roles) }));
    return res.json({ users, limit, offset, search });
  } catch (e) {
    console.error('[admin/users]', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// GET /api/admin/logs/chat?limit=100&after_id=123
router.get('/logs/chat', authRequired, adminRequired, async (req, res) => {
  try {
    const db = await initDb();
    const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);
    const afterId = parseInt(req.query.after_id || '0', 10);
    const rows = await db.all(`SELECT c.id, c.message, c.created_at, u.username FROM chat_messages c JOIN users u ON u.id = c.user_id
      WHERE c.id > ? ORDER BY c.id ASC LIMIT ?`, [afterId, limit]);
    return res.json({ messages: rows, limit, after_id: afterId });
  } catch (e) {
    console.error('[admin/logs/chat]', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

function safeParse(json){
  try { return json ? JSON.parse(json) : []; } catch { return []; }
}

export default router;

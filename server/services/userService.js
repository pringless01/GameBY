import { initDb } from '../config/database.js';
import bcrypt from 'bcrypt';
import { getIo } from '../sockets/io.js';
import { logAudit } from '../services/auditService.js';
import { invalidateOnTrustChange } from '../cache/trustCaches.js';
import { incReputationEvent } from '../metrics/reputationMetrics.js';

// Opsiyonel: login event kaydı (tablo yoksa migration eklemek gerekir)
export async function recordUserLogin(userId, ip, userAgent, deviceFingerprint = null) {
  const db = await initDb();
  await db.run(
    `INSERT INTO user_login_events (user_id, ip, user_agent, device_fingerprint, ts)
     VALUES (?, ?, ?, ?, strftime('%s','now'))`,
    [userId, ip, userAgent, deviceFingerprint]
  );
}

export async function createUser({ email, username, password, display_name }) {
  const db = await initDb();
  const hash = bcrypt.hashSync(password, 10);

  let rolesJson = null;
  if (process.env.NODE_ENV !== 'production') {
    const devAdmin = process.env.DEV_ADMIN_USERNAME || 'admin';
    if (username === devAdmin) rolesJson = JSON.stringify(['admin']);
  }

  const cols = ['username', 'password_hash'];
  const vals = [username, hash];
  if (email) { cols.push('email'); vals.push(email); }
  if (display_name) { cols.push('display_name'); vals.push(display_name); }
  if (rolesJson) { cols.push('roles'); vals.push(rolesJson); }

  const placeholders = cols.map(() => '?').join(',');
  const sql = `INSERT INTO users (${cols.join(',')}) VALUES (${placeholders})`;
  const result = await db.run(sql, vals);

  await db.run(
    `UPDATE users
       SET money = COALESCE(money,0) + 5000,
           wood  = COALESCE(wood,0) + 5,
           grain = COALESCE(grain,0) + 5
     WHERE id = ?`,
    [result.lastID]
  );

  return { id: result.lastID, username, email: email || null, display_name: display_name || null, roles: rolesJson ? JSON.parse(rolesJson) : [] };
}

export async function findUserByUsername(username) {
  const db = await initDb();
  return db.get(`SELECT * FROM users WHERE username = ?`, [username]);
}

export async function findByEmailOrUsername(identity) {
  const db = await initDb();
  return db.get(
    `SELECT * FROM users
     WHERE lower(coalesce(email,'')) = lower(?)
        OR lower(username) = lower(?)`,
    [identity, identity]
  );
}

export async function findUserById(id) {
  const db = await initDb();
  return db.get(`SELECT * FROM users WHERE id = ?`, [id]);
}

export function validatePassword(user, password) {
  return bcrypt.compareSync(password, user.password_hash);
}

export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export async function updateTrust(userId, delta, reason = 'manual_adjust', ip = null) {
  const db = await initDb();
  await db.run(
    `UPDATE users SET trust_score = MAX(0, MIN(200, trust_score + ?)) WHERE id = ?`,
    [delta, userId]
  );
  await db.run(
    `INSERT INTO reputation_events (user_id, delta, reason) VALUES (?, ?, ?)`,
    [userId, delta, reason]
  );

  try { incReputationEvent(reason); } catch {}
  logAudit({ userId, action: 'trust_update', detail: JSON.stringify({ delta, reason }), ip });

  const updated = await db.get(`SELECT id, username, trust_score FROM users WHERE id = ?`, [userId]);

  try { invalidateOnTrustChange(String(userId)); } catch {}
  const io = getIo();
  if (io) io.emit('trust_updated', updated);
  return updated;
}

export async function getUserMetrics() {
  const db = await initDb();
  const totals = await db.get(`SELECT COUNT(*) as users, AVG(trust_score) as avg_trust FROM users`);
  return { users: totals.users, avg_trust: totals.avg_trust };
}

export async function addRole(userId, role) {
  const db = await initDb();
  const user = await db.get(`SELECT roles FROM users WHERE id = ?`, [userId]);
  let roles = [];
  if (user && user.roles) {
    try { roles = JSON.parse(user.roles); } catch { roles = []; }
  }
  if (!roles.includes(role)) roles.push(role);
  await db.run(`UPDATE users SET roles = ? WHERE id = ?`, [JSON.stringify(roles), userId]);
  return roles;
}

export async function ensureRole(userId, role) {
  return addRole(userId, role);
}

import { initDb } from '../config/database.js';
import bcrypt from 'bcrypt';
import { getIo } from '../sockets/io.js';
import { logAudit } from '../services/auditService.js';
import { invalidateOnTrustChange } from '../cache/trustCaches.js';
import { incReputationEvent } from '../metrics/reputationMetrics.js';

export async function createUser({ username, password }) {
  const db = await initDb();
  const hash = bcrypt.hashSync(password, 10);
  let rolesJson = null;
  if(process.env.NODE_ENV !== 'production'){
    const devAdmin = process.env.DEV_ADMIN_USERNAME || 'admin';
    if(username === devAdmin){ rolesJson = JSON.stringify(['admin']); }
  }
  if(rolesJson){
    const result = await db.run(`INSERT INTO users (username, password_hash, roles) VALUES (?, ?, ?)`, [username, hash, rolesJson]);
    return { id: result.lastID, username, roles: ['admin'] };
  } else {
    const result = await db.run(`INSERT INTO users (username, password_hash) VALUES (?, ?)`, [username, hash]);
    return { id: result.lastID, username };
  }
}

export async function findUserByUsername(username) {
  const db = await initDb();
  return db.get('SELECT * FROM users WHERE username = ?', [username]);
}

export function validatePassword(user, password) {
  return bcrypt.compareSync(password, user.password_hash);
}

export async function updateTrust(userId, delta, reason='manual_adjust', ip=null) {
  const db = await initDb();
  await db.run('UPDATE users SET trust_score = MAX(0, MIN(200, trust_score + ?)) WHERE id = ?', [delta, userId]);
  await db.run('INSERT INTO reputation_events (user_id, delta, reason) VALUES (?, ?, ?)', [userId, delta, reason]);
  // Metrics (manual / legacy yol da reputasyon istatistiklerine girsin)
  try { incReputationEvent(reason); } catch {}
  logAudit({ userId, action: 'trust_update', detail: JSON.stringify({ delta, reason }), ip });
  const updated = await db.get('SELECT id, username, trust_score FROM users WHERE id = ?', [userId]);
  // Cache invalidation
  try { invalidateOnTrustChange(String(userId)); } catch {}
  const io = getIo();
  if (io) io.emit('trust_updated', updated);
  return updated;
}

export async function getUserMetrics() {
  const db = await initDb();
  const totals = await db.get('SELECT COUNT(*) as users, AVG(trust_score) as avg_trust FROM users');
  return { users: totals.users, avg_trust: totals.avg_trust };
}

export async function addRole(userId, role) {
  const db = await initDb();
  const user = await db.get('SELECT roles FROM users WHERE id = ?', [userId]);
  let roles = [];
  if (user && user.roles) {
    try { roles = JSON.parse(user.roles); } catch { roles = []; }
  }
  if (!roles.includes(role)) roles.push(role);
  await db.run('UPDATE users SET roles = ? WHERE id = ?', [JSON.stringify(roles), userId]);
  return roles;
}

export async function ensureRole(userId, role){
  return addRole(userId, role);
}

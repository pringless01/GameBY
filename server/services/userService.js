import { initDb } from '../config/database.js';
import bcrypt from 'bcrypt';
import { getIo } from '../sockets/io.js';

export async function createUser({ username, password }) {
  const db = await initDb();
  const hash = bcrypt.hashSync(password, 10);
  const result = await db.run(`INSERT INTO users (username, password_hash) VALUES (?, ?)`, [username, hash]);
  return { id: result.lastID, username };
}

export async function findUserByUsername(username) {
  const db = await initDb();
  return db.get('SELECT * FROM users WHERE username = ?', [username]);
}

export function validatePassword(user, password) {
  return bcrypt.compareSync(password, user.password_hash);
}

async function audit(userId, action, detail, ip) {
  const db = await initDb();
  await db.run('INSERT INTO audit_log (user_id, action, detail, ip) VALUES (?, ?, ?, ?)', [userId, action, detail || null, ip || null]);
}

export async function updateTrust(userId, delta, reason='manual_adjust', ip=null) {
  const db = await initDb();
  await db.run('UPDATE users SET trust_score = MAX(0, MIN(200, trust_score + ?)) WHERE id = ?', [delta, userId]);
  await db.run('INSERT INTO reputation_events (user_id, delta, reason) VALUES (?, ?, ?)', [userId, delta, reason]);
  await audit(userId, 'trust_update', JSON.stringify({ delta, reason }), ip);
  const updated = await db.get('SELECT id, username, trust_score FROM users WHERE id = ?', [userId]);
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

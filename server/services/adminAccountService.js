import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { initDb } from '../config/database.js';

const BCRYPT_ROUNDS = 12;
const MAX_FAIL = 5;

export async function findByUsername(username){
  const db = await initDb();
  return db.get('SELECT * FROM admin_accounts WHERE lower(username)=lower(?)', [username]);
}

export async function findById(id){
  const db = await initDb();
  return db.get('SELECT * FROM admin_accounts WHERE id=?', [id]);
}

export async function createAdmin(username, password, roles = ['read_only'], forceReset = true){
  const db = await initDb();
  const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS);
  await db.run('INSERT INTO admin_accounts (username, password_hash, roles, force_reset) VALUES (?,?,?,?)', [username, hash, JSON.stringify(roles), forceReset?1:0]);
  const row = await findByUsername(username);
  await audit(row.id, 'create_admin', `roles=${roles.join(',')}`);
  return row;
}

export async function ensureInitialSuperAdmin(){
  const db = await initDb();
  const row = await db.get('SELECT id FROM admin_accounts LIMIT 1');
  if(row) return false;
  const hash = bcrypt.hashSync('admin', BCRYPT_ROUNDS);
  await db.run('INSERT INTO admin_accounts (username, password_hash, roles, force_reset) VALUES (?,?,?,1)', ['admin', hash, JSON.stringify(['super_admin'])]);
  console.log('[admin-core] default super_admin admin/admin oluşturuldu (ilk girişte şifre değiştirin)');
  await audit(null, 'bootstrap', 'default_admin_created');
  return true;
}

export async function verifyPassword(account, password){
  try { return bcrypt.compareSync(password, account.password_hash); } catch { return false; }
}

export async function incrementFail(account){
  const db = await initDb();
  const fails = (account.failed_attempts||0) + 1;
  let locked = account.is_locked;
  if(fails >= MAX_FAIL){ locked = 1; await audit(account.id, 'account_locked', `fails=${fails}`); }
  await db.run('UPDATE admin_accounts SET failed_attempts=?, is_locked=? WHERE id=?', [fails, locked, account.id]);
}

export async function resetFails(accountId){
  const db = await initDb();
  await db.run('UPDATE admin_accounts SET failed_attempts=0 WHERE id=?', [accountId]);
}

export async function recordLogin(accountId, ip){
  const db = await initDb();
  await db.run('UPDATE admin_accounts SET last_login_at=datetime("now"), last_login_ip=? WHERE id=?', [ip, accountId]);
  await audit(accountId, 'login', 'success');
}

export async function changePassword(accountId, newPassword){
  const db = await initDb();
  const hash = bcrypt.hashSync(newPassword, BCRYPT_ROUNDS);
  await db.run('UPDATE admin_accounts SET password_hash=?, force_reset=0 WHERE id=?', [hash, accountId]);
  await audit(accountId, 'password_changed', 'self');
}

export async function resetPassword(targetId, newPassword, actorId){
  const db = await initDb();
  const hash = bcrypt.hashSync(newPassword, BCRYPT_ROUNDS);
  await db.run('UPDATE admin_accounts SET password_hash=?, force_reset=1 WHERE id=?', [hash, targetId]);
  await audit(actorId, 'password_reset', `target=${targetId}`);
}

export async function updateRoles(targetId, roles, actorId){
  const db = await initDb();
  await db.run('UPDATE admin_accounts SET roles=? WHERE id=?', [JSON.stringify(roles), targetId]);
  await audit(actorId, 'roles_update', `target=${targetId} roles=${roles.join(',')}`);
}

export async function setLock(targetId, lock, actorId){
  const db = await initDb();
  await db.run('UPDATE admin_accounts SET is_locked=?, failed_attempts=? WHERE id=?', [lock?1:0, lock?MAX_FAIL:0, targetId]);
  await audit(actorId, lock?'lock_admin':'unlock_admin', `target=${targetId}`);
}

export async function listAdmins(){
  const db = await initDb();
  const rows = await db.all('SELECT id, username, roles, force_reset, is_locked, failed_attempts, last_login_at, last_login_ip, created_at FROM admin_accounts ORDER BY id ASC');
  return rows.map(r => ({ ...r, roles: safeParse(r.roles) }));
}

export async function listAudit({ limit=100, action, admin_id }){
  const db = await initDb();
  const params = [];
  let sql = 'SELECT * FROM admin_audit WHERE 1=1';
  if(action){ sql+=' AND action=?'; params.push(action); }
  if(admin_id){ sql+=' AND admin_id=?'; params.push(admin_id); }
  sql += ' ORDER BY id DESC LIMIT ?';
  params.push(limit);
  return db.all(sql, params);
}

export async function stats(){
  const db = await initDb();
  const users = await db.get('SELECT COUNT(*) as c FROM users');
  const chats = await db.get('SELECT COUNT(*) as c FROM chat_messages');
  const admins = await db.get('SELECT COUNT(*) as c FROM admin_accounts');
  const locked = await db.get('SELECT COUNT(*) as c FROM admin_accounts WHERE is_locked=1');
  return { users: users.c, chat_messages: chats.c, admins: admins.c, locked_admins: locked.c };
}

export async function audit(adminId, action, detail, refId){
  const db = await initDb();
  await db.run('INSERT INTO admin_audit (admin_id, action, detail, ref_id) VALUES (?,?,?,?)', [adminId, action, detail||null, refId||null]);
}

// JWT jti blacklist
export async function blacklistJti(jti, expiresAt){
  const db = await initDb();
  await db.run('INSERT INTO admin_session_blacklist (jti, expires_at) VALUES (?,?)', [jti, expiresAt]);
}

export async function isJtiBlacklisted(jti){
  const db = await initDb();
  const row = await db.get('SELECT id FROM admin_session_blacklist WHERE jti=?', [jti]);
  return !!row;
}

function safeParse(v){ try { return v?JSON.parse(v):[]; } catch { return []; } }

export function newJti(){ return crypto.randomUUID(); }

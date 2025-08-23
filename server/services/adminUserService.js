import { initDb } from '../config/database.js';
import bcrypt from 'bcrypt';

export async function findAdminByUsername(username){
  const db = await initDb();
  return db.get('SELECT * FROM admin_users WHERE lower(username)=lower(?)', [username]);
}

export async function findAdminById(id){
  const db = await initDb();
  return db.get('SELECT * FROM admin_users WHERE id=?', [id]);
}

export async function createInitialAdmin(){
  const db = await initDb();
  const row = await db.get('SELECT id FROM admin_users LIMIT 1');
  if(row) return false;
  const hash = bcrypt.hashSync('admin', 10);
  await db.run('INSERT INTO admin_users (username, password_hash, roles, force_reset) VALUES (?,?,?,1)', ['admin', hash, JSON.stringify(['super_admin'])]);
  console.log('[root-admin] default admin/admin oluşturuldu (ilk girişte şifre değiştir)');
  return true;
}

export async function verifyAdminPassword(admin, password){
  return bcrypt.compareSync(password, admin.password_hash);
}

export async function updateAdminPassword(id, newPassword){
  const db = await initDb();
  const hash = bcrypt.hashSync(newPassword, 10);
  await db.run('UPDATE admin_users SET password_hash=?, force_reset=0 WHERE id=?', [hash, id]);
}

export async function listAdmins(){
  const db = await initDb();
  const rows = await db.all('SELECT id, username, roles, force_reset, created_at, last_login_at FROM admin_users ORDER BY id ASC');
  return rows.map(r=> ({ ...r, roles: safeParse(r.roles) }));
}

export async function recordAdminLogin(id, ip){
  const db = await initDb();
  await db.run('UPDATE admin_users SET last_login_at = datetime("now"), last_login_ip = ? WHERE id=?', [ip, id]);
}

function safeParse(js){ try { return js ? JSON.parse(js) : []; } catch { return []; } }

import { initDb } from '../config/database.js';

export async function isAdmin(userId){
  const db = await initDb();
  const row = await db.get(`SELECT roles FROM users WHERE id = ?`, [userId]);
  if(!row) return false;
  try { const roles = row.roles ? JSON.parse(row.roles) : []; return roles.includes('admin'); } catch { return false; }
}

export function adminRequired(req, res, next){
  // authRequired middleware daha önce req.user.id set etmeli
  if(!req.user || !req.user.id){
    return res.status(401).json({ error: 'unauthorized' });
  }
  isAdmin(req.user.id).then(ok => {
    if(!ok) return res.status(403).json({ error: 'forbidden' });
    next();
  }).catch(()=> res.status(500).json({ error: 'server_error' }));
}

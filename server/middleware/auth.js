import jwt from 'jsonwebtoken';
import { isTokenRevoked } from '../security/tokenBlacklist.js';

export async function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Yetkisiz' });
  }
  const token = header.slice(7);
  try {
    if (await isTokenRevoked(token)) {
      return res.status(401).json({ error: 'Token geçersiz' });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = { id: payload.sub, username: payload.username, roles: payload.roles || [] };
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Token geçersiz' });
  }
}

export function roleRequired(role) {
  return (req, res, next) => {
    if (!req.user || !req.user.roles || !req.user.roles.includes(role)) {
      return res.status(403).json({ error: 'Yetki yok' });
    }
    next();
  };
}

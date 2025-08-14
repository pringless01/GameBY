import { verifyToken } from '../config/jwt.js';

let _isTokenRevoked = null;
// Lazily try to load optional blacklist module once.
async function isRevoked(token) {
  if (_isTokenRevoked === null) {
    try {
      const mod = await import('../security/tokenBlacklist.js');
      _isTokenRevoked = mod.isTokenRevoked || (async () => false);
    } catch {
      _isTokenRevoked = async () => false;
    }
  }
  return _isTokenRevoked(token);
}

export async function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const token = header.slice(7);
  try {
    if (await isRevoked(token)) return res.status(401).json({ error: 'invalid_token' });
    const payload = verifyToken(token);
    req.user = { id: payload.sub, username: payload.username, email: payload.email || null, roles: payload.roles || [] };
    return next();
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

export function roleRequired(role) {
  return (req, res, next) => {
    if (!req.user?.roles?.includes(role)) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

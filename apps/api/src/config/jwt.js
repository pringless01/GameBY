import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(userId, extraClaims = {}) {
  const payload = { sub: userId, ...extraClaims };
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token){
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
}

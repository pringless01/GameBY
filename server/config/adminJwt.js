import jwt from 'jsonwebtoken';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || (process.env.JWT_SECRET ? process.env.JWT_SECRET + '_ADMIN' : 'dev_admin_secret');
const EXPIRES = process.env.ADMIN_JWT_EXPIRES || '30m';

export function signAdminToken(id, roles){
  return jwt.sign({ aid: id, roles }, ADMIN_JWT_SECRET, { expiresIn: EXPIRES });
}

export function verifyAdminToken(token){
  return jwt.verify(token, ADMIN_JWT_SECRET);
}

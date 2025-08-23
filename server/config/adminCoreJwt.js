import jwt from 'jsonwebtoken';
import { newJti } from '../services/adminAccountService.js';

const SECRET = process.env.ADMIN_CORE_JWT_SECRET || (process.env.JWT_SECRET ? process.env.JWT_SECRET + '_CORE' : 'dev_admin_core_secret');
const EXPIRES = process.env.ADMIN_CORE_JWT_EXPIRES || '30m';

export function signAdminCoreToken(aid, roles){
  const jti = newJti();
  const token = jwt.sign({ aid, roles, jti }, SECRET, { expiresIn: EXPIRES });
  const decoded = jwt.decode(token);
  return { token, jti, exp: decoded.exp };
}

export function verifyAdminCoreToken(token){
  return jwt.verify(token, SECRET);
}

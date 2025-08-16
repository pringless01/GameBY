// IP normalization helpers (IPv4/IPv6) and X-Forwarded-For parsing
import { envConfig } from '../config/env';

export function normalizeIp(ip){
  if(!ip) return '';
  // Remove IPv6 zone index if any
  const z = ip.indexOf('%'); if(z>0) ip = ip.slice(0,z);
  // ::ffff:127.0.0.1 -> 127.0.0.1
  if(ip.startsWith('::ffff:')) return ip.slice(7);
  // ::1 -> 127.0.0.1 (treat as localhost)
  if(ip === '::1') return '127.0.0.1';
  return ip;
}

export function getClientIp(req){
  const trustedCount = Number(envConfig.TRUSTED_PROXY_COUNT||0);
  const xff = (req.headers['x-forwarded-for']||'').split(',').map(s=>s.trim()).filter(Boolean).map(normalizeIp);
  if(trustedCount>0 && xff.length){
    // Take the left-most (original) IP or drop last N trusted hops
    const original = xff[0];
    return original || normalizeIp(req.ip);
  }
  return normalizeIp(req.ip);
}

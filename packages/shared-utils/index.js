// shared utility placeholders
import crypto from 'node:crypto';
export * as dates from './src/dates.js';
export * as cursor from './src/cursor.js';
export { invariant } from './src/invariant.js';

export function hmacSha256Base64(str, key){
  return crypto.createHmac('sha256', key).update(str).digest('base64');
}

export const constants = {
  DEFAULT_PAGE_LIMIT: 10
};

// Pagination helpers (non-invasive)
export function normalizeLimit(limit, max = 100){
  const n = Number(limit);
  if(!Number.isFinite(n) || n <= 0) return constants.DEFAULT_PAGE_LIMIT;
  return Math.min(Math.floor(n), max);
}

export function normalizeOffset(offset){
  const n = Number(offset);
  if(!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

// shared utility placeholders
import crypto from 'node:crypto';

export function hmacSha256Base64(str, key){
  return crypto.createHmac('sha256', key).update(str).digest('base64');
}

export const constants = {
  DEFAULT_PAGE_LIMIT: 10
};

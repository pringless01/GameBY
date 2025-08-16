import { namespace, isRedisEnabled } from '../cache/redisAdapter';

const memorySet = new Set();
let redisNs = null;

export async function initBlacklist(){
  if (isRedisEnabled()) {
    redisNs = namespace('revoked');
  }
}

export async function isTokenRevoked(token){
  if(memorySet.has(token)) return true;
  if(redisNs){
    const val = await redisNs.get(token);
    return !!val;
  }
  return false;
}

export async function revokeToken(token, ttlMs){
  memorySet.add(token);
  if(redisNs){
    await redisNs.set(token, true, ttlMs);
  }
}

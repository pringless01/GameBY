import { namespace, isRedisEnabled } from '../cache/redisAdapter';

const memory = new Map();

function memoryStore(){
  return {
    async get(key){ return memory.get(key) || null; },
    async set(key, val, ttlMs){ memory.set(key, val); if(ttlMs){ setTimeout(()=>memory.delete(key), ttlMs).unref?.(); } },
    async del(key){ memory.delete(key); }
  };
}

export function getRefreshStore(){
  if(isRedisEnabled()){
    try {
      const ns = namespace('refresh');
      return {
        async get(k){ return ns.get(k); },
        async set(k,v,ttl){ return ns.set(k,v,ttl); },
        async del(k){ return ns.del(k); }
      };
    } catch {
      return memoryStore();
    }
  }
  return memoryStore();
}

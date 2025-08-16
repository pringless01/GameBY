import { createClient } from 'redis';

// Factory that returns a pluggable refresh token store.
// - In-memory Map when REDIS_URL is not set
// - Redis client (v4) when REDIS_URL is provided
export async function makeRefreshStore() {
  const url = process.env.REDIS_URL;
  if (!url) {
    const store = new Map();
    return {
      async get(k) { return store.get(k); },
      async set(k, v, ttlMs) {
        store.set(k, v);
        if (ttlMs) setTimeout(() => store.delete(k), ttlMs).unref?.();
      },
      async del(k) { store.delete(k); }
    };
  }
  const client = createClient({ url });
  await client.connect();
  return {
    async get(k) { return client.get(k); },
    async set(k, v, ttlMs) { return ttlMs ? client.set(k, v, { PX: ttlMs }) : client.set(k, v); },
    async del(k) { return client.del(k); }
  };
}

// Backwards compat shim for older imports if any
export async function getRefreshStore() {
  return makeRefreshStore();
}import { namespace, isRedisEnabled } from '../cache/redisAdapter.js';

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

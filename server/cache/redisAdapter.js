import { createClient } from 'redis';
import { envConfig } from '../config/env.js';

let client = null;
let enabled = false;

export function isRedisEnabled(){ return enabled; }

export async function initRedisIfEnabled(){
  enabled = (envConfig.CACHE_BACKEND === 'redis') && !!envConfig.REDIS_URL;
  if(!enabled) return false;
  if(client) return true;
  client = createClient({ url: envConfig.REDIS_URL });
  client.on('error', (err)=> console.error('[redis] error', err?.message||err));
  await client.connect();
  return true;
}

export function getRedis(){ return client; }

// Simple namespace wrapper for JSON values
export function namespace(ns){
  return {
    async set(key, value, ttlMs){
      if(!enabled || !client) return false;
      const k = `${ns}:${key}`;
      const payload = JSON.stringify(value);
      if(ttlMs && ttlMs>0){ await client.set(k, payload, { PX: ttlMs }); }
      else { await client.set(k, payload); }
      return true;
    },
    async get(key){
      if(!enabled || !client) return null;
      const k = `${ns}:${key}`;
      const val = await client.get(k);
      try { return val ? JSON.parse(val) : null; } catch { return null; }
    },
    async del(key){ if(!enabled || !client) return false; return client.del(`${ns}:${key}`); },
    async clear(){
      if(!enabled || !client) return false;
      const it = client.scanIterator({ MATCH: `${ns}:*` });
      for await (const k of it){ await client.del(k); }
      return true;
    }
  };
}

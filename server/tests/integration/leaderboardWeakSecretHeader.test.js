import assert from 'assert';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function baseUrl(port){ return `http://127.0.0.1:${port}`; }

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function post(base, url, json){
  const res = await fetch(base+url, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(json) });
  const text = await res.text(); try { return { status:res.status, body: JSON.parse(text) }; } catch { return { status:res.status, body:text }; }
}
async function authGet(base, url, token){
  const res = await fetch(base+url, { headers: { Authorization:'Bearer '+token }});
  return res;
}
async function waitForHealth(base, timeoutMs=8000){
  const start = Date.now();
  while(Date.now()-start < timeoutMs){
    try { const r = await fetch(base+'/health'); if(r.ok) return true; } catch {}
    await sleep(200);
  }
  throw new Error('health_timeout');
}

async function runCase({ weakSecret, port }){
  let proc; try {
    const env = { ...process.env, NODE_ENV:'development', PORT: String(port), JWT_SECRET:'x'.repeat(40), CURSOR_SECRET: weakSecret ? 'short' : 'this_is_a_strong_cursor_secret_value_which_is_long_enough' };
    proc = spawn('node',['server.js'],{ cwd: path.resolve(__dirname,'..','..'), env });
    await new Promise((resolve,reject)=>{
      const to = setTimeout(()=>reject(new Error('server_timeout')), 15000);
      proc.stdout.on('data',d=>{ const s=d.toString(); process.stdout.write(s); if(s.includes('Server listening')){ clearTimeout(to); resolve(); } });
      proc.stderr.on('data',d=>{ process.stderr.write(d.toString()); });
    });
    const base = baseUrl(port);
    await sleep(200);
    await waitForHealth(base, 10000);
    await post(base, '/api/auth/register',{ username:'u_'+(weakSecret?'w':'s'), password:'pw' });
    const login = await post(base, '/api/auth/login',{ username:'u_'+(weakSecret?'w':'s'), password:'pw' });
    const token = login.body?.token; assert.ok(token,'missing token');
    const res = await authGet(base, '/api/user/leaderboard?limit=3&offset=0', token);
    if(weakSecret){ assert.equal(res.headers.get('x-cursor-weak-secret'),'1','expected weak-secret header'); }
    else { assert(!res.headers.get('x-cursor-weak-secret'),'unexpected weak-secret header'); }
  } finally { if(proc) proc.kill(); }
}

(async ()=>{
  try {
    await runCase({ weakSecret:true, port:3458 });
    await sleep(300);
    await runCase({ weakSecret:false, port:3459 });
    console.log('LEADERBOARD_WEAK_SECRET_HEADER_SUCCESS');
    process.exit(0);
  } catch(e){ console.error('LEADERBOARD_WEAK_SECRET_HEADER_FAIL', e); process.exit(1); }
})();

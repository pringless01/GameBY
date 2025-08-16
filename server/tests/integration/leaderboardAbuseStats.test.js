import assert from 'assert';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = 'http://localhost:3457';

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function post(url, json, headers={}){
  const body = JSON.stringify(json);
  const res = await fetch(BASE+url, { method:'POST', headers:{ 'Content-Type':'application/json', ...headers }, body });
  const text = await res.text(); try { return { status:res.status, body: JSON.parse(text) }; } catch { return { status:res.status, body:text }; }
}
async function get(url, headers={}){
  const res = await fetch(BASE+url, { headers });
  const text = await res.text(); try { return { status:res.status, body: JSON.parse(text) }; } catch { return { status:res.status, body:text }; }
}

(async () => {
  let proc; try {
  const uname = 'admin_abuse_'+Date.now();
  proc = spawn('node',['server.js'],{ cwd: path.resolve(__dirname,'..','..'), env: { ...process.env, PORT:'3457', JWT_SECRET:'x'.repeat(40), CURSOR_SECRET:'y'.repeat(40), DEV_ADMIN_USERNAME: uname } });
    await new Promise((resolve,reject)=>{
      const to = setTimeout(()=>reject(new Error('server_timeout')), 12000);
      proc.stdout.on('data',d=>{ if(d.toString().includes('Server listening')){ clearTimeout(to); resolve(); } });
      proc.stderr.on('data',()=>{});
    });
  // create admin using DEV_ADMIN_USERNAME mapping
  const reg = await post('/api/auth/register',{ username: uname, password:'pw' });
  assert.equal(reg.status,200,'register 200');
  const login = await post('/api/auth/login',{ username: uname, password:'pw' });
  assert.equal(login.status,200,'login 200');
    const token = login.body?.token; assert.ok(token,'missing token');
    // trigger invalid cursors from loopback (same IP)
    for(let i=0;i<8;i++){
      await fetch(BASE+`/api/user/leaderboard?limit=5&cursor=invalid@@${i}`, { headers:{ Authorization:'Bearer '+token } });
    }
    // admin JSON endpoint
    const r1 = await get('/api/user/leaderboard/abuse/ips?limit=5&mask=1', { Authorization:'Bearer '+token });
    assert.equal(r1.status,200,'abuse ips 200');
    assert.ok(Array.isArray(r1.body.ips), 'ips array');
    // prom gauges
    const prom = await get('/api/user/leaderboard/metrics/prom', { Authorization:'Bearer '+token });
    assert.equal(prom.status,200);
    assert.ok(String(prom.body).includes('leaderboard_security_abusive_ip_count'),'missing abusive_ip_count');
    assert.ok(String(prom.body).includes('leaderboard_security_cooldown_ip_count'),'missing cooldown_ip_count');
    console.log('LEADERBOARD_ABUSE_STATS_SUCCESS');
    process.exit(0);
  } catch(e){ console.error('LEADERBOARD_ABUSE_STATS_FAIL', e); process.exit(1); } finally { if(proc) proc.kill(); }
})();

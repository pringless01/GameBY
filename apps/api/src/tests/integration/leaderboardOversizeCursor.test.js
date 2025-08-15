// Test: oversize cursor -> cursor_oversize metric increment
import assert from 'assert';

import fetch from 'node-fetch';

const BASE = 'http://localhost:3000';
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function startServer(){ process.env.LB_RATE_MAX='500'; await import('../../server.js'); await sleep(400); }
async function register(username){ const res = await fetch(BASE + '/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})}); return res.json(); }
async function login(username){ const res = await fetch(BASE + '/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})}); return res.json(); }
async function authFetch(path, token, options={}){ return fetch(BASE+path,{...options,headers:{...(options.headers||{}),'Content-Type':'application/json','Authorization':'Bearer '+token}}); }

(async ()=>{
  try {
    await startServer();
    const uname='admin';
    await register(uname); await sleep(50);
    const { token } = await login(uname);

    const oversize = 'X'.repeat(300); // >256 char, tetikler
    for(let i=0;i<5;i++){
      await authFetch('/api/user/leaderboard?limit=5&cursor='+oversize, token);
      await sleep(15);
    }
    const metricsRes = await authFetch('/api/user/leaderboard/metrics/prom', token);
    assert(metricsRes.status===200,'Metrics endpoint erişilemedi');
    const text = await metricsRes.text();
    const m = text.match(/^leaderboard_errors_cursor_oversize (\d+)/m);
    assert(m, 'cursor_oversize metriği yok');
    const val = Number(m[1]);
    assert(val > 0, 'cursor_oversize metriği artmadı');
    console.log('LEADERBOARD_OVERSIZE_CURSOR_TEST_SUCCESS');
    process.exit(0);
  } catch(e){
    console.error('LEADERBOARD_OVERSIZE_CURSOR_TEST_FAIL', e);
    process.exit(1);
  }
})();

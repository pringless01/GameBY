// Test: X-Cursor-Degrade header ve modeDegradeSuggested metriği (200 + 429 senaryosu)
import assert from 'assert';

import fetch from 'node-fetch';

const BASE = 'http://localhost:3000';

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function startServer(){
  process.env.CURSOR_INVALID_THRESHOLD = '4'; // daha hızlı tetiklenmesi için düşük eşik
  process.env.CURSOR_ABUSE_COOLDOWN_MS = '1500';
  process.env.LB_RATE_MAX = '500';
  await import('../../server.js');
  await sleep(500);
}
async function register(username){ const res = await fetch(BASE + '/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})}); return res.json(); }
async function login(username){ const res = await fetch(BASE + '/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})}); return res.json(); }
async function authFetch(path, token, options={}){ return fetch(BASE+path,{...options,headers:{...(options.headers||{}),'Content-Type':'application/json','Authorization':'Bearer '+token}}); }

(async ()=>{
  try {
    await startServer();
    const uname = 'admin';
    await register(uname); await sleep(50);
    const { token } = await login(uname);

    // Abuse tetikle (4 threshold, 5 invalid istek)
    const attempts = 5;
    for(let i=0;i<attempts;i++){
      const r = await authFetch('/api/user/leaderboard?limit=3&cursor=BROKEN@@', token);
      assert(r.status===400,'Invalid cursor 400 bekleniyordu');
      await sleep(40);
    }

    // İlk normal istek -> 200 + X-Cursor-Degrade=offset
    let r1 = await authFetch('/api/user/leaderboard?limit=3&offset=0', token);
    assert(r1.status===200,'200 bekleniyordu (ilk normal)');
    assert(r1.headers.get('x-cursor-degrade')==='offset','X-Cursor-Degrade=offset bekleniyordu (200)');

    // İkinci istek -> cooldown süresi devam ederken 429 + X-Cursor-Degrade=offset
    let r2 = await authFetch('/api/user/leaderboard?limit=3&offset=0', token);
    assert(r2.status===429,'429 bekleniyordu (cooldown)');
    assert(r2.headers.get('x-cursor-degrade')==='offset','X-Cursor-Degrade=offset bekleniyordu (429)');

    // Metrics (JSON) -> modeDegradeSuggested >= 2
    const mRes = await authFetch('/api/user/leaderboard/metrics', token);
    if(mRes.status===200){
      const mJson = await mRes.json();
      assert(mJson.security.modeDegradeSuggested >= 2, 'modeDegradeSuggested metriği >=2 olmalı');
    }

    // Prometheus endpoint kontrol (opsiyonel)
    const promRes = await authFetch('/api/user/leaderboard/metrics/prom', token);
    if(promRes.status===200){
      const text = await promRes.text();
      assert(/leaderboard_security_mode_degrade_suggested \d+/i.test(text),'Prometheus metriği yok');
    }

    console.log('LEADERBOARD_DEGRADE_HEADER_TEST_SUCCESS');
    process.exit(0);
  } catch(e){
    console.error('LEADERBOARD_DEGRADE_HEADER_TEST_FAIL', e);
    process.exit(1);
  }
})();

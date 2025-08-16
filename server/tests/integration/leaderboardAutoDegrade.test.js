// Test: CURSOR_AUTO_DEGRADE=1 ile cooldown sırasında otomatik offset fallback
import assert from 'assert';

import fetch from 'node-fetch';

const BASE = 'http://localhost:3000';
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function startServer(){
  process.env.CURSOR_INVALID_THRESHOLD = '3';
  process.env.CURSOR_ABUSE_COOLDOWN_MS = '3000';
  process.env.CURSOR_AUTO_DEGRADE = '1';
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

    // Eşik =3 -> İlk 3 invalid cursor isteği 400 olmalı
    for(let i=0;i<3;i++){
      const r = await authFetch('/api/user/leaderboard?limit=5&cursor=BAD@@', token);
      assert(r.status===400, 'Eşik öncesi invalid cursor 400 bekleniyordu (i='+i+')');
      await sleep(30);
    }
    // Eşik sonrası ilk invalid cursor isteği artık cooldown altında -> auto degrade devreye girer ve 200 döner
    const degraded = await authFetch('/api/user/leaderboard?limit=5&cursor=BAD@@', token);
    assert(degraded.status===200, 'Cooldown + auto degrade sonrası 200 bekleniyordu');
    assert(degraded.headers.get('x-cursor-auto-degrade')==='1','X-Cursor-Auto-Degrade=1 bekleniyordu');
    assert(degraded.headers.get('x-pagination-mode')==='offset','Offset fallback bekleniyordu');

    // Metrics kontrol
    const mRes = await authFetch('/api/user/leaderboard/metrics', token);
    if(mRes.status===200){
      const mJson = await mRes.json();
      assert(mJson.security.cursorAutoDegrade >= 1,'cursorAutoDegrade metriği artmadı');
    }

    console.log('LEADERBOARD_AUTO_DEGRADE_TEST_SUCCESS');
    process.exit(0);
  } catch(e){
    console.error('LEADERBOARD_AUTO_DEGRADE_TEST_FAIL', e);
    process.exit(1);
  }
})();

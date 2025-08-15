// Test: invalid cursor abuse detection -> X-Cursor-Abuse header
import assert from 'assert';

import fetch from 'node-fetch';

const BASE = 'http://localhost:3000';

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function startServer(){ process.env.LB_RATE_MAX='100'; await import('../../server.js'); await sleep(500); }
async function register(username){ const res = await fetch(BASE + '/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})}); return res.json(); }
async function login(username){ const res = await fetch(BASE + '/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})}); return res.json(); }
async function authFetch(path, token, options={}){ return fetch(BASE+path,{...options,headers:{...(options.headers||{}),'Content-Type':'application/json','Authorization':'Bearer '+token}}); }

(async ()=>{
  try {
    await startServer();
    const adminU = 'admin';
    await register(adminU); await sleep(50); const adminL = await login(adminU); const token = adminL.token;
    // Çok sayıda invalid cursor isteği gönder
    const attempts = 35; // threshold default 30
    for(let i=0;i<attempts;i++){
      await authFetch('/api/user/leaderboard?limit=5&cursor=invalid@@@', token);
      await sleep(20); // RL tetiklenmesin
    }
    const res = await authFetch('/api/user/leaderboard?limit=5&offset=0', token);
    assert(res.status===200,'Normal request failed');
    const abuse = res.headers.get('x-cursor-abuse');
    assert(abuse==='1','Abuse header bekleniyordu');
    const metricsRes = await authFetch('/api/user/leaderboard/metrics/prom', token);
    const metricsText = await metricsRes.text();
    const sigErrLine = metricsText.match(/^leaderboard_errors_cursor_signature (\d+)/m);
    const fmtErrLine = metricsText.match(/^leaderboard_errors_cursor_format (\d+)/m);
    assert(sigErrLine || fmtErrLine, 'Format veya imza hata metriği yok');
    console.log('LEADERBOARD_ABUSE_TEST_SUCCESS');
    process.exit(0);
  } catch(e){
    console.error('LEADERBOARD_ABUSE_TEST_FAIL', e);
    process.exit(1);
  }
})();

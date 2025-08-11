// Test: per-IP cursor abuse cooldown -> 200 (abuse headers) then 429 within cooldown
import assert from 'assert';
import fetch from 'node-fetch';

const BASE = 'http://localhost:3000';

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function startServer(){
  // Teste özel düşük threshold ve kısa cooldown
  process.env.CURSOR_INVALID_THRESHOLD = '5';
  process.env.CURSOR_ABUSE_COOLDOWN_MS = '2000';
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
    const uname = 'admin'; // metrics erişimi için
    await register(uname); await sleep(50);
    const loginData = await login(uname);
    const token = loginData.token;

    // Eşik aşımı için ardışık geçersiz cursor istekleri (400 beklenir)
    const attempts = 6; // threshold 5
    for(let i=0;i<attempts;i++){
      const r = await authFetch('/api/user/leaderboard?limit=3&cursor=INVALID@@@', token);
      assert(r.status===400,'Geçersiz cursor 400 bekleniyordu');
      await sleep(50);
    }

    // Eşik sonrası ilk normal istek -> 200 fakat abuse + cooldown headerları gelmeli
    let res = await authFetch('/api/user/leaderboard?limit=3&offset=0', token);
    assert(res.status===200,'İlk normal istekte 200 bekleniyordu');
    const abuseHeader = res.headers.get('x-cursor-abuse');
    const abuseCount = res.headers.get('x-cursor-abuse-count');
    const cooldownMs = res.headers.get('x-cursor-cooldown');
    assert(abuseHeader==='1','X-Cursor-Abuse header yok');
    assert(Number(abuseCount) >= attempts,'Abuse count beklenenden düşük');
    assert(Number(cooldownMs) > 0,'Cooldown ms yok');

    // Hemen ikinci istek -> cooldown devrede, 429 beklenir
    res = await authFetch('/api/user/leaderboard?limit=3&offset=0', token);
    assert(res.status===429,'Cooldown sırasında 429 bekleniyordu');
    assert(res.headers.get('retry-after'),'Retry-After header yok');
    assert(res.headers.get('x-cursor-cooldown'),'Cooldown header yok (429)');
    const body = await res.json();
    assert(body.error==='cursor_abuse_cooldown','429 body error alanı yanlış');

    // Metrics endpoint: security.cursorAbuse429 >= 1
    const mRes = await authFetch('/api/user/leaderboard/metrics', token);
    if(mRes.status===200){
      const mJson = await mRes.json();
      assert(mJson.security.cursorAbuse429 >= 1,'cursorAbuse429 metriği artmadı');
      assert(mJson.cooldownActiveIpCount >= 1,'cooldownActiveIpCount bekleniyordu');
    }

    console.log('LEADERBOARD_COOLDOWN_TEST_SUCCESS');
    process.exit(0);
  } catch(e){
    console.error('LEADERBOARD_COOLDOWN_TEST_FAIL', e);
    process.exit(1);
  }
})();

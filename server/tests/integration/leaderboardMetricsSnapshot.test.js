// Test: metrics snapshot counters (modeDegradeSuggested, cursorAutoDegrade, cooldownGraceServed, cursorAbuse429)
import assert from 'assert';
import fetch from 'node-fetch';

const BASE = 'http://localhost:3000';
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function startServer(){
  process.env.CURSOR_INVALID_THRESHOLD = '3';
  process.env.CURSOR_ABUSE_COOLDOWN_MS = '1500';
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
    const uname = 'admin'; // admin role for metrics
    await register(uname); await sleep(50);
    const { token } = await login(uname);

    // Step A: trigger threshold (3 invalid cursor -> 3x400)
    for(let i=0;i<3;i++){
      const r = await authFetch('/api/user/leaderboard?limit=5&cursor=BAD@@', token);
      assert(r.status===400,'Invalid cursor 400 bekleniyordu i='+i);
      await sleep(40);
    }

    // Step B: first offset request during cooldown (grace) -> 200 + abuse headers
    const grace = await authFetch('/api/user/leaderboard?limit=5&offset=0', token);
    assert(grace.status===200,'Grace 200 bekleniyordu');
    assert(grace.headers.get('x-cursor-abuse')==='1','Grace abuse header yok');
    assert(grace.headers.get('x-cursor-cooldown'),'Grace cooldown header yok');

    // Step C: another invalid cursor (cnt > threshold, auto degrade) -> 200 + auto degrade header
    const degraded = await authFetch('/api/user/leaderboard?limit=5&cursor=BAD@@', token);
    assert(degraded.status===200,'Auto degrade 200 bekleniyordu');
    assert(degraded.headers.get('x-cursor-auto-degrade')==='1','Auto degrade header yok');

    // Step D: second offset during same cooldown -> 429
    const blocked = await authFetch('/api/user/leaderboard?limit=5&offset=0', token);
    assert(blocked.status===429,'İkinci offset 429 bekleniyordu');
    assert(blocked.headers.get('x-cursor-cooldown'),'429 cooldown header yok');

    // Metrics JSON
    const mRes = await authFetch('/api/user/leaderboard/metrics', token);
    assert(mRes.status===200,'Metrics endpoint erişilemedi');
    const mJson = await mRes.json();
    assert(mJson.security.modeDegradeSuggested >= 3,'modeDegradeSuggested >=3 bekleniyordu');
    assert(mJson.security.cooldownGraceServed >= 1,'cooldownGraceServed >=1 bekleniyordu');
    assert(mJson.security.cursorAutoDegrade >= 1,'cursorAutoDegrade >=1 bekleniyordu');
    assert(mJson.security.cursorAbuse429 >= 1,'cursorAbuse429 >=1 bekleniyordu');

    // Prometheus metrics quick check
    const prom = await authFetch('/api/user/leaderboard/metrics/prom', token);
    if(prom.status===200){
      const text = await prom.text();
      assert(/leaderboard_security_mode_degrade_suggested \d+/i.test(text),'Prometheus modeDegradeSuggested metriği yok');
    }

    console.log('LEADERBOARD_METRICS_SNAPSHOT_TEST_SUCCESS');
    process.exit(0);
  } catch(e){
    console.error('LEADERBOARD_METRICS_SNAPSHOT_TEST_FAIL', e);
    process.exit(1);
  }
})();

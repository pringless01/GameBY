// Test: Prometheus metrics format doğrulama
import assert from 'assert';
import fetch from 'node-fetch';

const BASE = 'http://localhost:3000';
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function startServer(){
  process.env.LB_RATE_MAX='500';
  await import('../../server.js');
  await sleep(400);
}
async function register(username){ const res = await fetch(BASE + '/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})}); return res.json(); }
async function login(username){ const res = await fetch(BASE + '/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})}); return res.json(); }
async function authFetch(path, token, options={}){ return fetch(BASE+path,{...options,headers:{...(options.headers||{}),'Content-Type':'application/json','Authorization':'Bearer '+token}}); }

(async ()=>{
  try {
    await startServer();
    const uname='admin';
    await register(uname); await sleep(50);
    const { token } = await login(uname);

    // Birkaç istek gönder ki sayaclar sıfır kalmasın
    for(let i=0;i<2;i++){
      await authFetch('/api/user/leaderboard?limit=5&offset=0', token);
      await sleep(30);
    }

    const res = await authFetch('/api/user/leaderboard/metrics/prom', token);
    assert(res.status===200,'Prom metrics 200 bekleniyordu');
    const text = await res.text();

    // Temel format kontrolleri
    assert(text.endsWith('\n'),'Son satır newline ile bitmeli');
    const requiredMetricNames = [
      'leaderboard_trust_offset_hits',
      'leaderboard_trust_offset_misses',
      'leaderboard_trust_cursor_requests',
      'leaderboard_mentor_hits',
      'leaderboard_security_mode_degrade_suggested',
      'leaderboard_errors_cursor_format',
      'leaderboard_errors_cursor_signature',
      'leaderboard_errors_cursor_oversize'
    ];
    requiredMetricNames.forEach(name=>{
      const regex = new RegExp('^'+name+' \\d+(?:\\.\\d+)?$','m');
      assert(regex.test(text), name+' satırı yok');
    });

    // TYPE deklarasyonlarından biri örnek doğrulama
    assert(/# TYPE leaderboard_trust_offset_hits counter/m.test(text),'TYPE deklarasyonu yok');

    console.log('LEADERBOARD_PROM_FORMAT_TEST_SUCCESS');
    process.exit(0);
  } catch(e){
    console.error('LEADERBOARD_PROM_FORMAT_TEST_FAIL', e);
    process.exit(1);
  }
})();

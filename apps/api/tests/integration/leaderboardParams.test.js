// Test: Parametre edge-case ve doğrulama hataları
import assert from 'assert';

import fetch from 'node-fetch';

const BASE = 'http://localhost:3000';
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function startServer(){
  process.env.LB_RATE_MAX = '500';
  await import('../../server.js');
  await sleep(400);
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

    // 1) offset + cursor conflict
    let r = await authFetch('/api/user/leaderboard?limit=5&offset=10&cursor=ANYCURSOR&rank=1', token);
    assert(r.status===400,'offset+cursor conflict 400 bekleniyordu');
    let j = await r.json();
    assert(j.error==='invalid_params','invalid_params error bekleniyordu');
    assert(j.fields.includes('offset_cursor_conflict'),'offset_cursor_conflict field bekleniyordu');

    // 2) Çoklu geçersiz numeric parametre: limit/window/minSessions/offset
    r = await authFetch('/api/user/leaderboard?limit=abc&window=xyz&minSessions=qq&offset=pp&rank=1', token);
    assert(r.status===400,'Çoklu invalid numeric 400 bekleniyordu');
    j = await r.json();
    // Hepsi listede olmalı (sıra önemli değil)
    ['limit','window','minSessions','offset'].forEach(f=>{
      assert(j.fields.includes(f), f+' alanı eksik');
    });

    // 3) Geçersiz rank parametresi
    r = await authFetch('/api/user/leaderboard?limit=5&offset=0&rank=2', token);
    assert(r.status===400,'Geçersiz rank=2 için 400 bekleniyordu');
    j = await r.json();
    assert(j.fields.includes('rank'),'rank alanı eksik');

    console.log('LEADERBOARD_PARAMS_TEST_SUCCESS');
    process.exit(0);
  } catch(e){
    console.error('LEADERBOARD_PARAMS_TEST_FAIL', e);
    process.exit(1);
  }
})();

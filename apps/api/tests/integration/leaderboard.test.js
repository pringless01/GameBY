// Leaderboard advanced features integration test
// Genişletildi: weak secret, rotated cursor, metrics invalidCursor
import assert from 'assert';
import crypto from 'crypto';

import fetch from 'node-fetch';

const BASE = 'http://localhost:3000';
const CURSOR_SECRET = process.env.CURSOR_SECRET || 'dev_cursor_secret_change_me';

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function startServer(){ await import('../../server.js'); await sleep(500); }
async function register(username){ const res = await fetch(BASE + '/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})}); return res.json(); }
async function login(username){ const res = await fetch(BASE + '/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})}); return res.json(); }
async function authFetch(path, token, options={}){ return fetch(BASE+path,{...options,headers:{...(options.headers||{}),'Content-Type':'application/json','Authorization':'Bearer '+token}}); }

// Mirror encodeCursor from implementation (for crafting synthetic FIRST cursor)
function encodeCursor(score,id){
  const base = score+'|'+id;
  const sig = crypto.createHmac('sha256', CURSOR_SECRET).update(base).digest('base64').replace(/[^A-Za-z0-9+/]/g,'').slice(0,16);
  return Buffer.from(base+'|'+sig).toString('base64');
}

(async ()=>{
  try {
    await startServer();

    // admin otomatik için varsayılan kullanıcı adı
    const adminUser = 'admin';
    await register(adminUser); await sleep(50); const adminLogin = await login(adminUser); const adminToken = adminLogin.token;

    // Create a set of users (exclude admin already created)
    const userCount = 8;
    const users = [];
    for(let i=0;i<userCount;i++){
      const uname = 'lbU'+i+'_'+Date.now();
      await register(uname);
      await sleep(30);
      const l = await login(uname);
      users.push({ uname, token: l.token });
      await sleep(30);
    }
    assert(users.length === userCount, 'Kullanıcı oluşturulamadı');

    const token = users[0].token;

    // 1) Offset mode basic
    let res = await authFetch('/api/user/leaderboard?limit=5&offset=0', token);
    assert(res.status===200,'Offset 200 değil');
    let json = await res.json();
    assert(json.category==='trust','Kategori trust değil');
    assert(res.headers.get('x-total-count'),'X-Total-Count header yok');

    // Weak secret header (dev default ise beklentimiz 1)
    const weak = res.headers.get('x-cursor-weak-secret');
    assert(weak==='1','Weak secret header bekleniyordu');

    // 2) rank=0 skip test
    res = await authFetch('/api/user/leaderboard?limit=5&offset=0&rank=0', token);
    assert(res.status===200,'rank=0 200 değil');
    assert(res.headers.get('x-user-rank-skipped')==='1','Rank skip header yok');

    // 3) Conflict offset + cursor
    res = await authFetch('/api/user/leaderboard?limit=5&offset=5&cursor=dummy', token);
    assert(res.status===400,'Conflict 400 değil');
    json = await res.json();
    assert(json.error==='invalid_params' && json.fields.includes('offset_cursor_conflict'),'offset_cursor_conflict alanı yok');

    // 4) Invalid cursor (metrics artışı test için)
    res = await authFetch('/api/user/leaderboard?limit=5&cursor=invalid@@@', token);
    assert(res.status===400,'Invalid cursor 400 değil');

    // Metrics (admin) -> invalidCursor >=1
    let mRes = await authFetch('/api/user/leaderboard/metrics', adminToken);
    assert(mRes.status===200,'Metrics 200 değil');
    let metricsJson = await mRes.json();
    assert(metricsJson.errors.invalidCursor >= 1,'invalidCursor metriği artmadı');

    // 5) Cursor mode first page synthetic
    const startCursor = encodeCursor(999999,0);
    res = await authFetch('/api/user/leaderboard?limit=5&cursor='+encodeURIComponent(startCursor), token);
    assert(res.status===200,'Cursor page 1 200 değil');
    json = await res.json();
    const nextCursor = json.nextCursor; assert(nextCursor,'nextCursor yok');
    assert(res.headers.get('x-cursor-signed')==='1','X-Cursor-Signed yok');

    // 6) Cursor next page
    res = await authFetch('/api/user/leaderboard?limit=5&cursor='+encodeURIComponent(nextCursor), token);
    assert(res.status===200,'Cursor page 2 200 değil');

    // 7) Batch mode
    res = await authFetch('/api/user/leaderboard?categories=trust,mentor&limit=5&rank=0', token);
    assert(res.status===200,'Batch 200 değil');

    // 8) HEAD request
    const headRes = await fetch(BASE + '/api/user/leaderboard?limit=5&offset=0', { method:'HEAD', headers: { 'Authorization':'Bearer '+token }});
    assert(headRes.status===200,'HEAD 200 değil');

    // 9) Rotated cursor header test (yalnızca secondary secret varsa)
    if(process.env.CURSOR_SECRET_SECONDARY){
      const rotGen = await authFetch('/api/user/_test/generate-rotated-cursor?score=999999&id=0', adminToken);
      if(rotGen.status===200){
        const rotJson = await rotGen.json();
        const rc = rotJson.cursor;
        const rotRes = await authFetch('/api/user/leaderboard?limit=3&cursor='+encodeURIComponent(rc), token);
        if(rotRes.status===200){
          assert(rotRes.headers.get('x-cursor-rotation')==='1','Rotation header yok');
        }
      }
    }

    console.log('LEADERBOARD_TEST_SUCCESS');
    process.exit(0);
  } catch(e){
    console.error('LEADERBOARD_TEST_FAIL', e);
    process.exit(1);
  }
})();

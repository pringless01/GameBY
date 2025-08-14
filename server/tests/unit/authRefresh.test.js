import assert from 'assert';
import '../migrations/run-migrations.js';

const BASE = 'http://localhost:3000';
const sleep = ms => new Promise(r=>setTimeout(r,ms));

(async () => {
  await import('../../server.js');
  await sleep(500);
  const username = 'ruser' + Date.now();
  await fetch(BASE+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})});
  const loginRes = await fetch(BASE+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})});
  const loginBody = await loginRes.json();
  assert(loginBody.token, 'access token yok');
  const cookie = loginRes.headers.get('set-cookie');
  assert(cookie && cookie.includes('refreshToken='), 'refresh cookie yok');
  const refreshRes = await fetch(BASE+'/api/auth/refresh',{method:'POST',headers:{Cookie: cookie}});
  const refreshBody = await refreshRes.json();
  assert(refreshBody.token, 'refresh çalışmadı');
  const newCookie = refreshRes.headers.get('set-cookie');
  assert(newCookie && newCookie.includes('refreshToken='), 'yeni cookie yok');
  const reuse = await fetch(BASE+'/api/auth/refresh',{method:'POST',headers:{Cookie: cookie}});
  assert(reuse.status === 401, 'revoked token kabul edildi');
  console.log('auth refresh ok');
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });

import assert from 'assert';

async function startServer(){
  process.env.LB_RATE_MAX='500';
  await import('../../server.js');
  await new Promise(r=>setTimeout(r,400));
}

async function registerAndLogin(role='admin'){
  const u = 'opsadmin_'+Math.random().toString(36).slice(2,8);
  const email = u+'@example.com';
  const password = 'Passw0rd!';
  await fetch('http://localhost:3000/api/auth/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:u,email,password,roles:[role]})});
  const lr = await fetch('http://localhost:3000/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({identity:u,password})});
  const lj = await lr.json();
  return lj.token;
}

(async () => {
  await startServer();
  const token = await registerAndLogin();
  // disabled by default -> 403
  const r = await fetch('http://localhost:3000/api/ops/trigger',{method:'POST',headers:{'authorization':'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({goal:'noop'})});
  assert.strictEqual(r.status, 403);

  console.log('ops trigger tests passed');
  process.exit(0);
})().catch(e=>{ console.error(e); process.exit(1); });

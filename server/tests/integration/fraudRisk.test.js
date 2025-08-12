import assert from 'assert';
import fetch from 'node-fetch';

const BASE = 'http://localhost:3000';
const sleep = (ms)=> new Promise(r=>setTimeout(r,ms));
async function startServer(){ await import('../../server.js'); await sleep(400); }
async function post(path, body, headers={}){ const r = await fetch(BASE+path,{ method:'POST', headers:{'Content-Type':'application/json', ...headers}, body: JSON.stringify(body)}); return { status:r.status, json: await r.json() }; }
async function get(path, token){ const r = await fetch(BASE+path,{ headers: token? { Authorization: 'Bearer '+token } : {} }); return { status:r.status, text: await r.text() }; }

(async ()=>{
  try {
  process.env.TRUSTED_PROXY_COUNT='1';
  const adminName = 'admin_'+Date.now();
  process.env.DEV_ADMIN_USERNAME = adminName;
    await startServer();
  // admin kullanıcı (dev: DEV_ADMIN_USERNAME ile admin rol atanır)
  await post('/api/auth/register',{ username: adminName, password:'p' });
  const login = await post('/api/auth/login',{ username: adminName, password:'p', deviceFingerprint:'dev-1' }, { 'X-Forwarded-For': '203.0.113.10, 10.0.0.1' });
    assert.equal(login.status, 200);
    const token = login.json.token;

    // aynı fingerprint ile ikinci kullanıcı
    const u2='u2_'+Date.now();
  await post('/api/auth/register',{ username:u2, password:'p' });
  await post('/api/auth/login',{ username:u2, password:'p', deviceFingerprint:'dev-1' }, { 'X-Forwarded-For': '203.0.113.10, 10.0.0.1' });

    // risk score endpoint
    const r = await get('/api/user/fraud/risk-score', token);
    assert.equal(r.status, 200);

    // prom gauge
    const prom = await get('/api/user/leaderboard/metrics/prom', token);
    assert.equal(prom.status, 200);
    assert(/fraud_risk_score_avg \d+(\.\d+)?/m.test(prom.text), 'fraud_risk_score_avg yok');

    console.log('FRAUD_RISK_TEST_SUCCESS');
    process.exit(0);
  } catch(e){ console.error('FRAUD_RISK_TEST_FAIL', e); process.exit(1); }
})();

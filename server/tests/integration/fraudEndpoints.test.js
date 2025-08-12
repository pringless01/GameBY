import assert from 'assert';
import fetch from 'node-fetch';

const BASE = 'http://localhost:3000';
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function startServer(){
  process.env.LB_RATE_MAX='500';
  await import('../../server.js');
  await sleep(400);
}
async function post(path, body){ const r = await fetch(BASE+path,{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)}); return { status:r.status, json: await r.json(), headers:r.headers }; }
async function get(path, token){ const r = await fetch(BASE+path,{ headers: token? { Authorization: 'Bearer '+token } : {} }); return { status:r.status, text: await r.text(), headers:r.headers }; }

(async ()=>{
  try {
    await startServer();
    // admin kullanıcı oluştur ve login ol
    const username = 'admin'; const password = 'pass123';
    await post('/api/auth/register',{ username, password });
    const login = await post('/api/auth/login',{ username, password, deviceFingerprint:'dev-1' });
    assert.equal(login.status, 200);
    const token = login.json.token;

    // aynı device ile ikinci kullanıcı login olsun (multi-account sinyali)
    const u2 = 'u2_'+Date.now();
    await post('/api/auth/register',{ username:u2, password:'p' });
    await post('/api/auth/login',{ username:u2, password:'p', deviceFingerprint:'dev-1' });

    const ips = await get('/api/user/fraud/multiuser-ips', token);
    assert.equal(ips.status, 200);
    const ipsJson = JSON.parse(ips.text);
    assert.ok(Array.isArray(ipsJson.multiUserIps));

    const devs = await get('/api/user/fraud/multiuser-devices', token);
    assert.equal(devs.status, 200);
    const devsJson = JSON.parse(devs.text);
    assert.ok(Array.isArray(devsJson.multiUserDevices));

    // Prometheus fraud metrikleri
    const prom = await get('/api/user/leaderboard/metrics/prom', token);
    assert.equal(prom.status, 200);
    const text = prom.text;
    assert(/fraud_multiuser_ip_count \d+/m.test(text),'fraud_multiuser_ip_count yok');
    assert(/fraud_multiuser_device_count \d+/m.test(text),'fraud_multiuser_device_count yok');

    console.log('FRAUD_ENDPOINTS_TEST_SUCCESS');
    process.exit(0);
  } catch(e){
    console.error('FRAUD_ENDPOINTS_TEST_FAIL', e);
    process.exit(1);
  }
})();

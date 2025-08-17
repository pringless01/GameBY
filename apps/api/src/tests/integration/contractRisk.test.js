// N013: Contract/Barter Güven Katmanı – cancel spam risk olayı ve Prometheus export doğrulaması
import assert from 'assert';
import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function httpRequest(options, body=null){
  return new Promise((resolve,reject)=>{
  const req = http.request(options,res=>{
      let data='';
      res.on('data',d=>data+=d);
      res.on('end',()=>resolve({ status:res.statusCode, body:data }));
    });
    req.on('error',reject);
    if(body){ req.write(body); }
    req.end();
  });
}

function get(url, headers={}){
  const u = new URL(url);
  return httpRequest({ hostname:u.hostname, port:u.port, path:u.pathname+u.search, method:'GET', headers });
}
function post(url, json, headers={}){
  const u = new URL(url);
  const body = JSON.stringify(json);
  return httpRequest({ hostname:u.hostname, port:u.port, path:u.pathname+u.search, method:'POST', headers: { 'Content-Type':'application/json','Content-Length':Buffer.byteLength(body), ...headers } }, body);
}

(async () => {
  let proc; let tokenA; let tokenB; let adminToken; const BASE='http://localhost:4567';
  try {
    proc = spawn('node',['server.js'],{ cwd: path.resolve(__dirname,'..','..'), env: { ...process.env, JWT_SECRET:'dev-temp-long-secret-1234567890123456', CURSOR_SECRET:'cursor-temp-long-secret-12345678', PORT:'4567', DEV_ADMIN_USERNAME:'admin_contract_risk' } });
    // wait server
    await new Promise((resolve,reject)=>{
      const to = setTimeout(()=>reject(new Error('server_timeout')),12000);
      proc.stdout.on('data',async d=>{
        if(d.toString().includes('Server listening')){ clearTimeout(to); resolve(); }
      });
      proc.stderr.on('data',()=>{});
    });
    // register users
  const uA = 'riskA'+Date.now();
  const uB = 'riskB'+Date.now();
  await post(BASE+'/api/auth/register',{ username: uA, password:'pw' });
  await post(BASE+'/api/auth/register',{ username: uB, password:'pw' });
  const loginA = await post(BASE+'/api/auth/login',{ username: uA, password:'pw' });
  const loginB = await post(BASE+'/api/auth/login',{ username: uB, password:'pw' });
    tokenA = JSON.parse(loginA.body||'{}').token;
    tokenB = JSON.parse(loginB.body||'{}').token;
    assert.ok(tokenA && tokenB, 'tokens missing');
    // admin
  await post(BASE+'/api/auth/register',{ username:'admin_contract_risk', password:'pw' });
  const adminLogin = await post(BASE+'/api/auth/login',{ username:'admin_contract_risk', password:'pw' });
    adminToken = JSON.parse(adminLogin.body||'{}').token;

    // get ids
    async function me(tok){ const r = await get(BASE+'/api/user/me',{ Authorization:'Bearer '+tok }); return JSON.parse(r.body||'{}'); }
    const meA = await me(tokenA); const meB = await me(tokenB);

    // Repeat create->cancel by creator to trigger cancel spam
    for(let i=0;i<5;i++){
      const create = await post(BASE+'/api/contracts',{ counterparty_id: meB.user.id, subject:'Risk', amount:1, type:'trade' }, { Authorization:'Bearer '+tokenA });
      const c = JSON.parse(create.body||'{}').contract;
      assert.ok(c && c.id, 'contract create failed');
      const cancel = await post(BASE+`/api/contracts/${c.id}/action`,{ action:'cancel' }, { Authorization:'Bearer '+tokenA });
      const cj = JSON.parse(cancel.body||'{}');
      assert.equal(cj.contract.status,'CANCELLED','cancel failed');
    }

    // Now fetch prom metrics through admin endpoint and check contract_cancel_spam count present
    const prom = await get(BASE+'/api/user/leaderboard/metrics/prom', { Authorization:'Bearer '+adminToken });
    assert.equal(prom.status,200,'prom 200');
    const body = prom.body || '';
    // Should include reason-labeled counter for contract_cancel_spam (generic reputation_event_total lines)
    assert.ok(body.includes('reputation_event_total{reason="contract_cancel_spam"}'),'missing cancel_spam counter');

    console.log('CONTRACT_RISK_TEST_SUCCESS');
    process.exit(0);
  } catch(e){
    console.error('CONTRACT_RISK_TEST_FAIL', e);
    process.exit(1);
  } finally { if(proc) proc.kill(); }
})();

import assert from 'assert';
import http from 'http';
import { spawn } from 'child_process';
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

// Basit server bootstrap (assumes JWT for admin not strictly required if bypass or create admin user) – here we skip full auth and just check format after start.
// NOTE: For simplicity this test just starts the server and hits metrics with a placeholder token (server currently checks roles; skipping deep auth wiring for brevity).

// Mocha yok; diğer integration testleri gibi IIFE pattern.
(async () => {
  let proc; let token; let failed = false;
  try {
    proc = spawn('node',['server.js'],{ cwd: path.resolve(__dirname,'..','..'), env: { ...process.env, JWT_SECRET:'dev-temp-long-secret-1234567890123456', CURSOR_SECRET:'cursor-temp-long-secret-12345678', PORT:'3456', DEV_ADMIN_USERNAME:'admin_prom' } });
    await new Promise((resolve,reject)=>{
      const to = setTimeout(()=>reject(new Error('server_timeout')),12000);
      proc.stdout.on('data',async d=>{
        const line = d.toString();
        if(line.includes('Server listening')){
          try {
            await post('http://localhost:3456/api/auth/register',{ username:'admin_prom', password:'pw' });
            const login = await post('http://localhost:3456/api/auth/login',{ username:'admin_prom', password:'pw' });
            const parsed = JSON.parse(login.body||'{}');
            token = parsed.token;
          } catch(e){ }
          clearTimeout(to); resolve();
        }
      });
      proc.stderr.on('data',()=>{});
    });
    assert.ok(token,'Token missing');
    const r = await get('http://localhost:3456/api/user/leaderboard/metrics/prom', { Authorization:'Bearer '+token });
    assert.equal(r.status,200,'Expected 200');
    const body = r.body;
    assert.ok(body.includes('reputation_events_contract_default_total'),'missing contract_default counter');
    assert.ok(body.includes('reputation_events_fraud_flag_total'),'missing fraud_flag counter');
    assert.ok(body.includes('reputation_rules_info'),'missing rules info metric');
    console.log('REPUTATION_PROM_NEW_METRICS_SUCCESS');
    process.exit(0);
  } catch(e){
    failed = true;
    console.error('REPUTATION_PROM_NEW_METRICS_FAIL', e);
    process.exit(1);
  } finally { if(proc) proc.kill(); }
})();

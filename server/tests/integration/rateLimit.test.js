// Rate limit ve trust_updated event testi
import assert from 'assert';
import http from 'http';

import fetch from 'node-fetch';
import { io as Client } from 'socket.io-client';
import '../migrations/run-migrations.js';

const BASE = 'http://localhost:3000';
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

async function startServer(){ await import('../../server.js'); await sleep(400); }
async function register(username){ const res = await fetch(BASE + '/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})}); return res.json(); }
async function login(username){ const res = await fetch(BASE + '/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})}); return res.json(); }
async function authFetch(path, token, options={}){ return fetch(BASE+path,{...options,headers:{...(options.headers||{}),'Content-Type':'application/json','Authorization':'Bearer '+token}}); }

(async ()=>{
  try {
    await startServer();
    const u = 'rluser'+Date.now();
    await register(u);
    const l = await login(u);
    // Rate limit test (login 11th attempt farklı şifre ile)
    let lastStatus = 0;
    for(let i=0;i<11;i++){
      const r = await fetch(BASE + '/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:(i===0?'pass123':'wrong')})});
      lastStatus = r.status;
      if(i===0) assert(r.status===200,'İlk login başarısız');
    }
    assert(lastStatus===429,'Rate limit devreye girmedi');

    // trust_updated event testi
    const socket = Client(BASE,{transports:['websocket'], auth:{ token: l.token }});
    const events=[];
    socket.on('trust_updated', d => events.push(d));
    await new Promise(resolve => socket.on('connect', resolve));
    // trust güncelle (kendi user adına)
    const up = await authFetch('/api/user/trust/update', l.token,{method:'POST',body:JSON.stringify({username:u,delta:5,reason:'test_inc'})});
    assert(up.status===200,'Trust update 200 değil');
    for(let i=0;i<10 && events.length===0;i++) await sleep(150);
    assert(events.length>0,'trust_updated event gelmedi');
    console.log('RATE_LIMIT_TEST_SUCCESS');
    process.exit(0);
  } catch(e){
    console.error('RATE_LIMIT_TEST_FAIL', e);
    process.exit(1);
  }
})();

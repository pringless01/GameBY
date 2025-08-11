// insufficient_funds scenario for priced contract completion
import assert from 'assert';
import fetch from 'node-fetch';
import { io as Client } from 'socket.io-client';
import '../migrations/run-migrations.js';

const BASE='http://localhost:3000';
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
async function startServer(){ await import('../../server.js'); await sleep(400); }
async function register(username){ const res = await fetch(BASE + '/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})}); return res.json(); }
async function login(username){ const res = await fetch(BASE + '/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})}); return res.json(); }
async function authFetch(path, token, options={}){ return fetch(BASE+path,{...options,headers:{...(options.headers||{}),'Content-Type':'application/json','Authorization':'Bearer '+token}}); }

(async ()=>{
  try {
    await startServer();
    const u1='fundA'+Date.now();
    const u2='fundB'+Date.now();
    await register(u1); await register(u2);
    const l1=await login(u1); const l2=await login(u2);
    // me => resources check
    async function me(tok){ const r=await authFetch('/api/user/me', tok); return r.json(); }
    const me1=await me(l1.token); const me2=await me(l2.token);
    // create priced contract high price (creator=me1 pays on completion)
    const price = (me1.user.resources.money || 50) + 9999; // unreachable
    const createRes = await authFetch('/api/contracts', l1.token, {method:'POST', body: JSON.stringify({counterparty_id: me2.user.id, subject:'Pahalı', amount:1, type:'trade', price})});
    const created = await createRes.json();
    assert(created.contract && created.contract.price===price, 'Kontrat fiyatlı oluşmadı');
    // accept by counterparty
    const acceptRes = await authFetch(`/api/contracts/${created.contract.id}/action`, l2.token, {method:'POST', body: JSON.stringify({action:'accept'})});
    const accepted = await acceptRes.json();
    assert(accepted.contract.status==='ACTIVE','Accept başarısız');
    // attempt complete by creator -> should fail insufficient_funds (400)
    const completeRes = await authFetch(`/api/contracts/${created.contract.id}/action`, l1.token, {method:'POST', body: JSON.stringify({action:'complete'})});
    assert(completeRes.status===400,'Beklenen 400 insufficient_funds değil');
    const errJson = await completeRes.json();
    assert(errJson.error==='Yetersiz bakiye','Hata mesajı farklı');
    console.log('INSUFFICIENT_FUNDS_TEST_SUCCESS');
    process.exit(0);
  } catch(e){
    console.error('INSUFFICIENT_FUNDS_TEST_FAIL', e);
    process.exit(1);
  }
})();

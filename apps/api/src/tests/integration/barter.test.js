// Barter contract flow + insufficient_resources + dynamic trust reward estimation
import assert from 'assert';

import fetch from 'node-fetch';
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
    const u1='barterA'+Date.now();
    const u2='barterB'+Date.now();
    await register(u1); await register(u2);
    const l1=await login(u1); const l2=await login(u2);
    async function me(tok){ const r=await authFetch('/api/user/me', tok); return r.json(); }
    const me1=await me(l1.token); const me2=await me(l2.token);

    // 1) Barter kontrat oluştur (odun ver, tahıl al)
    const body={counterparty_id: me2.user.id, subject:'BarterTest', amount:5, type:'barter', price:10, currency:'TL',
      creator_give_wood:2, counter_give_grain:3 };
    const createRes = await authFetch('/api/contracts', l1.token, {method:'POST', body: JSON.stringify(body)});
    assert(createRes.status===200,'Barter contract create fail');
    const created=await createRes.json();

    // 2) Kabul
    const acceptRes = await authFetch(`/api/contracts/${created.contract.id}/action`, l2.token, {method:'POST', body: JSON.stringify({action:'accept'})});
    const accepted=await acceptRes.json();
    assert(accepted.contract.status==='ACTIVE','Barter accept fail');

    // 3) Tamamla
    const completeRes = await authFetch(`/api/contracts/${created.contract.id}/action`, l1.token, {method:'POST', body: JSON.stringify({action:'complete'})});
    const completed=await completeRes.json();
    assert(completed.contract.status==='COMPLETED','Barter complete fail');

    // 4) Kaynak transfer doğrula
    const after1=await me(l1.token); const after2=await me(l2.token);
    // u1 odun -2, u2 odun +2, u2 tahıl -3, u1 tahıl +3, price akışı: u1 -> u2 (10)
    assert(after1.user.resources.wood === me1.user.wood - 2, 'u1 wood mismatch');
    assert(after2.user.resources.wood === me2.user.wood + 2, 'u2 wood mismatch');
    assert(after1.user.resources.grain === me1.user.grain + 3, 'u1 grain mismatch');
    assert(after2.user.resources.grain === me2.user.grain - 3, 'u2 grain mismatch');
    assert(after1.user.resources.money === me1.user.money - 10, 'u1 money mismatch');
    assert(after2.user.resources.money === me2.user.money + 10, 'u2 money mismatch');

    // 5) insufficient_resources senaryosu
    const badBody={counterparty_id: me2.user.id, subject:'Bad', amount:1, type:'barter', price:0, currency:'TL', creator_give_business:9999};
    const badCreate = await authFetch('/api/contracts', l1.token, {method:'POST', body: JSON.stringify(badBody)});
    const badCreated = await badCreate.json();
    assert(badCreate.status===200,'Bad kontrat create');
    const badAccept = await authFetch(`/api/contracts/${badCreated.contract.id}/action`, l2.token, {method:'POST', body: JSON.stringify({action:'accept'})});
    const badAccepted = await badAccept.json();
    assert(badAccepted.contract.status==='ACTIVE','Bad accept');
    const badComplete = await authFetch(`/api/contracts/${badCreated.contract.id}/action`, l1.token, {method:'POST', body: JSON.stringify({action:'complete'})});
    assert(badComplete.status===400,'Beklenen insufficient_resources 400 değil');
    const badErr = await badComplete.json();
    assert(badErr.error==='Kaynak yetersiz','Hata mesajı farklı: '+badErr.error);

    console.log('BARTER_TEST_SUCCESS');
    process.exit(0);
  } catch(e){
    console.error('BARTER_TEST_FAIL', e);
    process.exit(1);
  }
})();

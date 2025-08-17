// Dynamic trust daily cap test
import assert from 'assert';

import fetch from 'node-fetch';
import '../migrations/run-migrations.js';

const BASE='http://localhost:3000';
const DAILY_CAP = 40; // should mirror service constant
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
async function startServer(){ await import('../../server.js'); await sleep(400); }
async function register(username){ const res = await fetch(BASE + '/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})}); return res.json(); }
async function login(username){ const res = await fetch(BASE + '/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})}); return res.json(); }
async function authFetch(path, token, options={}){ return fetch(BASE+path,{...options,headers:{...(options.headers||{}),'Content-Type':'application/json','Authorization':'Bearer '+token}}); }

(async ()=>{
  try {
    await startServer();
    // Ana kullanıcı
    const mainUser = 'capMain'+Date.now();
    await register(mainUser);
    const mainLogin = await login(mainUser);
    assert(mainLogin.token, 'Main token yok');
    // Karşı taraflar (en az 9 farklı kullanıcı, pair limit=3 => her farklı kullanıcı 1 ödül)
    const counterparties=[];
    for(let i=0;i<9;i++){ const u='capC'+i+Date.now(); await register(u); const l=await login(u); counterparties.push(l); }

    async function me(){ const r=await authFetch('/api/user/me', mainLogin.token); return r.json(); }
    const startState = await me();
    const startTrust = startState.user.trust_score;

    let totalGains=0;
    // Her bir farklı kullanıcı ile 1 kontrat (amount * price yüksek tutarak ~5 trust)
    for(let i=0;i<8;i++){
      const cpLogin = counterparties[i];
      // create contract (creator = main)
      const createRes = await authFetch('/api/contracts', mainLogin.token,{method:'POST', body: JSON.stringify({counterparty_id: (await authFetch('/api/user/me', cpLogin.token).then(r=>r.json())).user.id, subject:'CapTest'+i, amount:50, type:'trade', price:100})});
      assert(createRes.status===200, 'Create fail '+i);
      const created = await createRes.json();
      // accept by counterparty
      const acceptRes = await authFetch(`/api/contracts/${created.contract.id}/action`, cpLogin.token,{method:'POST', body: JSON.stringify({action:'accept'})});
      assert(acceptRes.status===200, 'Accept fail '+i);
      // complete by main
      const completeRes = await authFetch(`/api/contracts/${created.contract.id}/action`, mainLogin.token,{method:'POST', body: JSON.stringify({action:'complete'})});
      assert(completeRes.status===200, 'Complete fail '+i);
      const after = await me();
      const gained = after.user.trust_score - (startTrust + totalGains);
      assert(gained >= 0, 'Negatif artış');
      totalGains = after.user.trust_score - startTrust;
      if(totalGains >= DAILY_CAP) break; // cap'e ulaştık
    }

    assert(totalGains <= DAILY_CAP, 'Cap aşıldı');
    // Cap'e tam ulaştıysak ek bir kontrat daha deneyelim (farklı yeni kullanıcı) => ekstra artış olmamalı
    const beforeExtra = await me();
    const beforeTrust = beforeExtra.user.trust_score;
    const extraLogin = counterparties[8];
    // extra contract
    const extraCreate = await authFetch('/api/contracts', mainLogin.token,{method:'POST', body: JSON.stringify({counterparty_id:(await authFetch('/api/user/me', extraLogin.token).then(r=>r.json())).user.id, subject:'CapExtra', amount:50, type:'trade', price:100})});
    assert(extraCreate.status===200,'Extra create fail');
    const extraCreated=await extraCreate.json();
    const extraAccept = await authFetch(`/api/contracts/${extraCreated.contract.id}/action`, extraLogin.token,{method:'POST', body: JSON.stringify({action:'accept'})});
    assert(extraAccept.status===200,'Extra accept fail');
    const extraComplete = await authFetch(`/api/contracts/${extraCreated.contract.id}/action`, mainLogin.token,{method:'POST', body: JSON.stringify({action:'complete'})});
    assert(extraComplete.status===200,'Extra complete fail');
    const afterExtra = await me();
    const finalGain = afterExtra.user.trust_score - beforeTrust;
    // finalGain 0 veya çok küçük (ör: rounding farkı olmamalı) beklenir
    assert(finalGain === 0, 'Cap sonrası trust yine arttı: '+finalGain);

    // /trust/daily-earned endpoint doğrula
    const dailyEarnedRes = await authFetch('/api/user/trust/daily-earned', mainLogin.token);
    if(dailyEarnedRes.status===200){
      const daily = await dailyEarnedRes.json();
      assert(daily.earned <= DAILY_CAP, 'Endpoint earned cap aşım');
      assert(daily.remaining === 0, 'Cap dolu değil');
    }

    console.log('TRUST_CAP_TEST_SUCCESS');
    process.exit(0);
  } catch(e){
    console.error('TRUST_CAP_TEST_FAIL', e);
    process.exit(1);
  }
})();

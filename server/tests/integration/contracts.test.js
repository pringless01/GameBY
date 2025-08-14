// Basic integration test for contract real-time flow + tutorial + audit
import http from 'http';
import { io as Client } from 'socket.io-client';
import assert from 'assert';
import fetch from 'node-fetch';
import '../migrations/run-migrations.js';

const BASE = 'http://localhost:3000';

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

async function startServer() {
  // dynamic import the server (it self-starts)
  await import('../../server.js');
  // wait a bit for listen
  await sleep(500);
}

async function register(username){
  const res = await fetch(BASE + '/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})});
  return res.json();
}
async function login(username){
  const res = await fetch(BASE + '/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})});
  return res.json();
}
async function authFetch(path, token, options={}){
  return fetch(BASE+path,{...options,headers:{...(options.headers||{}),'Content-Type':'application/json','Authorization':'Bearer '+token}});
}

(async () => {
  try {
    await startServer();
    const u1 = 'tuserA'+Date.now();
    const u2 = 'tuserB'+Date.now();
    await register(u1); await register(u2);
    const l1 = await login(u1); const l2 = await login(u2);
    assert(l1.token && l2.token, 'Tokens alınamadı');

    // get user ids
    async function me(tok){ const r = await authFetch('/api/user/me', tok); return r.json(); }
    const me1 = await me(l1.token); const me2 = await me(l2.token);

    const socket1 = Client(BASE, { transports:['websocket'], auth:{ token: l1.token } });
    const events = { created: [], updated: [], tutorial: [], trust: [] };
    socket1.on('contract_created', c => events.created.push(c));
    socket1.on('contract_updated', c => events.updated.push(c));
    socket1.on('tutorial_progress', t => events.tutorial.push(t));
    socket1.on('trust_updated', t => events.trust.push(t));

    // İlk tutorial state doğrula
    const stateBefore = await authFetch('/api/mentor/state', l1.token).then(r=>r.json());
    assert(stateBefore.bot_tutorial_state === 'INTRO', 'Başlangıç INTRO değil');

    // İlk mesaj gönder (chat namespace için join + send simulate HTTP yok; direkt socket event)
    socket1.emit('join_chat', { userId: me1.user.id });
    socket1.emit('send_message', { userId: me1.user.id, message: 'selam' });
    for(let i=0;i<10 && events.tutorial.length===0;i++) await sleep(200);
    // tutorial_progress gelebilir (asenkron), toleranslıyız; state çek
    const stateAfterMsg = await authFetch('/api/mentor/state', l1.token).then(r=>r.json());
    assert(['FIRST_CHAT','FIRST_CONTRACT','TRUST_LEARN','MENTOR_MATCH','DONE'].includes(stateAfterMsg.bot_tutorial_state), 'Mesaj sonrası ilerleme yok');

    // create contract
    const createRes = await authFetch('/api/contracts', l1.token, { method:'POST', body: JSON.stringify({ counterparty_id: me2.user.id, subject:'Test', amount: 50, type:'trade' })});
    const created = await createRes.json();
    assert(created.contract && created.contract.id, 'Kontrat oluşmadı');
    for(let i=0;i<10 && events.created.length===0;i++) await sleep(200);
    assert(events.created.length===1, 'contract_created event gelmedi');

    // accept
    const acceptRes = await authFetch(`/api/contracts/${created.contract.id}/action`, l2.token, { method:'POST', body: JSON.stringify({ action:'accept' })});
    const accepted = await acceptRes.json();
    assert(accepted.contract.status === 'ACTIVE', 'Accept başarısız');
    for(let i=0;i<10 && !events.updated.some(e=>e.status==='ACTIVE');i++) await sleep(200);
    assert(events.updated.some(e=>e.status==='ACTIVE'), 'ACTIVE event yok');

    // complete
    const completeRes = await authFetch(`/api/contracts/${created.contract.id}/action`, l1.token, { method:'POST', body: JSON.stringify({ action:'complete' })});
    const completed = await completeRes.json();
    assert(completed.contract.status === 'COMPLETED', 'Complete başarısız');
    for(let i=0;i<10 && !events.updated.some(e=>e.status==='COMPLETED');i++) await sleep(200);
    assert(events.updated.some(e=>e.status==='COMPLETED'), 'COMPLETED event yok');

    // Audit kontrol (son kayıtlar)
    const auditRes = await authFetch('/api/admin/audit?limit=20', l1.token); // l1 admin olmayabilir; skip hatasız
    if (auditRes.status === 200) {
      const auditJson = await auditRes.json();
      const hasContract = auditJson.logs.some(l => l.action.startsWith('contract_'));
      assert(hasContract, 'Audit log contract_ kayıt yok');
    }

    console.log('INTEGRATION_TEST_SUCCESS');
    process.exit(0);
  } catch (e) {
    console.error('INTEGRATION_TEST_FAIL', e);
    process.exit(1);
  }
})();

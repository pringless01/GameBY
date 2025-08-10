// Basic integration test for contract real-time flow
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

    const socket1 = Client(BASE, { transports:['websocket'] });
    const events = { created: [], updated: [] };
    socket1.on('contract_created', c => events.created.push(c));
    socket1.on('contract_updated', c => events.updated.push(c));

    // create contract
    const createRes = await authFetch('/api/contracts', l1.token, { method:'POST', body: JSON.stringify({ counterparty_id: me2.user.id, subject:'Test', amount: 50, type:'trade' })});
    const created = await createRes.json();
    assert(created.contract && created.contract.id, 'Kontrat oluşmadı');

    // wait for socket event
    for(let i=0;i<10 && events.created.length===0;i++) await sleep(200);
    assert(events.created.length===1, 'contract_created event gelmedi');

    // accept with user2
    const acceptRes = await authFetch(`/api/contracts/${created.contract.id}/action`, l2.token, { method:'POST', body: JSON.stringify({ action:'accept' })});
    const accepted = await acceptRes.json();
    assert(accepted.contract.status === 'ACTIVE', 'Accept başarısız');
    for(let i=0;i<10 && events.updated.filter(e=>e.status==='ACTIVE').length===0;i++) await sleep(200);
    assert(events.updated.some(e=>e.status==='ACTIVE'), 'contract_updated ACTIVE event yok');

    // complete
    const completeRes = await authFetch(`/api/contracts/${created.contract.id}/action`, l1.token, { method:'POST', body: JSON.stringify({ action:'complete' })});
    const completed = await completeRes.json();
    assert(completed.contract.status === 'COMPLETED', 'Complete başarısız');
    for(let i=0;i<10 && events.updated.filter(e=>e.status==='COMPLETED').length===0;i++) await sleep(200);
    assert(events.updated.some(e=>e.status==='COMPLETED'), 'contract_completed event yok');

    console.log('INTEGRATION_TEST_SUCCESS');
    process.exit(0);
  } catch (e) {
    console.error('INTEGRATION_TEST_FAIL', e);
    process.exit(1);
  }
})();

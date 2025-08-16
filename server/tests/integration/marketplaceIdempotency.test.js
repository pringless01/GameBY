import assert from 'assert';

import fetch from 'node-fetch';

import { initDb } from '../../config/database.js';
import '../migrations/run-migrations.js';

const BASE = 'http://localhost:3000';
const sleep = ms => new Promise(r=>setTimeout(r,ms));

(async()=>{
  await import('../../server.js');
  await sleep(500);
  const db = await initDb();
  await db.exec('DELETE FROM users');
  await db.exec('DELETE FROM idempotency_keys');
  const seller = 'seller'+Date.now();
  const buyer = 'buyer'+Date.now();
  await fetch(BASE+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:seller,password:'pass'})});
  await fetch(BASE+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:buyer,password:'pass'})});
  const sLogin = await (await fetch(BASE+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:seller,password:'pass'})})).json();
  const bLogin = await (await fetch(BASE+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:buyer,password:'pass'})})).json();
  const sToken = sLogin.token; const bToken = bLogin.token;
  // list item
  await fetch(BASE+'/api/marketplace/list',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+sToken,'X-Idempotency-Key':'list'+Date.now()},body:JSON.stringify({item:'potion',price:10})});
  let listRes = await fetch(BASE+'/api/marketplace',{headers:{'Authorization':'Bearer '+bToken}});
  let listJson = await listRes.json();
  const itemId = listJson.listings[0].id;
  // double buy with same key
  const buyKey = 'buy'+Date.now();
  const first = await fetch(BASE+'/api/marketplace/buy/'+itemId,{method:'POST',headers:{'Authorization':'Bearer '+bToken,'X-Idempotency-Key':buyKey}});
  const second = await fetch(BASE+'/api/marketplace/buy/'+itemId,{method:'POST',headers:{'Authorization':'Bearer '+bToken,'X-Idempotency-Key':buyKey}});
  assert(first.status===200 && second.status===200,'idempotent buy fail');
  // concurrent buy
  await fetch(BASE+'/api/marketplace/list',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+sToken},body:JSON.stringify({item:'gem',price:5})});
  listRes = await fetch(BASE+'/api/marketplace',{headers:{'Authorization':'Bearer '+bToken}});
  listJson = await listRes.json();
  const itemId2 = listJson.listings.find(l=>l.item==='gem').id;
  const promises = [];
  for(let i=0;i<10;i++) promises.push(fetch(BASE+'/api/marketplace/buy/'+itemId2,{method:'POST',headers:{'Authorization':'Bearer '+bToken}}));
  const results = await Promise.all(promises);
  const success = results.filter(r=>r.status===200).length;
  assert(success===1,'concurrent buy should only succeed once');
  console.log('marketplace idempotency ok');
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});

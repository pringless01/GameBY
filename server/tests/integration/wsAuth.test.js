import assert from 'assert';

import { io as Client } from 'socket.io-client';
import '../migrations/run-migrations.js';

const BASE = 'http://localhost:3000';
const sleep = ms => new Promise(r=>setTimeout(r,ms));

(async () => {
  await import('../../server.js');
  await sleep(500);
  const username = 'wuser' + Date.now();
  await fetch(BASE+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})});
  const loginRes = await fetch(BASE+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})});
  const loginBody = await loginRes.json();
  const token = loginBody.token;
  assert(token, 'login token yok');
  const socket = Client(BASE, { transports:['websocket'], auth:{ token: 'Bearer '+token } });
  const received = [];
  socket.on('new_message', m=>received.push(m));
  await new Promise((res, rej)=>{ socket.on('connect', res); socket.on('connect_error', rej); });
  socket.emit('join_chat');
  socket.emit('send_message', { message:'selam' });
  for(let i=0;i<10 && received.length===0;i++) await sleep(200);
  assert(received.length === 1, 'mesaj alınmadı');
  socket.close();
  const badSocket = Client(BASE, { transports:['websocket'] });
  await new Promise(res=>{ badSocket.on('connect_error', err=>{ assert(err.data && err.data.code===4401); res(); }); });
  badSocket.close();
  console.log('ws auth ok');
  process.exit(0);
})().catch(err=>{ console.error(err); process.exit(1); });

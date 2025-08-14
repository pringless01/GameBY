import { io as Client } from 'socket.io-client';
import assert from 'assert';
import '../migrations/run-migrations.js';

const BASE = 'http://localhost:3000';
const sleep = ms => new Promise(r=>setTimeout(r,ms));

(async () => {
  await import('../../server.js');
  await sleep(300);
  const username = 'xss'+Date.now();
  await fetch(BASE+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})});
  const loginRes = await fetch(BASE+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})});
  const { token } = await loginRes.json();
  const socket = Client(BASE,{transports:['websocket'],auth:{token:'Bearer '+token}});
  await new Promise((res, rej)=>{ socket.on('connect', res); socket.on('connect_error', rej); });
  const recv = [];
  socket.on('new_message', m=>recv.push(m));
  socket.emit('join_chat');
  socket.emit('send_message',{message:'<b>hi</b><script>alert(1)</script>'});
  for(let i=0;i<10 && recv.length===0;i++) await sleep(200);
  assert(recv.length===1,'mesaj gelmedi');
  assert(!recv[0].message.includes('<script>'),'script sanitize edilmedi');
  assert(recv[0].message === '<b>hi</b>','sanitize edilen mesaj beklenmedik');
  socket.close();
  console.log('chat sanitize ok');
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});

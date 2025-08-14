process.env.CHAT_FLOOD_WINDOW_MS='1000';
process.env.CHAT_FLOOD_MAX_MESSAGES='3';
import { io as Client } from 'socket.io-client';
import assert from 'assert';
import '../migrations/run-migrations.js';
import { initDb } from '../../config/database.js';

const BASE = 'http://localhost:3000';
const sleep = ms => new Promise(r=>setTimeout(r,ms));

(async () => {
  await import('../../server.js');
  await sleep(300);
  const username = 'spam'+Date.now();
  await fetch(BASE+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})});
  const loginRes = await fetch(BASE+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})});
  const { token } = await loginRes.json();
  const socket = Client(BASE,{transports:['websocket'],auth:{token:'Bearer '+token}});
  await new Promise((res, rej)=>{ socket.on('connect', res); socket.on('connect_error', rej); });
  const recv = [];
  socket.on('new_message', m=>recv.push(m));
  socket.emit('join_chat');
  socket.emit('send_message',{message:'m1'});
  socket.emit('send_message',{message:'m2'});
  socket.emit('send_message',{message:'m3'});
  socket.emit('send_message',{message:'m4'});
  await sleep(300);
  assert(recv.length===3,'flood limiti beklenmiyordu');
  const db = await initDb();
  const row = await db.get('SELECT COUNT(*) as c FROM chat_spam_history WHERE user_id = (SELECT id FROM users WHERE username = ?)', [username]);
  assert(row.c>=1,'spam kaydı yok');
  socket.close();
  console.log('chat spam penalty ok');
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});

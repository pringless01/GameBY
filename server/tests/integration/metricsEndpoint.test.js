import assert from 'assert';
import { io as Client } from 'socket.io-client';
import '../migrations/run-migrations.js';
import { startMentorSession, endMentorSession } from '../../metrics/mentorMetrics.js';

const BASE='http://localhost:3000';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{
  await import('../../server.js');
  await sleep(300);
  await fetch(BASE+'/health');
  const username='metric'+Date.now();
  await fetch(BASE+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})});
  const login=await fetch(BASE+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})}).then(r=>r.json());
  const sock=Client(BASE,{transports:['websocket'],auth:{token:'Bearer '+login.token}});
  await new Promise((res,rej)=>{sock.on('connect',res);sock.on('connect_error',rej);});
  sock.emit('join_chat');
  sock.emit('send_message',{message:'hi'});
  await sleep(200);
  sock.close();
  startMentorSession(123); endMentorSession(123);
  const metrics=await fetch(BASE+'/metrics').then(r=>r.text());
  assert(metrics.includes('http_request_duration_ms_p95'),'http p95 yok');
  assert(metrics.includes('ws_message_duration_ms_p95'),'ws p95 yok');
  assert(metrics.includes('mentor_session_duration_ms_bucket'),'mentor hist yok');
  console.log('metrics endpoint ok');
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});

import fetch from 'node-fetch';
import { io as ioc } from 'socket.io-client';
import '../config/env.js';

const BASE = process.env.SMOKE_BASE || 'http://localhost:3000';
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function run(){
  const errors=[];
  // Health
  try {
    const h = await fetch(BASE+'/health');
    if(h.status!==200) errors.push('health_status_'+h.status); else {
      const j = await h.json(); if(j.status!=='ok') errors.push('health_payload');
    }
  } catch{ errors.push('health_fetch'); }
  // Auth
  let token=null; let userId=null; const uname='smoke_'+Date.now();
  try {
    const r = await fetch(BASE+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:uname,password:'pass123'})});
    if(r.status!==200) errors.push('register_'+r.status);
    const l = await fetch(BASE+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:uname,password:'pass123'})});
    if(l.status!==200) errors.push('login_'+l.status);
    else { const lj = await l.json(); token=lj.token; userId=lj.user?.id; }
  } catch{ errors.push('auth_flow'); }
  // Socket
  if(token && userId){
    try {
      const socket = ioc(BASE,{ transports:['websocket'] });
      let got=false;
      await new Promise(res=>{
        socket.on('connect',()=>{ socket.emit('join_chat',{userId}); socket.emit('send_message',{userId,message:'smoke_msg'}); });
        socket.on('new_message',m=>{ if(m?.message==='smoke_msg'){ got=true; res(); } });
        setTimeout(res,4000);
      });
      socket.close(); if(!got) errors.push('socket_no_echo');
    } catch{ errors.push('socket_fail'); }
  }
  if(errors.length){ console.error('SMOKE_FAIL', errors); process.exit(1); }
  console.log('SMOKE_OK'); process.exit(0);
}
run();

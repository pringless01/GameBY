import assert from 'assert';
import '../migrations/run-migrations.js';
import { emitReputationEvent, ReputationEventType } from '../../services/reputationEvents.js';

(async () => {
  await import('../../server.js');
  await new Promise(r=>setTimeout(r,500));
  const BASE = 'http://localhost:3000';
  const username = 'rep'+Date.now();
  await fetch(BASE+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})});
  const loginRes = await fetch(BASE+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'pass123'})});
  const { token, user } = await loginRes.json();
  for(let i=0;i<11;i++) await emitReputationEvent({ userId: user.id, type: ReputationEventType.CHAT_MESSAGE });
  const histRes = await fetch(BASE+'/api/reputation/history',{headers:{Authorization:'Bearer '+token}});
  const body = await histRes.json();
  assert(body.dailyChatCapReached === true, 'cap bilgisinde hata');
  console.log('reputation cap ok');
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});

import { initDb } from '../config/database.js';
import { getIo } from '../sockets/io.js';

// Tutorial adım tanımları (sade)
export const TUTORIAL_STEPS = [
  'INTRO',
  'FIRST_CHAT',
  'FIRST_CONTRACT',
  'TRUST_LEARN',
  'MENTOR_MATCH',
  'DONE'
];

export async function getUserState(userId){
  const db = await initDb();
  return db.get('SELECT bot_tutorial_state FROM users WHERE id = ?', [userId]);
}

export async function advanceState(userId){
  const db = await initDb();
  const row = await getUserState(userId);
  if(!row) return null;
  const idx = TUTORIAL_STEPS.indexOf(row.bot_tutorial_state);
  if(idx === -1 || idx === TUTORIAL_STEPS.length -1) return row.bot_tutorial_state;
  const next = TUTORIAL_STEPS[idx+1];
  await db.run('UPDATE users SET bot_tutorial_state = ? WHERE id = ?', [next, userId]);
  const io = getIo();
  if(io) io.emit('tutorial_progress', { userId, state: next });
  return next;
}

export async function setState(userId, state){
  if(!TUTORIAL_STEPS.includes(state)) throw new Error('invalid_state');
  const db = await initDb();
  await db.run('UPDATE users SET bot_tutorial_state = ? WHERE id = ?', [state, userId]);
  const io = getIo();
  if(io) io.emit('tutorial_progress', { userId, state });
  return state;
}

export async function botGuidanceFor(state){
  switch(state){
    case 'INTRO': return 'Hoş geldin! Sohbetten selam ver.';
    case 'FIRST_CHAT': return 'İlk mesajını gönderdiğin için güzel. Şimdi basit bir kontrat açmayı dene.';
    case 'FIRST_CONTRACT': return 'Kontrat sürecini öğrendin, şimdi itibar puanını nasıl etkilediğini gör.';
    case 'TRUST_LEARN': return 'Güven puanı kritik. Bir mentor ile eşleşmeye hazırsın.';
    case 'MENTOR_MATCH': return 'Gerçek mentor aranıyor. Aktif kal.';
    case 'DONE': return 'Tutorial tamamlandı. Artık ekonomiye tam dahilsin.';
    default: return 'Devam et.';
  }
}

export async function getGuidance(userId){
  const row = await getUserState(userId);
  if(!row) return null;
  return botGuidanceFor(row.bot_tutorial_state);
}

export async function ensureAtLeast(userId, targetState){
  const dbState = await getUserState(userId);
  if(!dbState) return null;
  const current = dbState.bot_tutorial_state;
  const curIdx = TUTORIAL_STEPS.indexOf(current);
  const targetIdx = TUTORIAL_STEPS.indexOf(targetState);
  if (targetIdx === -1) return current;
  if (curIdx >= targetIdx) return current;
  // advance step by step
  let state = current;
  while(state !== targetState){
    state = await advanceState(userId);
  }
  return state;
}

export async function autoAdvanceOnEvent(userId, event){
  // event -> hedef state eşlemesi
  const mapping = {
    'chat:first_message': 'FIRST_CHAT',
    'contract:first_created': 'FIRST_CONTRACT',
    'trust:viewed_info': 'TRUST_LEARN'
  };
  const target = mapping[event];
  if(!target) return null;
  return ensureAtLeast(userId, target);
}

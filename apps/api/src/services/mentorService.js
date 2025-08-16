import { invalidateMentorLeaderboards } from '../cache/mentorCaches';
import { initDb } from '../config/database';
import { envConfig } from '../config/env';
import { startMentorSession, endMentorSession } from '../metrics/mentorMetrics';
import { incMentorSessionCompleted, incMentorRatingGiven, incMenteeRatingGiven } from '../metrics/reputationMetrics';
import { getIo } from '../sockets/io';

import { emitReputationEvent, ReputationEventType } from './reputationEvents';

// Tutorial adım tanımları (sade)
export const TUTORIAL_STEPS = [
  'INTRO',
  'FIRST_CHAT',
  'FIRST_CONTRACT',
  'TRUST_LEARN',
  'MENTOR_MATCH',
  'DONE'
];

// Mentor uygunluk eşiği
export const MIN_MENTOR_TRUST = 120;

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

// Basit in-memory queue (ileride kalıcı depolamaya taşınabilir)
const mentorQueue = new Set(); // mentor olmaya hazır kullanıcılar
const menteeQueue = new Set(); // eşleşme bekleyen kullanıcılar
const lastMatchAttempt = new Map(); // userId -> ts

function canAttempt(userId){
  const cd = Number(envConfig.MENTOR_MATCH_COOLDOWN_MS || 30000);
  const last = lastMatchAttempt.get(userId)||0;
  const now = Date.now();
  if(now - last < cd) return false;
  lastMatchAttempt.set(userId, now);
  return true;
}

export async function hasActiveMentorship(userId){
  const db = await initDb();
  const row = await db.get(`SELECT 1 FROM mentorships WHERE (mentor_id=? OR mentee_id=?) AND status='ACTIVE' LIMIT 1`, [userId, userId]);
  return !!row;
}

export async function canBeMentor(userId){
  const db = await initDb();
  const u = await db.get('SELECT trust_score FROM users WHERE id=?',[userId]);
  if(!u) return { eligible:false, reason:'user_not_found' };
  if(u.trust_score < MIN_MENTOR_TRUST) return { eligible:false, reason:'low_trust', trust:u.trust_score, required:MIN_MENTOR_TRUST };
  if(await hasActiveMentorship(userId)) return { eligible:false, reason:'already_active' };
  return { eligible:true, trust:u.trust_score };
}

export async function joinMentorQueue(userId){
  const elig = await canBeMentor(userId);
  if(!elig.eligible) return { ok:false, ...elig };
  await setMentorReady(userId, true);
  return { ok:true, queued:true };
}
export function leaveMentorQueue(userId){ setMentorReady(userId,false); }
export async function requestMentor(userId){
  if(await hasActiveMentorship(userId)) return { ok:false, reason:'already_active' };
  try { await ensureAtLeast(userId, 'MENTOR_MATCH'); } catch{}
  await setMenteeWaiting(userId, true);
  return { ok:true, queued:true };
}

async function fetchUsernames(mentorId, menteeId){
  try {
    const db = await initDb();
    const rows = await db.all('SELECT id, username FROM users WHERE id IN (?,?)',[mentorId, menteeId]);
    const map = Object.fromEntries(rows.map(r=>[r.id, r.username]));
    return { mentorUsername: map[mentorId], menteeUsername: map[menteeId] };
  } catch { return { mentorUsername:null, menteeUsername:null }; }
}

function tryMatch(){
  if(mentorQueue.size===0 || menteeQueue.size===0) return;
  const mentorId = mentorQueue.values().next().value;
  const menteeId = menteeQueue.values().next().value;
  mentorQueue.delete(mentorId); menteeQueue.delete(menteeId);
  initDb().then(async db=>{
    const result = await db.run(`INSERT INTO mentorships (mentor_id, mentee_id, status) VALUES (?,?, 'ACTIVE')`, [mentorId, menteeId]).catch(()=>({}));
    startMentorSession(result?.lastID);
    // Kuyruk flag reset (mentee artık waiting değil, mentor hazır flag'i isteğe bağlı kaldırıyoruz)
    await db.run('UPDATE users SET mentee_waiting=0 WHERE id=?',[menteeId]).catch(()=>{});
    await db.run('UPDATE users SET mentor_ready=0 WHERE id=?',[mentorId]).catch(()=>{});
    const names = await fetchUsernames(mentorId, menteeId);
    const io = getIo();
    if(io){
      io.emit('mentor:match_found', { mentorId, menteeId, ...names });
      io.emit('mentor:session_status', { mentorship: await db.get('SELECT * FROM mentorships WHERE mentor_id=? AND mentee_id=? ORDER BY id DESC LIMIT 1',[mentorId, menteeId]) });
    }
  });
}

export async function getActiveMentorship(userId){
  const db = await initDb();
  const row = await db.get(`SELECT m.id, m.mentor_id, m.mentee_id, m.status, m.created_at,
      mu.username as mentor_username, uu.username as mentee_username
    FROM mentorships m
    JOIN users mu ON mu.id = m.mentor_id
    JOIN users uu ON uu.id = m.mentee_id
    WHERE (m.mentor_id = ? OR m.mentee_id = ?) AND m.status='ACTIVE'
    ORDER BY m.created_at DESC LIMIT 1`, [userId, userId]);
  return row || null;
}

export function getQueues(){
  return { mentors: Array.from(mentorQueue), mentees: Array.from(menteeQueue), counts:{ mentors: mentorQueue.size, mentees: menteeQueue.size } };
}

// Kalıcı flag senkronizasyonu
export async function rehydrateQueues(){
  try {
    const db = await initDb();
    const mentors = await db.all('SELECT id FROM users WHERE mentor_ready=1');
    const mentees = await db.all('SELECT id FROM users WHERE mentee_waiting=1');
    mentors.forEach(r=>mentorQueue.add(r.id));
    mentees.forEach(r=>menteeQueue.add(r.id));
    if(mentorQueue.size && menteeQueue.size) tryMatch();
  } catch(e){ /* sessiz */ }
}

export async function setMentorReady(userId, ready){
  const db = await initDb();
  await db.run('UPDATE users SET mentor_ready=? WHERE id=?',[ready?1:0,userId]);
  if(ready){ mentorQueue.add(userId); const io = getIo(); if(io) io.emit('mentor:queue_update', getQueues()); tryMatch(); } else { mentorQueue.delete(userId); const io = getIo(); if(io) io.emit('mentor:queue_update', getQueues()); }
  return { ok:true, ready };
}

export async function setMenteeWaiting(userId, waiting){
  const db = await initDb();
  await db.run('UPDATE users SET mentee_waiting=? WHERE id=?',[waiting?1:0,userId]);
  if(waiting){ menteeQueue.add(userId); const io = getIo(); if(io) io.emit('mentor:queue_update', getQueues()); tryMatch(); } else { menteeQueue.delete(userId); const io = getIo(); if(io) io.emit('mentor:queue_update', getQueues()); }
  return { ok:true, waiting };
}

export async function completeMentorship(mentorshipId, userId, { mentor_rating=null, mentee_rating=null }={}){
  const db = await initDb();
  const m = await db.get('SELECT * FROM mentorships WHERE id=?',[mentorshipId]);
  if(!m) throw new Error('not_found');
  if(m.status !== 'ACTIVE') throw new Error('invalid_state');
  if(m.mentor_id !== userId && m.mentee_id !== userId) throw new Error('forbidden');
  const updates = [];
  const setCols = [];
  if(mentor_rating !== null && m.mentee_id === userId){ setCols.push('mentor_rating = ?'); updates.push(mentor_rating); incMentorRatingGiven(); }
  if(mentee_rating !== null && m.mentor_id === userId){ setCols.push('mentee_rating = ?'); updates.push(mentee_rating); incMenteeRatingGiven(); }
  setCols.push("status='COMPLETED'");
  setCols.push("ended_at = datetime('now')");
  const sql = `UPDATE mentorships SET ${setCols.join(', ')} WHERE id=?`;
  await db.run(sql, [...updates, mentorshipId]);
  const updated = await db.get('SELECT * FROM mentorships WHERE id=?',[mentorshipId]);
  const io = getIo();
  if(io) io.emit('mentorship_completed', { id: mentorshipId, mentor_id: m.mentor_id, mentee_id: m.mentee_id, mentor_rating: updated.mentor_rating, mentee_rating: updated.mentee_rating });
  endMentorSession(mentorshipId);
  try { invalidateMentorLeaderboards(); } catch {}
  emitReputationEvent({ userId: m.mentor_id, type: ReputationEventType.MENTOR_SESSION_COMPLETE }).catch(()=>{});
  emitReputationEvent({ userId: m.mentee_id, type: ReputationEventType.MENTEE_SESSION_COMPLETE }).catch(()=>{});
  incMentorSessionCompleted();
  return updated;
}

export async function listActiveMentorship(userId){
  const db = await initDb();
  return db.get('SELECT * FROM mentorships WHERE (mentor_id=? OR mentee_id=?) AND status=\'ACTIVE\' ORDER BY created_at DESC LIMIT 1',[userId,userId]);
}

export async function getMentorshipById(id){
  const db = await initDb();
  return db.get('SELECT * FROM mentorships WHERE id=?',[id]);
}

export async function computeMentorQualityScore(mentorId){
  const db = await initDb();
  const row = await db.get(`SELECT 
      (SELECT COUNT(*) FROM mentorships WHERE mentor_id=? AND status='COMPLETED') as sessions,
      (SELECT AVG(mentee_rating) FROM mentorships WHERE mentor_id=? AND mentee_rating IS NOT NULL) as avg_rating,
      (SELECT COUNT(*) FROM mentorships WHERE mentor_id=? AND status='ACTIVE') as active_now
    `,[mentorId, mentorId, mentorId]);
  const sessions = row.sessions||0;
  const avg = row.avg_rating||0;
  // Basit formül: (avg_rating_normalized * 0.6 + log1p(sessions) / log1p(50) * 0.4) * (active_now?0.95:1)
  const ratingFactor = (avg/5); // varsayım 1-5 arası
  const sessionFactor = Math.log1p(sessions)/Math.log1p(50);
  const activePenalty = row.active_now ? 0.95 : 1; // çok uzun aktif kalma minimize edilmemiş, placeholder
  const score = ((ratingFactor*0.6)+(sessionFactor*0.4))*activePenalty;
  return { mentorId, score: Number(score.toFixed(4)), sessions, avg_rating: Number(avg.toFixed(2)), active_now: !!row.active_now };
}
// TODO(mentor): computeMentorQualityScore iyileştirme (decay, retention, fraud etkileşimi)

// ReputationEventEmitter (taslak)
// Bu modul otomatik itibar (trust_score) delta üretimi için merkezi katman sağlar.
// Amaç: Chat / trade / mentor / spam vb. kaynaklardan gelen ham olayları normalleştirip
// reputation_events tablosuna atomic kayıt + kullanıcı trust_score güncelleme tetiklemek.

import { initDb } from '../config/database.js';
import { invalidateOnTrustChange } from '../cache/trustCaches.js';
import { incReputationEvent, incCappedSkip, incUnknownType, incReputationDbError } from '../metrics/reputationMetrics.js';
import fs from 'fs';
import path from 'path';

// Event tipleri (genişletilebilir)
export const ReputationEventType = {
  CHAT_MESSAGE: 'chat_message',
  TRADE_COMPLETED: 'trade_completed',
  MENTOR_SESSION_COMPLETE: 'mentor_session_complete',
  SPAM_PENALTY: 'spam_penalty',
  MENTEE_SESSION_COMPLETE: 'mentee_session_complete',
  CONTRACT_DEFAULT: 'contract_default',
  FRAUD_FLAG: 'fraud_flag'
};

// Delta haritalama (ilk taslak) – ileride konfigürasyona taşınabilir.
// Soft cap / günlük limitler dış katmanda uygulanacak.
let DELTA_RULES = {};
const RULES_PATH = path.resolve(process.cwd(), 'server', 'config', 'reputationRules.json');
function loadRules(){
  try {
    const txt = fs.readFileSync(RULES_PATH, 'utf8');
    const json = JSON.parse(txt);
    if(json && typeof json === 'object') DELTA_RULES = json;
  } catch { /* ignore parse */ }
}
loadRules();
let __watching = false;
function watchRules(){
  if(__watching) return; __watching = true;
  try {
    fs.watch(RULES_PATH, { persistent:false }, (evt)=>{ setTimeout(loadRules, 100); });
  } catch { /* ignore */ }
}
watchRules();

// Günlük sayaç cache (in-memory). Gelecekte Redis'e taşınabilir.
const dailyCounters = new Map(); // key: userId:YYYY-MM-DD:eventType -> count

function today(){ return new Date().toISOString().slice(0,10); }

function counterKey(userId, type){ return `${userId}:${today()}:${type}`; }

export function getDailyCount(userId, type){
  return dailyCounters.get(counterKey(userId, type)) || 0;
}

function incDailyCount(userId, type){
  const k = counterKey(userId, type);
  dailyCounters.set(k, (dailyCounters.get(k)||0)+1);
}

// Soft cap kontrolü: cap aşılmışsa 0 delta döner (event yine kayıt edilebilir mi? => Taslak: hayır)
function computeDelta(userId, type){
  const rule = DELTA_RULES[type];
  if(!rule) return null;
  if(rule.dailyCap != null){
    const used = getDailyCount(userId, type);
    if(used >= rule.dailyCap) return { delta:0, capped:true };
  }
  return { delta: rule.delta, capped:false };
}

// Günlük sayaç temizliği (basit gün değişiminde temizlik)
let __currentDay = today();
function cleanupDailyCountersIfDayChanged(){
  const d = today();
  if(d !== __currentDay){
    for(const k of Array.from(dailyCounters.keys())){
      if(!k.includes(':'+d+':')) dailyCounters.delete(k);
    }
    __currentDay = d;
  }
}

// Public API: otomatik event işleme
export async function emitReputationEvent({ userId, type, meta = {} }){
  cleanupDailyCountersIfDayChanged();
  const calc = computeDelta(userId, type);
  if(!calc){ incUnknownType(); return { skipped:true, reason:'unknown_type' }; }
  if(calc.delta === 0 && calc.capped) { incCappedSkip(); return { skipped:true, reason:'daily_cap' }; }
  const db = await initDb();
  const now = new Date().toISOString();
  // Transactional update
  await db.exec('BEGIN');
  try {
    await db.run('INSERT INTO reputation_events (user_id, delta, reason, created_at) VALUES (?,?,?,?)',[userId, calc.delta, type, now]);
    await db.run('UPDATE users SET trust_score = trust_score + ? WHERE id=?',[calc.delta, userId]);
    await db.exec('COMMIT');
    incDailyCount(userId, type);
    invalidateOnTrustChange(userId);
    incReputationEvent(type);
    return { success:true, delta:calc.delta, capped:false };
  } catch(err){
    incReputationDbError();
    await db.exec('ROLLBACK');
    return { success:false, error:'db_error' };
  }
}

// Ceza / manuel negatif olay eklemek için direkt API (cap kontrolü yok)
export async function addManualPenalty({ userId, delta, reason }){
  if(typeof delta !== 'number' || !delta) return { success:false, error:'invalid_delta' };
  const db = await initDb();
  const now = new Date().toISOString();
  await db.exec('BEGIN');
  try {
    await db.run('INSERT INTO reputation_events (user_id, delta, reason, created_at) VALUES (?,?,?,?)',[userId, delta, reason||'manual']);
    await db.run('UPDATE users SET trust_score = trust_score + ? WHERE id=?',[delta, userId]);
    await db.exec('COMMIT');
    invalidateOnTrustChange(userId);
    incReputationEvent(reason||'manual');
    return { success:true, delta };
  } catch(err){
    await db.exec('ROLLBACK');
    return { success:false, error:'db_error' };
  }
}

// TODO(reputation): Günlük sayaçların periyodik temizliği (memory leak önleme) -> basit day-change cleanup uygulandı
// TODO(reputation): Cap aşımında event loglama (audit)
// TODO(reputation): Negative eventlerin cap dışı konfigüre edilebilmesi
// TODO(reputation): mentee_session_complete olayı ekleyip delta kuralı kararlaştır -> UYGULANDI (+2, dailyCap 15)
// TODO(reputation): fraud_flag & contract_default external config -> eklendi (DELTA_RULES)
// TODO(metrics): reputation.events_total counter export

export function listDeltaRules(){ return JSON.parse(JSON.stringify(DELTA_RULES)); }

export async function applyDirectReputationDelta({ userId, delta, reason }){
  if(typeof delta !== 'number' || !delta) return { success:false, error:'invalid_delta' };
  const db = await initDb();
  const now = new Date().toISOString();
  await db.exec('BEGIN');
  try {
    await db.run('INSERT INTO reputation_events (user_id, delta, reason, created_at) VALUES (?,?,?,?)',[userId, delta, reason, now]);
    await db.run('UPDATE users SET trust_score = trust_score + ? WHERE id=?',[delta, userId]);
    await db.exec('COMMIT');
    invalidateOnTrustChange(userId);
    incReputationEvent(reason);
    return { success:true, delta };
  } catch(err){
    incReputationDbError();
    await db.exec('ROLLBACK');
    return { success:false, error:'db_error' };
  }
}

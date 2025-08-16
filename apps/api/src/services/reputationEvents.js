// ReputationEventEmitter (taslak)
// Bu modul otomatik itibar (trust_score) delta üretimi için merkezi katman sağlar.
// Amaç: Chat / trade / mentor / spam vb. kaynaklardan gelen ham olayları normalleştirip
// reputation_events tablosuna atomic kayıt + kullanıcı trust_score güncelleme tetiklemek.

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { invalidateOnTrustChange } from '../cache/trustCaches';
import { initDb } from '../config/database';
import { envConfig } from '../config/env';
import { incReputationEvent, incCappedSkip, incUnknownType, incReputationDbError } from '../metrics/reputationMetrics';


// Event tipleri (genişletilebilir)
export const ReputationEventType = {
  CHAT_MESSAGE: 'chat_message',
  TRADE_COMPLETED: 'trade_completed',
  MENTOR_SESSION_COMPLETE: 'mentor_session_complete',
  SPAM_PENALTY: 'spam_penalty',
  MENTEE_SESSION_COMPLETE: 'mentee_session_complete',
  CONTRACT_DEFAULT: 'contract_default',
  FRAUD_FLAG: 'fraud_flag',
  ONBOARD_STEP: 'onboard_step'
};

// Delta haritalama (ilk taslak) – ileride konfigürasyona taşınabilir.
// Soft cap / günlük limitler dış katmanda uygulanacak.
let DELTA_RULES = {};
let __LAST_RULES_RAW = '';
let __RULES_VERSION = '';
function hashContent(txt){ return crypto.createHash('sha256').update(txt).digest('hex').slice(0,12); }
function diffRules(oldObj, newObj){
  const changes = [];
  const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  for(const k of keys){
    if(k.startsWith('_')) continue;
    const o = oldObj[k];
    const n = newObj[k];
    if(o && n){
      if(o.delta !== n.delta || o.dailyCap !== n.dailyCap){ changes.push({ type:'modify', key:k, from:o, to:n }); }
    } else if(o && !n){ changes.push({ type:'remove', key:k, from:o }); }
    else if(!o && n){ changes.push({ type:'add', key:k, to:n }); }
  }
  return changes;
}
// Support running with cwd at repo root or at server/ directory
let RULES_PATH = path.resolve(process.cwd(), 'server', 'config', 'reputationRules.json');
try {
  if(!fs.existsSync(RULES_PATH)){
    const alt = path.resolve(process.cwd(), 'config', 'reputationRules.json');
    if(fs.existsSync(alt)) RULES_PATH = alt;
  }
} catch { /* ignore */ }
function loadRules(){
  try {
    const txt = fs.readFileSync(RULES_PATH, 'utf8');
    if(txt === __LAST_RULES_RAW) return; // no change
    const json = JSON.parse(txt);
    if(json && typeof json === 'object'){
      const old = DELTA_RULES;
      DELTA_RULES = json;
      const changes = diffRules(old, DELTA_RULES);
      __RULES_VERSION = hashContent(txt);
      if(changes.length){
        try { console.warn(JSON.stringify({ level:'warn', ts:new Date().toISOString(), event:'reputation_rules_changed', version:__RULES_VERSION, changes })); } catch {}
        // Audit DB insert (best-effort)
        (async ()=>{
          try {
            const db = await initDb();
            await db.run('INSERT OR IGNORE INTO reputation_rules_audit (version, changes_json, rule_count, created_at) VALUES (?,?,?,?)', [__RULES_VERSION, JSON.stringify(changes), Object.keys(DELTA_RULES).filter(k=>!k.startsWith('_')).length, new Date().toISOString()]);
          } catch {/* ignore audit errors */}
        })();
      }
      __LAST_RULES_RAW = txt;
    }
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
  // Apply positive/negative weights
  const posW = Number(envConfig.REPUTATION_POSITIVE_WEIGHT || 1);
  const negW = Number(envConfig.REPUTATION_NEGATIVE_WEIGHT || 1);
  let d = rule.delta;
  if(d > 0) d = Math.round(d * posW);
  else if(d < 0) d = Math.round(d * negW);
  return { delta: d, capped:false };
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
  await db.run('UPDATE users SET trust_score = trust_score + ?, last_decay_at = COALESCE(last_decay_at, ?) WHERE id=?',[calc.delta, now, userId]);
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
  await db.run('UPDATE users SET trust_score = trust_score + ?, last_decay_at = COALESCE(last_decay_at, ?) WHERE id=?',[delta, new Date().toISOString(), userId]);
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
export function getReputationRulesVersion(){ return __RULES_VERSION || 'unknown'; }
export function getReputationRuleCount(){ return Object.keys(DELTA_RULES).filter(k=>!k.startsWith('_')).length; }

export async function applyDirectReputationDelta({ userId, delta, reason }){
  if(typeof delta !== 'number' || !delta) return { success:false, error:'invalid_delta' };
  const db = await initDb();
  const now = new Date().toISOString();
  await db.exec('BEGIN');
  try {
  await db.run('INSERT INTO reputation_events (user_id, delta, reason, created_at) VALUES (?,?,?,?)',[userId, delta, reason, now]);
  await db.run('UPDATE users SET trust_score = trust_score + ?, last_decay_at = COALESCE(last_decay_at, ?) WHERE id=?',[delta, now, userId]);
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

export async function emitOnboardingStep({ userId, step, deltaIfConfigured=true }){
  if(!userId || !step) return { success:false, error:'invalid_args' };
  const db = await initDb();
  // idempotent insert
  let inserted = false;
  try {
    const res = await db.run('INSERT INTO onboarding_progress (user_id, step) VALUES (?,?)',[userId, step]);
    if(res && res.changes === 1) inserted = true;
  } catch { /* duplicate ignore */ }
  // metrics for onboarding by step (only on first insert)
  if(inserted){
    try { const { incOnboardingStep } = await import('../metrics/reputationMetrics.js'); incOnboardingStep(step); } catch { /* ignore */ }
  }
  // reputation rule optional (onboard_step or specific step key override)
  const rules = listDeltaRules();
  let reasonKey = 'onboard_step';
  if(rules['onboard_'+step]) reasonKey = 'onboard_'+step;
  if(deltaIfConfigured && rules[reasonKey]){
    return emitReputationEvent({ userId, type: reasonKey });
  }
  return { success:true, delta:0, reason:reasonKey };
}

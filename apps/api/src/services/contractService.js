import { initDb } from '../config/database.js';
import { envConfig } from '../config/env.js';
import { setTradeWindowMetrics } from '../metrics/reputationMetrics.js';
import { logAudit } from '../services/auditService.js';
import { autoAdvanceOnEvent } from '../services/mentorService.js';
import { applyDirectReputationDelta, emitReputationEvent, ReputationEventType, emitOnboardingStep, listDeltaRules } from '../services/reputationEvents.js';
import { updateTrust } from '../services/userService.js';
import { getIo } from '../sockets/io.js';

export const DAILY_CONTRACT_TRUST_CAP = 40; // ileride .env'e taşınabilir
// Anti-abuse parametreleri
export const MICRO_PRICE_TRUST_THRESHOLD = 5; // Bu fiyatın altı: trust ödülü yok
export const MAX_DAILY_PAIR_REWARDING = 3; // Aynı çift için günde en fazla ödül verilen kontrat sayısı
export const CONTRACT_DEFAULT_AFTER_MS = 6 * 60 * 60 * 1000; // 6 saat ACTIVE kalırsa default say (taslak)

// Escrow & Cancel spam (taslak heuristik)
const CANCEL_SPAM_WINDOW_MS = 10 * 60 * 1000; // 10 dk penceresi
const CANCEL_SPAM_THRESHOLD = 3; // pencere içinde iptal sayısı eşik
const CANCEL_SPAM_FLAG_COOLDOWN_MS = 60 * 60 * 1000; // 1 saat aynı kullanıcıya yeniden flag verme
const cancelWindowByUser = new Map(); // userId -> [ts,...]
const lastCancelSpamFlagByUser = new Map(); // userId -> ts
function recordCancelAndMaybeFlag(userId){
  const now = Date.now();
  const list = cancelWindowByUser.get(userId) || [];
  const cutoff = now - CANCEL_SPAM_WINDOW_MS;
  const pruned = list.filter(ts => ts >= cutoff);
  pruned.push(now);
  cancelWindowByUser.set(userId, pruned);
  const count = pruned.length;
  if(count > CANCEL_SPAM_THRESHOLD){ // strict > (eşik politikası)
    const last = lastCancelSpamFlagByUser.get(userId) || 0;
    if(now - last > CANCEL_SPAM_FLAG_COOLDOWN_MS){
      lastCancelSpamFlagByUser.set(userId, now);
      // Reputation negatifi: contract_cancel_spam (reputationRules.json'da konfigüre)
      emitReputationEvent({ userId, type: 'contract_cancel_spam' }).catch(()=>{});
    }
  }
}

export async function getTodayContractTrustTotal(userId){
  const db = await initDb();
  const row = await db.get(`SELECT COALESCE(SUM(delta),0) as total FROM reputation_events WHERE user_id = ? AND reason = 'contract_completed_dynamic' AND date(created_at)=date('now')`, [userId]);
  return row.total || 0;
}

// Barter değer hesaplayıcı (basit ağırlıklar)
function barterValue(c){
  // money zaten price kolonunda, kaynaklar basit katsayı: wood=2, grain=2, business=10
  return (c.creator_give_wood + c.counter_give_wood)*2 + (c.creator_give_grain + c.counter_give_grain)*2 + (c.creator_give_business + c.counter_give_business)*10;
}

export function calculateDynamicTrustReward(contract){
  const amount = Math.max(1, contract.amount || 1);
  const price = Math.max(1, contract.price || 1);
  const bVal = barterValue(contract) + 1;
  const raw = 1 + Math.log10(amount * price * bVal + 1);
  return Math.min(10, Math.max(1, Math.round(raw)));
}

// Günlük aynı kullanıcı çifti (iki yön) tamamlanan kontrat sayısı
async function getDailyPairCompletionCount(a, b){
  const db = await initDb();
  const row = await db.get(`SELECT COUNT(*) as c FROM contracts WHERE status='COMPLETED' AND date(updated_at)=date('now') AND ((creator_id=? AND counterparty_id=?) OR (creator_id=? AND counterparty_id=?))`, [a,b,b,a]);
  return row.c || 0;
}

export async function createContract({ creator_id, counterparty_id, subject, amount, type, price=0, currency='TL',
  creator_give_money=0, creator_give_wood=0, creator_give_grain=0, creator_give_business=0,
  counter_give_money=0, counter_give_wood=0, counter_give_grain=0, counter_give_business=0 }) {
  const db = await initDb();
  const result = await db.run(`INSERT INTO contracts (creator_id, counterparty_id, subject, amount, type, status, price, currency,
    creator_give_money, creator_give_wood, creator_give_grain, creator_give_business,
    counter_give_money, counter_give_wood, counter_give_grain, counter_give_business)
    VALUES (?,?,?,?,?, 'PENDING', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      creator_id, counterparty_id, subject, amount, type, price, currency,
      creator_give_money, creator_give_wood, creator_give_grain, creator_give_business,
      counter_give_money, counter_give_wood, counter_give_grain, counter_give_business
    ]);
  const created = await getContract(result.lastID);
  const io = getIo();
  if (io) io.emit('contract_created', created);
  logAudit({ userId: creator_id, action: 'contract_create', detail: JSON.stringify({ id: created.id, counterparty_id, amount, type, price, barter: { creator: { creator_give_money, creator_give_wood, creator_give_grain, creator_give_business }, counter: { counter_give_money, counter_give_wood, counter_give_grain, counter_give_business } } }) });
  const countRow = await db.get('SELECT COUNT(*) as c FROM contracts WHERE creator_id = ?', [creator_id]);
  if (countRow.c === 1) autoAdvanceOnEvent(creator_id, 'contract:first_created').catch(()=>{});
  return created;
}

export async function getContract(id) {
  const db = await initDb();
  return db.get('SELECT * FROM contracts WHERE id = ?', [id]);
}

export async function listUserContracts(userId) {
  const db = await initDb();
  return db.all('SELECT * FROM contracts WHERE creator_id = ? OR counterparty_id = ? ORDER BY created_at DESC', [userId, userId]);
}

export async function actOnContract(id, userId, action) {
  const db = await initDb();
  const contract = await getContract(id);
  if (!contract) throw new Error('not_found');
  if (![contract.creator_id, contract.counterparty_id].includes(userId)) throw new Error('forbidden');
  let newStatus = contract.status;
  if (action === 'accept' && contract.status === 'PENDING' && userId === contract.counterparty_id) newStatus = 'ACTIVE';
  else if (action === 'cancel' && ['PENDING','ACTIVE'].includes(contract.status) && userId === contract.creator_id) newStatus = 'CANCELLED';
  else if (action === 'complete' && contract.status === 'ACTIVE') newStatus = 'COMPLETED';
  if (newStatus !== contract.status) {
    await db.run('BEGIN');
    try {
      // Escrow durum yönetimi
      if (newStatus === 'ACTIVE') {
        await db.run('UPDATE contracts SET escrow_status = ?, escrow_amount = ? WHERE id = ?', ['HELD', contract.price || 0, id]);
      }
  if (newStatus === 'COMPLETED') {
        // Para transferi (price)
        if (contract.price > 0) {
          const payer = await db.get('SELECT id, money, wood, grain, business FROM users WHERE id = ?', [contract.creator_id]);
          if (!payer || payer.money < contract.price) {
            await db.run('ROLLBACK');
            throw new Error('insufficient_funds');
          }
          await db.run('UPDATE users SET money = money - ? WHERE id = ?', [contract.price, contract.creator_id]);
          await db.run('UPDATE users SET money = money + ? WHERE id = ?', [contract.price, contract.counterparty_id]);
        }
        // Barter transferleri (creator -> counter)
        const resOwner = await db.get('SELECT id, money, wood, grain, business FROM users WHERE id = ?', [contract.creator_id]);
        const resCounter = await db.get('SELECT id, money, wood, grain, business FROM users WHERE id = ?', [contract.counterparty_id]);
        // Yeterlilik kontrolü
        const needCheck = [
          ['money','creator_give_money'],['wood','creator_give_wood'],['grain','creator_give_grain'],['business','creator_give_business'],
          ['money','counter_give_money'],['wood','counter_give_wood'],['grain','counter_give_grain'],['business','counter_give_business']
        ];
        for (const [field, col] of needCheck){
          const give = contract[col] || 0;
          if (give < 0) { await db.run('ROLLBACK'); throw new Error('invalid_amount'); }
          if (col.startsWith('creator_') && resOwner[field] < give) { await db.run('ROLLBACK'); throw new Error('insufficient_resources'); }
          if (col.startsWith('counter_') && resCounter[field] < give) { await db.run('ROLLBACK'); throw new Error('insufficient_resources'); }
        }
        // Transfer uygula
        const updates = [];
        function addUpdate(sql, params){ updates.push(db.run(sql, params)); }
        if (contract.creator_give_money) { addUpdate('UPDATE users SET money = money - ? WHERE id=?', [contract.creator_give_money, contract.creator_id]); addUpdate('UPDATE users SET money = money + ? WHERE id=?', [contract.creator_give_money, contract.counterparty_id]); }
        if (contract.creator_give_wood) { addUpdate('UPDATE users SET wood = wood - ? WHERE id=?', [contract.creator_give_wood, contract.creator_id]); addUpdate('UPDATE users SET wood = wood + ? WHERE id=?', [contract.creator_give_wood, contract.counterparty_id]); }
        if (contract.creator_give_grain) { addUpdate('UPDATE users SET grain = grain - ? WHERE id=?', [contract.creator_give_grain, contract.creator_id]); addUpdate('UPDATE users SET grain = grain + ? WHERE id=?', [contract.creator_give_grain, contract.counterparty_id]); }
        if (contract.creator_give_business) { addUpdate('UPDATE users SET business = business - ? WHERE id=?', [contract.creator_give_business, contract.creator_id]); addUpdate('UPDATE users SET business = business + ? WHERE id=?', [contract.creator_give_business, contract.counterparty_id]); }
        if (contract.counter_give_money) { addUpdate('UPDATE users SET money = money - ? WHERE id=?', [contract.counter_give_money, contract.counterparty_id]); addUpdate('UPDATE users SET money = money + ? WHERE id=?', [contract.counter_give_money, contract.creator_id]); }
        if (contract.counter_give_wood) { addUpdate('UPDATE users SET wood = wood - ? WHERE id=?', [contract.counter_give_wood, contract.counterparty_id]); addUpdate('UPDATE users SET wood = wood + ? WHERE id=?', [contract.counter_give_wood, contract.creator_id]); }
        if (contract.counter_give_grain) { addUpdate('UPDATE users SET grain = grain - ? WHERE id=?', [contract.counter_give_grain, contract.counterparty_id]); addUpdate('UPDATE users SET grain = grain + ? WHERE id=?', [contract.counter_give_grain, contract.creator_id]); }
        if (contract.counter_give_business) { addUpdate('UPDATE users SET business = business - ? WHERE id=?', [contract.counter_give_business, contract.counterparty_id]); addUpdate('UPDATE users SET business = business + ? WHERE id=?', [contract.counter_give_business, contract.creator_id]); }
        await Promise.all(updates);
        // Escrow release
        await db.run('UPDATE contracts SET escrow_status = ? WHERE id = ?', ['RELEASED', id]);
      }
      await db.run('UPDATE contracts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, id]);
      // Cancel sonrası escrow refund (ACTIVE iken iptal edildiyse)
      if (newStatus === 'CANCELLED' && contract.status === 'ACTIVE') {
        await db.run('UPDATE contracts SET escrow_status = ? WHERE id = ?', ['REFUNDED', id]);
      }
      await db.run('COMMIT');
    } catch (e) {
      if (['insufficient_funds','insufficient_resources','invalid_amount'].includes(e.message) === false) {
        await db.run('ROLLBACK');
      }
      if (['insufficient_funds','insufficient_resources','invalid_amount'].includes(e.message)) throw e;
    }
    const updated = await getContract(id);

    // Cancel spam heuristik tetikleyici
    if (newStatus === 'CANCELLED' && userId === contract.creator_id) {
      recordCancelAndMaybeFlag(userId);
    }

    if (newStatus === 'COMPLETED') {
      const flags = [];
      let dyn = 0;
      let cReward = 0; let pReward = 0;
      if (updated.price < MICRO_PRICE_TRUST_THRESHOLD && barterValue(updated) === 0) {
        flags.push('micro_price');
      } else {
        const pairCount = await getDailyPairCompletionCount(updated.creator_id, updated.counterparty_id);
        if (pairCount > MAX_DAILY_PAIR_REWARDING) {
          flags.push('pair_limit_exceeded');
        } else {
          dyn = calculateDynamicTrustReward(updated);
          // trade_completed bonus delta (rules + env weights)
          let tradeDelta = 0;
          try {
            const rules = (typeof listDeltaRules === 'function') ? listDeltaRules() : {};
            const rule = rules && rules['trade_completed'];
            if(rule && typeof rule.delta === 'number'){
              const posW = Number(envConfig.REPUTATION_POSITIVE_WEIGHT || 1);
              const negW = Number(envConfig.REPUTATION_NEGATIVE_WEIGHT || 1);
              let d = rule.delta;
              if(d > 0) d = Math.round(d * posW);
              else if(d < 0) d = Math.round(d * negW);
              tradeDelta = d;
            }
          } catch {}
          // Toplam günlük kazanç (tüm nedenler) – cap global uygulanır
          const db2 = await initDb();
          const [cSumRow, pSumRow] = await Promise.all([
            db2.get(`SELECT COALESCE(SUM(delta),0) as total FROM reputation_events WHERE user_id = ? AND date(created_at)=date('now')`, [updated.creator_id]),
            db2.get(`SELECT COALESCE(SUM(delta),0) as total FROM reputation_events WHERE user_id = ? AND date(created_at)=date('now')`, [updated.counterparty_id])
          ]);
          const cRemaining = Math.max(0, DAILY_CONTRACT_TRUST_CAP - (cSumRow?.total||0));
          const pRemaining = Math.max(0, DAILY_CONTRACT_TRUST_CAP - (pSumRow?.total||0));
          const cDynCap = Math.max(0, cRemaining - Math.max(0, tradeDelta));
          const pDynCap = Math.max(0, pRemaining - Math.max(0, tradeDelta));
          cReward = Math.min(dyn, cDynCap);
          pReward = (updated.counterparty_id !== updated.creator_id) ? Math.min(dyn, pDynCap) : 0;
        }
      }
      try {
        // Apply dynamic rewards first
        if (cReward > 0) await applyDirectReputationDelta({ userId: updated.creator_id, delta: cReward, reason: 'contract_completed_dynamic' });
        if (pReward > 0) await applyDirectReputationDelta({ userId: updated.counterparty_id, delta: pReward, reason: 'contract_completed_dynamic' });
        // Then apply capped trade_completed bonus within remaining daily cap
        // Recompute sums after dynamic application
        const db3 = await initDb();
        const [cSum2, pSum2] = await Promise.all([
          db3.get(`SELECT COALESCE(SUM(delta),0) as total FROM reputation_events WHERE user_id = ? AND date(created_at)=date('now')`, [updated.creator_id]),
          db3.get(`SELECT COALESCE(SUM(delta),0) as total FROM reputation_events WHERE user_id = ? AND date(created_at)=date('now')`, [updated.counterparty_id])
        ]);
        let tradeDelta = 0;
        try {
          const rules = (typeof listDeltaRules === 'function') ? listDeltaRules() : {};
          const rule = rules && rules['trade_completed'];
          if(rule && typeof rule.delta === 'number'){
            const posW = Number(envConfig.REPUTATION_POSITIVE_WEIGHT || 1);
            const negW = Number(envConfig.REPUTATION_NEGATIVE_WEIGHT || 1);
            let d = rule.delta;
            if(d > 0) d = Math.round(d * posW); else if(d < 0) d = Math.round(d * negW);
            tradeDelta = d;
          }
        } catch {}
        const cRemainAfterDyn = Math.max(0, DAILY_CONTRACT_TRUST_CAP - (cSum2?.total||0));
        const pRemainAfterDyn = Math.max(0, DAILY_CONTRACT_TRUST_CAP - (pSum2?.total||0));
        const cTrade = Math.min(tradeDelta, cRemainAfterDyn);
        const pTrade = (updated.counterparty_id !== updated.creator_id) ? Math.min(tradeDelta, pRemainAfterDyn) : 0;
        if (cTrade > 0) await applyDirectReputationDelta({ userId: updated.creator_id, delta: cTrade, reason: 'trade_completed' });
        if (pTrade > 0) await applyDirectReputationDelta({ userId: updated.counterparty_id, delta: pTrade, reason: 'trade_completed' });
        logAudit({ userId: null, action: 'contract_trust_reward_dynamic', detail: JSON.stringify({ contractId: id, dyn_base: dyn, creator_reward: cReward, counterparty_reward: pReward, trade_bonus_applied: { creator: cTrade, counterparty: pTrade }, cap: DAILY_CONTRACT_TRUST_CAP, flags, micro_threshold: MICRO_PRICE_TRUST_THRESHOLD, pair_limit: MAX_DAILY_PAIR_REWARDING, barter: barterValue(updated) }) });
      } catch (e) { /* ignore */ }
      // onboarding: first completed contract per user
      try {
        const db2 = await initDb();
        const cr = await db2.get('SELECT COUNT(*) as c FROM contracts WHERE creator_id=? AND status="COMPLETED"',[updated.creator_id]);
        if(cr.c === 1) emitOnboardingStep({ userId: updated.creator_id, step: 'contract_first_completed' }).catch(()=>{});
        if(updated.counterparty_id !== updated.creator_id){
          const pr = await db2.get('SELECT COUNT(*) as c FROM contracts WHERE counterparty_id=? AND status="COMPLETED"',[updated.counterparty_id]);
          if(pr.c === 1) emitOnboardingStep({ userId: updated.counterparty_id, step: 'contract_first_completed' }).catch(()=>{});
        }
      } catch {}
      // trade pair metrics record
      recordTradePair(updated.creator_id, updated.counterparty_id);
    }

    const io = getIo();
    if (io) io.emit('contract_updated', updated);
    logAudit({ userId, action: 'contract_'+action, detail: JSON.stringify({ id, status: updated.status }) });
    return updated;
  }
  return contract;
}

export function projectContractWithEstimates(c){
  const est = calculateDynamicTrustReward(c);
  const micro = (c.price < MICRO_PRICE_TRUST_THRESHOLD && barterValue(c)===0);
  return { ...c, estimated_trust: micro ? 0 : est, micro, barter_value: barterValue(c) };
}

export async function listUserContractsFiltered(userId, { status=null, role='any', limit=50, offset=0, sort='created_desc' }={}){
  const db = await initDb();
  limit = Math.min(100, Math.max(1, Number(limit)||50));
  offset = Math.max(0, Number(offset)||0);
  const params = [];
  let where = [];
  if (role === 'creator') { where.push('creator_id = ?'); params.push(userId); }
  else if (role === 'counterparty') { where.push('counterparty_id = ?'); params.push(userId); }
  else { where.push('(creator_id = ? OR counterparty_id = ?)'); params.push(userId, userId); }
  if (status) { where.push('status = ?'); params.push(status); }
  const whereSql = where.length? ('WHERE '+where.join(' AND ')) : '';
  let orderBy = 'created_at DESC';
  if(sort==='price_desc') orderBy = 'price DESC, created_at DESC';
  else if(sort==='price_asc') orderBy = 'price ASC, created_at DESC';
  else if(sort==='trust_desc') {
    // Monotonik temel: amount * price * (barterValue+1)
    orderBy = ` ( (amount) * (price) * ( (( (creator_give_wood + counter_give_wood + creator_give_grain + counter_give_grain) * 2 ) + ((creator_give_business + counter_give_business) * 10) + 1) ) ) DESC, created_at DESC`;
  } else if(sort==='trust_asc') {
    orderBy = ` ( (amount) * (price) * ( (( (creator_give_wood + counter_give_wood + creator_give_grain + counter_give_grain) * 2 ) + ((creator_give_business + counter_give_business) * 10) + 1) ) ) ASC, created_at DESC`;
  }
  const rows = await db.all(`SELECT * FROM contracts ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`, [...params, limit, offset]);
  const countRow = await db.get(`SELECT COUNT(*) as total FROM contracts ${whereSql}`, params);
  return { contracts: rows.map(projectContractWithEstimates), total: countRow.total, limit, offset, sort };
}

// Periodik tarayıcı (basit interval) – çoklu process yok varsayımı
if(!global.__CONTRACT_DEFAULT_SWEEPER){
  global.__CONTRACT_DEFAULT_SWEEPER = setInterval(()=>{ markDefaultExpiredContracts().catch(()=>{}); }, 5 * 60 * 1000); // 5 dk
}

async function markDefaultExpiredContracts(){
  const db = await initDb();
  const rows = await db.all(`SELECT id, creator_id, counterparty_id FROM contracts WHERE status='ACTIVE' AND (strftime('%s','now') - strftime('%s',updated_at))*1000 > ? LIMIT 50`, [CONTRACT_DEFAULT_AFTER_MS]);
  if(!rows.length) return 0;
  for(const r of rows){
    try {
  await db.run(`UPDATE contracts SET status='DEFAULTED', escrow_status='REFUNDED', updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='ACTIVE'`, [r.id]);
      logAudit({ userId:null, action:'contract_default_auto', detail: JSON.stringify({ contractId:r.id }) });
      // Negatif reputation (her iki taraf da etkilenir; ileride ağırlıklandırılabilir)
      emitReputationEvent({ userId: r.creator_id, type: ReputationEventType.CONTRACT_DEFAULT }).catch(()=>{});
      if(r.counterparty_id !== r.creator_id) emitReputationEvent({ userId: r.counterparty_id, type: ReputationEventType.CONTRACT_DEFAULT }).catch(()=>{});
      const io = getIo(); if(io) io.emit('contract_defaulted', { id:r.id });
    } catch{}
  }
  return rows.length;
}

const TRADE_WINDOW_MS = 10 * 60 * 1000; // 10 dakika
let tradeWindow = [];// {ts,a,b}
const FRAUD_PAIR_WINDOW_THRESHOLD = 8; // aynı çift 10 dk içinde bu sayıyı aşarsa şüpheli (taslak)
const FRAUD_PAIR_FLAG_COOLDOWN_MS = 60 * 60 * 1000; // 1 saat aynı çift için tekrar flag verme
const lastFraudFlagByPair = new Map(); // pairKey -> ts
function pairKey(a,b){ return a+':'+b; }
function recordTradePair(a,b){
  const now = Date.now();
  tradeWindow.push({ ts: now, a: Math.min(a,b), b: Math.max(a,b) });
  const cutoff = now - TRADE_WINDOW_MS;
  tradeWindow = tradeWindow.filter(e=>e.ts >= cutoff);
  const pairCounts = new Map();
  const partnerSet = new Set();
  for(const e of tradeWindow){
    const k = pairKey(e.a,e.b);
    pairCounts.set(k, (pairCounts.get(k)||0)+1);
    partnerSet.add(e.a); partnerSet.add(e.b);
  }
  const k = pairKey(Math.min(a,b), Math.max(a,b));
  const countForPair = pairCounts.get(k) || 0;
  const uniquePartners = partnerSet.size;
  setTradeWindowMetrics({ pairs: pairCounts.size, uniquePartners });
  // Basit fraud heuristik: Aynı çift yoğun tekrarlı tamamlanmış kontratlar
  if(countForPair > FRAUD_PAIR_WINDOW_THRESHOLD){
    const last = lastFraudFlagByPair.get(k) || 0;
    if(now - last > FRAUD_PAIR_FLAG_COOLDOWN_MS){
      lastFraudFlagByPair.set(k, now);
      // Her iki kullanıcıya FRAUD_FLAG reputation event (taslak heuristik)
      emitReputationEvent({ userId: a, type: ReputationEventType.FRAUD_FLAG }).catch(()=>{});
      if(b !== a) emitReputationEvent({ userId: b, type: ReputationEventType.FRAUD_FLAG }).catch(()=>{});
      try { console.warn(JSON.stringify({ level:'warn', ts:new Date().toISOString(), event:'fraud_flag_auto_pair_repeat', pair:k, count:countForPair, window_ms:TRADE_WINDOW_MS, threshold:FRAUD_PAIR_WINDOW_THRESHOLD })); } catch {}
    }
  }
}

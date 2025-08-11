import { initDb } from '../config/database.js';
import { getIo } from '../sockets/io.js';
import { autoAdvanceOnEvent } from '../services/mentorService.js';
import { logAudit } from '../services/auditService.js';
import { updateTrust } from '../services/userService.js';

// Günlük kullanıcı başı maksimum kontrat trust ödülü (toplam)
const DAILY_CONTRACT_TRUST_CAP = 40; // ileride .env'e taşınabilir

async function getTodayContractTrustTotal(userId){
  const db = await initDb();
  const row = await db.get(`SELECT COALESCE(SUM(delta),0) as total FROM reputation_events WHERE user_id = ? AND reason = 'contract_completed_dynamic' AND date(created_at)=date('now')`, [userId]);
  return row.total || 0;
}

function calculateDynamicTrustReward(contract){
  // Baseline: miktar ve fiyat ölçekli min 1 max 10
  // Formül: base = 1 + log10( (amount * max(price,1)) + 1 )
  const amount = Math.max(1, contract.amount || 1);
  const price = Math.max(1, contract.price || 1);
  const raw = 1 + Math.log10(amount * price + 1);
  return Math.min(10, Math.max(1, Math.round(raw)));
}

export async function createContract({ creator_id, counterparty_id, subject, amount, type, price=0, currency='TL' }) {
  const db = await initDb();
  const result = await db.run(`INSERT INTO contracts (creator_id, counterparty_id, subject, amount, type, status, price, currency)
    VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?)`, [creator_id, counterparty_id, subject, amount, type, price, currency]);
  const created = await getContract(result.lastID);
  const io = getIo();
  if (io) io.emit('contract_created', created);
  logAudit({ userId: creator_id, action: 'contract_create', detail: JSON.stringify({ id: created.id, counterparty_id, amount, type, price }) });
  // tutorial advance (first contract of creator?)
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
      if (newStatus === 'COMPLETED' && contract.price > 0) {
        const payer = await db.get('SELECT id, money FROM users WHERE id = ?', [contract.creator_id]);
        if (!payer || payer.money < contract.price) {
          await db.run('ROLLBACK');
            throw new Error('insufficient_funds');
        }
        await db.run('UPDATE users SET money = money - ? WHERE id = ?', [contract.price, contract.creator_id]);
        await db.run('UPDATE users SET money = money + ? WHERE id = ?', [contract.price, contract.counterparty_id]);
      }
      await db.run('UPDATE contracts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, id]);
      await db.run('COMMIT');
    } catch (e) {
      if (e.message !== 'insufficient_funds') {
        await db.run('ROLLBACK');
      }
      if (e.message === 'insufficient_funds') throw e;
    }
    const updated = await getContract(id);

    if (newStatus === 'COMPLETED') {
      // Dinamik ödül
      const dyn = calculateDynamicTrustReward(contract);
      // Her iki taraf için mevcut gün toplamları
      const [cTot, pTot] = await Promise.all([
        getTodayContractTrustTotal(contract.creator_id),
        getTodayContractTrustTotal(contract.counterparty_id)
      ]);
      const cRemaining = Math.max(0, DAILY_CONTRACT_TRUST_CAP - cTot);
      const pRemaining = Math.max(0, DAILY_CONTRACT_TRUST_CAP - pTot);
      const cReward = Math.min(dyn, cRemaining);
      const pReward = (contract.counterparty_id !== contract.creator_id) ? Math.min(dyn, pRemaining) : 0;
      try {
        if (cReward > 0) await updateTrust(contract.creator_id, cReward, 'contract_completed_dynamic');
        if (pReward > 0) await updateTrust(contract.counterparty_id, pReward, 'contract_completed_dynamic');
        logAudit({ userId: null, action: 'contract_trust_reward_dynamic', detail: JSON.stringify({ contractId: id, dyn_base: dyn, creator_reward: cReward, counterparty_reward: pReward, cap: DAILY_CONTRACT_TRUST_CAP }) });
      } catch (e) { /* ignore */ }
    }

    const io = getIo();
    if (io) io.emit('contract_updated', updated);
    logAudit({ userId, action: 'contract_'+action, detail: JSON.stringify({ id, status: updated.status }) });
    return updated;
  }
  return contract;
}

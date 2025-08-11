import { initDb } from '../config/database.js';
import { getIo } from '../sockets/io.js';
import { autoAdvanceOnEvent } from '../services/mentorService.js';
import { logAudit } from '../services/auditService.js';

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
    // Transaction: status update + (varsa) para transferi
    await db.run('BEGIN');
    try {
      if (newStatus === 'COMPLETED' && contract.price > 0) {
        // Yeterli bakiye kontrolü (creator öder varsayımı)
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
    const io = getIo();
    if (io) io.emit('contract_updated', updated);
    logAudit({ userId, action: 'contract_'+action, detail: JSON.stringify({ id, status: updated.status }) });
    return updated;
  }
  return contract;
}

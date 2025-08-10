import { initDb } from '../config/database.js';

export async function createContract({ creator_id, counterparty_id, subject, amount, type }) {
  const db = await initDb();
  const result = await db.run(`INSERT INTO contracts (creator_id, counterparty_id, subject, amount, type, status)
    VALUES (?, ?, ?, ?, ?, 'PENDING')`, [creator_id, counterparty_id, subject, amount, type]);
  return getContract(result.lastID);
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
    await db.run('UPDATE contracts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, id]);
  }
  return getContract(id);
}

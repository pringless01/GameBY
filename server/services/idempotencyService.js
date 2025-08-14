import { initDb } from '../config/database.js';

export async function getIdempotency(key){
  const db = await initDb();
  return db.get('SELECT response, status FROM idempotency_keys WHERE id = ?', [key]);
}

export async function saveIdempotency(key, status, body){
  const db = await initDb();
  const json = JSON.stringify(body);
  await db.run('INSERT OR REPLACE INTO idempotency_keys (id, response, status) VALUES (?,?,?)', [key, json, status]);
}

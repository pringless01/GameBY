#!/usr/bin/env node
// Basit audit trim scripti: son N kaydı bırakır
import { initDb } from '../config/database';

const KEEP = parseInt(process.env.AUDIT_KEEP || '5000', 10);

const run = async () => {
  const db = await initDb();
  const row = await db.get('SELECT COUNT(*) as c FROM audit_log');
  if (row.c <= KEEP) {
    console.log('No trim needed. Count:', row.c);
    process.exit(0);
  }
  const toDelete = row.c - KEEP;
  // En eski kayıtları sil
  const ids = await db.all('SELECT id FROM audit_log ORDER BY id ASC LIMIT ?', [toDelete]);
  if (!ids.length) return console.log('Nothing to delete');
  const maxId = ids[ids.length -1].id;
  await db.run('DELETE FROM audit_log WHERE id <= ?', [maxId]);
  console.log(`Trimmed ${toDelete} rows (<= id ${maxId}). Remaining ~${KEEP}`);
};

run().catch(e => { console.error('Trim failed', e); process.exit(1); });

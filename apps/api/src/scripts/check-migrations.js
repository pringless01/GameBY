import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDb } from '../config/database';
import '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  await initDb();
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f=>/^\d+_.*\.sql$/.test(f));
  const { db } = await import('../config/database.js');
  const applied = await db.all('SELECT name FROM migrations');
  const appliedSet = new Set(applied.map(r=>r.name));
  const pending = files.filter(f=>!appliedSet.has(f));
  console.log(JSON.stringify({ total: files.length, applied: applied.length, pending: pending.length, pendingList: pending }, null, 2));
  process.exit(pending.length?1:0);
})().catch(e=>{ console.error('check_migrations_error', e); process.exit(2); });

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, runMigration } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const db = await initDb();
  const dir = __dirname;
  const files = fs.readdirSync(dir)
    .filter(f => /^\d+_.*\.sql$/.test(f))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf-8');
    const applied = await runMigration(file, sql);
    console.log(applied ? `Applied: ${file}` : `Skipped (already): ${file}`);
  }
  await db.close();
})();

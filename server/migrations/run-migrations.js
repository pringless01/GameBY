import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, runMigration } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  await initDb();
  const migrationsDir = __dirname;
  const files = fs.readdirSync(migrationsDir)
    .filter(f => /^\d+_.*\.sql$/.test(f))
    .sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const applied = await runMigration(file, sql);
    console.log(applied ? `Applied ${file}` : `Skipped ${file}`);
  }
  process.exit(0);
})();

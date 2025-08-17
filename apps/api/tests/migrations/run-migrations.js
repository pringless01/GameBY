import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDb, runMigration } from '../../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  try {
    const db = await initDb();
    const migrationsDir = path.join(__dirname, '..', '..', 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f=>/^\d+_.*\.sql$/.test(f)).sort();
    for(const file of files){
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await runMigration(file, sql);
    }
  } catch (e) {
    // Tests should not crash if migrations already applied
  }
})();

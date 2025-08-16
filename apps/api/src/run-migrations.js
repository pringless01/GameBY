import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import { initDb, runMigration } from './config/database';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const db = await initDb();
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => /^\d+.*\.(sql|js)$/.test(f))
    .sort();

  for (const file of files) {
    if (file.endsWith('.sql')) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const applied = await runMigration(file, sql);
      console.log(applied ? `Applied ${file}` : `Skipped ${file}`);
    } else if (file.endsWith('.js')) {
      const row = await db.get('SELECT id FROM migrations WHERE name = ?', [file]);
      if (row) { console.log(`Skipped ${file}`); continue; }
      try {
        const mod = await import(pathToFileURL(path.join(migrationsDir, file)).href);
        if (typeof mod.up === 'function') await mod.up(db);
        await db.run('INSERT INTO migrations (name) VALUES (?)', [file]);
        console.log(`Applied ${file}`);
      } catch (e) {
        console.error('Migration failed', file, e);
        if (process.env.NODE_ENV === 'production') process.exit(1);
      }
    }
  }
  process.exit(0);
})();

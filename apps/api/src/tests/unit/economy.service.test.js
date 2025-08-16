// Ekonomi servis facadesi üzerinden sink testi (davranış değişikliği yok)
import assert from 'assert';

import { initDb } from '../../config/database.js';
import { runEconomySinkOnce } from '../../modules/economy/index.js';
import '../migrations/run-migrations.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async function () {
  // Test için env ayarları
  process.env.ECON_SINK_ENABLED = '1';
  process.env.ECON_TAX_THRESHOLD = '10000';
  process.env.ECON_TAX_RATE_BP = '100'; // 1%
  process.env.ECON_TAX_MAX_BP = '300';
  process.env.ECON_TAX_MAX_PER_RUN = '100000';

  const db = await initDb();
  await sleep(300);
  await db.exec('BEGIN');
  try {
    await db.run('DELETE FROM users');
    await db.run("INSERT INTO users (username, password_hash, trust_score, roles, money) VALUES ('econ_u1','x',0,'user',11000)");
    await db.run("INSERT INTO users (username, password_hash, trust_score, roles, money) VALUES ('econ_u2','x',0,'user',900)");

    const before = await db.all(
      "SELECT username, money FROM users WHERE username IN ('econ_u1','econ_u2') ORDER BY username"
    );

    const res = await runEconomySinkOnce();
    assert.strictEqual(res.charged, 1, 'only one user should be charged');

    const after = await db.all(
      "SELECT username, money FROM users WHERE username IN ('econ_u1','econ_u2') ORDER BY username"
    );

    const idxU1 = before[0].username === 'econ_u1' ? 0 : 1;
    const u1delta = before[idxU1].money - after[idxU1].money;
    assert.strictEqual(u1delta, 10, 'u1 should be charged 1% of (11000-10000)=10');

    console.log('economy.service.test OK');
  } finally {
    await db.exec('ROLLBACK');
  }
})();

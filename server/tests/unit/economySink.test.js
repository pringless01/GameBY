// @quarantine
import assert from 'assert';
import { initDb } from '../../config/database.js';
import { runEconomySinkOnce } from '../../services/economyService.js';
import '../migrations/run-migrations.js';
const sleep = ms => new Promise(r=>setTimeout(r,ms));

(async function(){
  process.env.ECON_SINK_ENABLED='1';
  process.env.ECON_TAX_THRESHOLD='10000';
  process.env.ECON_TAX_RATE_BP='100'; // 1%
  process.env.ECON_TAX_MAX_BP='300';
  process.env.ECON_TAX_MAX_PER_RUN='100000';

  const db = await initDb();
  await sleep(500);
  await db.exec('BEGIN');
  try {
  await db.run('DELETE FROM users');
  await db.run("INSERT INTO users (username, password_hash, trust_score, roles, money) VALUES ('econ_u1','x',0,'user',11000)");
  await db.run("INSERT INTO users (username, password_hash, trust_score, roles, money) VALUES ('econ_u2','x',0,'user',900)");
    const before = await db.all("SELECT username, money FROM users WHERE username IN ('econ_u1','econ_u2') ORDER BY username");
    const res = await runEconomySinkOnce();
    assert(res.charged === 1, 'only one user charged');
    const after = await db.all("SELECT username, money FROM users WHERE username IN ('econ_u1','econ_u2') ORDER BY username");
    const u1delta = before[0].username==='econ_u1' ? before[0].money - after[0].money : before[1].money - after[1].money;
  assert(u1delta === 10, 'u1 should be charged 1% of (11000-10000)=10');
    console.log('economySink.test OK');
  } finally {
    await db.exec('ROLLBACK');
  }
})();

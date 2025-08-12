import assert from 'assert';
import { initDb } from '../../config/database.js';
import { emitOnboardingStep } from '../../services/reputationEvents.js';
import { reputationMetrics } from '../../metrics/reputationMetrics.js';

(async function(){
  const db = await initDb();
  await db.exec('BEGIN');
  try {
    // create a temp user
    await db.run("INSERT INTO users (username, password_hash, trust_score, roles, money) VALUES ('onb_user','x',100,'user',1000)");
    const user = await db.get("SELECT id FROM users WHERE username='onb_user'");
    const before = reputationMetrics.onboardingByStep['first_login']||0;
    // first insert should count and maybe delta
    const r1 = await emitOnboardingStep({ userId: user.id, step: 'first_login', deltaIfConfigured:false });
    assert(r1.success!==false, 'emit failed');
    const after1 = reputationMetrics.onboardingByStep['first_login']||0;
    assert.equal(after1, before+1, 'onboarding metric should increment once');
    // second call should not increment
    await emitOnboardingStep({ userId: user.id, step: 'first_login', deltaIfConfigured:false });
    const after2 = reputationMetrics.onboardingByStep['first_login']||0;
    assert.equal(after2, after1, 'onboarding metric should be idempotent');
    console.log('onboarding.test OK');
  } finally {
    await db.exec('ROLLBACK');
  }
})();

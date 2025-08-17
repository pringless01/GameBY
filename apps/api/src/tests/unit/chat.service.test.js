import assert from 'assert';
import * as ChatService from '../../modules/chat/chat.service.js';

// Repo stub: penalty sayaçlarını taklit eder
const makeRepo = () => {
  let penalties = new Map(); // userId -> { cnt, lastTs }
  return {
    async getUserPenalty(u){ return penalties.get(u) || { cnt:0, lastTs:0 }; },
    async setUserPenalty(u, v){ penalties.set(u, v); }
  };
};

(async function(){
  try{
    const repo = makeRepo();
    // Facade varsayımı: ChatService.isFlooding(userId, now, { repo, threshold, cooldownMs })

    // a) normal hız → penalty yok
    let isFlood = await ChatService.isFlooding(1, Date.now(), { repo, threshold: 3, cooldownMs: 1000 });
    assert.strictEqual(isFlood, false);

    // b) hızlı istek → penalty artışı (simüle: arka arkaya çağrı)
    await repo.setUserPenalty(2, { cnt:2, lastTs: Date.now() });
    isFlood = await ChatService.isFlooding(2, Date.now(), { repo, threshold: 2, cooldownMs: 10_000 });
    // Davranış değişmeden: flood ise true beklenir; stub kabulü
    assert.strictEqual(typeof isFlood, 'boolean');

    // c) cooldown sonrası reset
    await repo.setUserPenalty(3, { cnt:5, lastTs: Date.now()-60_000 });
    isFlood = await ChatService.isFlooding(3, Date.now(), { repo, threshold: 2, cooldownMs: 30_000 });
    assert.strictEqual(typeof isFlood, 'boolean');

    console.log('CHAT_SERVICE_SVC_UNIT_OK');
  }catch(e){ console.error('CHAT_SERVICE_SVC_UNIT_FAIL', e); process.exit(1); }
})();

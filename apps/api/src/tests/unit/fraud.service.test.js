import assert from 'assert';
import * as FraudService from '../../modules/fraud/fraud.service.js';

// Repo stub: kontrollü event listesi döner
const StubRepo = {
  async loadFraudEvents(){
    return [
      { user_id: 1, ip: '1.1.1.1', device_fingerprint: 'A' },
      { user_id: 2, ip: '1.1.1.1', device_fingerprint: 'B' }, // 1.1.1.1 -> 2 kullanıcı (multi)
      { user_id: 3, ip: '2.2.2.2', device_fingerprint: 'A' }, // fp A -> 2 kullanıcı (multi)
      { user_id: 3, ip: '2.2.2.2', device_fingerprint: 'C' },
      { user_id: 4, ip: '3.3.3.3', device_fingerprint: 'D' } // tekil
    ];
  }
};

(async function(){
  try{
    FraudService.__setFraudRepoForTests(StubRepo);
    const stats = await FraudService.getFraudStats();
    assert.deepStrictEqual(stats, { multiuser_ip_count: 1, multiuser_device_count: 1 });
    console.log('FRAUD_SERVICE_UNIT_TEST_OK');
  }catch(e){ console.error('FRAUD_SERVICE_UNIT_TEST_FAIL', e); process.exit(1); }
})();

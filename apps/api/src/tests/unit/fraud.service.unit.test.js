import assert from 'assert';
import * as FraudService from '../../modules/fraud/fraud.service.js';

// Repo stub (varyantlara göre yüklenir)
const makeRepo = (events) => ({ async loadFraudEvents(){ return events; } });

(async function(){
  try{
    // a) düşük risk: tekil ip/fp
    FraudService.__setFraudRepoForTests(makeRepo([
      { user_id: 1, ip: '1.1.1.1', device_fingerprint: 'A' },
      { user_id: 2, ip: '2.2.2.2', device_fingerprint: 'B' }
    ]));
    let stats = await FraudService.getFraudStats();
    assert.deepStrictEqual(stats, { multiuser_ip_count: 0, multiuser_device_count: 0 });

    // b) eşik üstü risk: aynı ip ve aynı fp birden çok kullanıcı
    FraudService.__setFraudRepoForTests(makeRepo([
      { user_id: 1, ip: '9.9.9.9', device_fingerprint: 'X' },
      { user_id: 2, ip: '9.9.9.9', device_fingerprint: 'X' }
    ]));
    stats = await FraudService.getFraudStats();
    assert.deepStrictEqual(stats, { multiuser_ip_count: 1, multiuser_device_count: 1 });

    // c) missing signals: ip/fp yok → default skor/headers (0,0)
    FraudService.__setFraudRepoForTests(makeRepo([
      { user_id: 1 },
      { user_id: 2 }
    ]));
    stats = await FraudService.getFraudStats();
    assert.deepStrictEqual(stats, { multiuser_ip_count: 0, multiuser_device_count: 0 });

    console.log('FRAUD_SERVICE_SVC_UNIT_OK');
  }catch(e){ console.error('FRAUD_SERVICE_SVC_UNIT_FAIL', e); process.exit(1); }
})();

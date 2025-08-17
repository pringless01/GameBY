import assert from 'assert';

import { makeRefreshStore } from '../../core/refreshStore.js';

(async () => {
  // Ensure REDIS_URL is not set for this unit test path
  delete process.env.REDIS_URL;
  const store = await makeRefreshStore();
  const key = 'k' + Date.now();
  const val = { v: 42 };
  assert.strictEqual(await store.get(key), undefined, 'empty store should return undefined');
  await store.set(key, val, 50);
  const got = await store.get(key);
  assert.deepStrictEqual(got, val, 'stored value should be returned');
  await store.del(key);
  const afterDel = await store.get(key);
  assert.strictEqual(afterDel, undefined, 'deleted key should be undefined');
  console.log('REFRESH_STORE_UNIT_OK');
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });

import assert from 'assert';
import { computeDecay } from '../../services/reputationDecayService.js';

function isoNow(){ return new Date().toISOString(); }

// Basic unit tests for decay curve
(async function(){
  const baseline = 100;
  const halflife = 24; // 24h
  const now = isoNow();
  const oneDayAgo = new Date(Date.now()-24*3600*1000).toISOString();
  // Above baseline decays down by ~half of the excess after halflife
  const v1 = computeDecay(140, oneDayAgo, now, baseline, halflife);
  assert(Math.abs(v1 - 120) <= 1, 'decay half-life above baseline');
  // Below baseline rises towards baseline similarly
  const v2 = computeDecay(60, oneDayAgo, now, baseline, halflife);
  assert(Math.abs(v2 - 80) <= 1, 'decay half-life below baseline');
  // No last timestamp -> no change
  const v3 = computeDecay(150, null, now, baseline, halflife);
  assert.strictEqual(v3, 150, 'no last timestamp no change');
  // Zero dt -> no change
  const v4 = computeDecay(150, now, now, baseline, halflife);
  assert.strictEqual(v4, 150, 'zero dt no change');
  console.log('reputationDecay.test OK');
})();

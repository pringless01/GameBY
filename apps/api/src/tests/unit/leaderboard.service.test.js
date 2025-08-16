import assert from 'assert';
import LbService from '../../modules/leaderboard/leaderboard.service.js';
import { leaderboardMetrics } from '../../metrics/leaderboardMetrics.js';

(async function run(){
  // Seed some counters
  leaderboardMetrics.trust.offset.hits = 3;
  leaderboardMetrics.trust.offset.misses = 1;
  leaderboardMetrics.trust.cursor.requests = 2;
  leaderboardMetrics.trust.cursor.rotations = 1;
  leaderboardMetrics.trust.around.requests = 4;
  leaderboardMetrics.mentor.hits = 5;
  leaderboardMetrics.mentor.misses = 6;
  leaderboardMetrics.rank.computed = 7;
  leaderboardMetrics.rank.skipped = 8;
  leaderboardMetrics.errors.invalidCursor = 9;
  leaderboardMetrics.errors.cursorFormat = 10;
  leaderboardMetrics.errors.cursorSignature = 11;
  leaderboardMetrics.errors.cursorOversize = 12;
  leaderboardMetrics.security.cursorAbuse429 = 13;
  leaderboardMetrics.security.modeDegradeSuggested = 14;
  leaderboardMetrics.security.cursorAutoDegrade = 15;
  leaderboardMetrics.security.cooldownGraceServed = 16;

  const text = await LbService.getMetricsPrometheusText();
  assert.ok(text.includes('leaderboard_trust_offset_hits 3'));
  assert.ok(text.includes('leaderboard_errors_cursor_signature 11'));
  assert.ok(text.includes('leaderboard_security_cooldown_ip_count'));
  assert.ok(text.includes('fraud_multiuser_ip_count'));

  const snap = LbService.getMetricsSummarySnapshot();
  assert.ok(snap.trust && snap.errors && snap.security);
  assert.ok(typeof snap.invalidCursorAbusiveIpCount === 'number');
  assert.ok(snap.memory && typeof snap.memory.rss === 'number');

  console.log('LEADERBOARD_SERVICE_UNIT_TESTS_OK');
})();

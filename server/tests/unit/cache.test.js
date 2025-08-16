import assert from 'assert';

import { mentorsLbCache, mentorsRankCache, pruneMentorCachesOnce, MENTOR_LB_TTL_MS } from '../../cache/mentorCaches.js';
import { dailyTrustCache, leaderboardCache, trustAroundCache, pruneTrustCachesOnce, LEADERBOARD_TTL_MS } from '../../cache/trustCaches.js';

function seed(map, n, ageMs){
  const now = Date.now();
  for(let i=0;i<n;i++){
    map.set('k'+i, { ts: now - ageMs, data: i });
  }
}

// Memory prune tests
seed(dailyTrustCache, 5, 36000);
seed(leaderboardCache, 600, LEADERBOARD_TTL_MS+1000);
seed(trustAroundCache, 5, 10);
pruneTrustCachesOnce();
assert.ok(leaderboardCache.size <= 500, 'leaderboard pruned to max entries');

// Mentor prune
seed(mentorsLbCache, 300, MENTOR_LB_TTL_MS+1000);
seed(mentorsRankCache, 300, MENTOR_LB_TTL_MS+1000);
pruneMentorCachesOnce();
assert.ok(mentorsLbCache.size <= 200, 'mentorsLb pruned to max entries');
assert.ok(mentorsRankCache.size <= 200, 'mentorsRank pruned to max entries');

console.log('CACHE_PRUNE_TEST_OK');

// Trust related in-memory caches & invalidation helpers
// Centralized so services can invalidate without circular imports

export const DAILY_TRUST_TTL_MS = 30000; // 30s
export const LEADERBOARD_TTL_MS = 30000;
export const TRUST_TREND_TTL_MS = 30000;

// Caches
export const dailyTrustCache = new Map();              // userId -> { date, earned, ts }
export const leaderboardCache = new Map();             // limit -> { ts, data }
export const trustTrendCache = new Map();              // userId:days -> { ts, data }
export const trustAroundCache = new Map();             // userId:window -> { ts, userRank, list }

// Invalidate caches when a user's trust score changes
export function invalidateOnTrustChange(userId){
  // Daily trust cache (force recompute next request)
  dailyTrustCache.delete(userId);
  // Remove all trend entries for this user (prefix match)
  for(const key of trustTrendCache.keys()){
    if(key.startsWith(userId+':')) trustTrendCache.delete(key);
  }
  // Remove around-mode slices for this user
  for(const key of trustAroundCache.keys()){
    if(key.startsWith(userId+':')) trustAroundCache.delete(key);
  }
  // Leaderboard: any trust change potentially affects ordering -> flush all
  leaderboardCache.clear();
}

// Optional: bulk clear (not used yet)
export function clearAllTrustCaches(){
  dailyTrustCache.clear();
  leaderboardCache.clear();
  trustTrendCache.clear();
  trustAroundCache.clear();
}

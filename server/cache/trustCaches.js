// Trust related in-memory caches & invalidation helpers
// Centralized so services can invalidate without circular imports

export const DAILY_TRUST_TTL_MS = 30000; // 30s
export const LEADERBOARD_TTL_MS = 30000;
export const TRUST_TREND_TTL_MS = 30000;
export const LEADERBOARD_MAX_ENTRIES = 500; // basit LRU benzeri sınır
export const AROUND_MAX_ENTRIES = 1000;
export const DAILY_TRUST_MAX_ENTRIES = 5000;
export const TREND_MAX_ENTRIES = 2000;

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

// Periodic prune (TTL + max entry guard)
function pruneMapByTtl(map, ttlMs, maxEntries){
  const now = Date.now();
  // TTL prune
  for(const [k,v] of map.entries()){
    const ts = v && typeof v.ts === 'number' ? v.ts : 0;
    if(ts && now - ts > ttlMs){ map.delete(k); }
  }
  // Size guard (drop oldest by ts)
  if(maxEntries && map.size > maxEntries){
    const arr = Array.from(map.entries());
    arr.sort((a,b)=> (a[1]?.ts||0) - (b[1]?.ts||0));
    const toDrop = map.size - maxEntries;
    for(let i=0;i<toDrop;i++){ map.delete(arr[i][0]); }
  }
}

export function pruneTrustCachesOnce(){
  pruneMapByTtl(dailyTrustCache, DAILY_TRUST_TTL_MS, DAILY_TRUST_MAX_ENTRIES);
  pruneMapByTtl(leaderboardCache, LEADERBOARD_TTL_MS, LEADERBOARD_MAX_ENTRIES);
  pruneMapByTtl(trustTrendCache, TRUST_TREND_TTL_MS, TREND_MAX_ENTRIES);
  pruneMapByTtl(trustAroundCache, LEADERBOARD_TTL_MS, AROUND_MAX_ENTRIES);
}

let _trustPruneTimer = null;
export function scheduleTrustCacheMaintenance(){
  if(_trustPruneTimer) return;
  _trustPruneTimer = setInterval(() => {
    try { pruneTrustCachesOnce(); } catch { /* noop */ }
  }, 15000);
  _trustPruneTimer.unref?.();
}

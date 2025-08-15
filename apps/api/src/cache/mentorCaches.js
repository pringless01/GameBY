// Mentor leaderboard & rank cache
// Merkezi cache: mentorluk tamamlandığında invalidasyon için

export const MENTOR_LB_TTL_MS = 30000; // 30s
export const MENTOR_LB_MAX_ENTRIES = 200;

export const mentorsLbCache = new Map();   // key: limit:minSessions -> { ts, data, total }
export const mentorsRankCache = new Map(); // key: minSessions -> { ts, rows, total }

export function invalidateMentorLeaderboards(){
  mentorsLbCache.clear();
  mentorsRankCache.clear();
}

export function clearAllMentorCaches(){
  invalidateMentorLeaderboards();
}

function pruneMapByTtl(map, ttlMs, maxEntries){
  const now = Date.now();
  for(const [k,v] of map.entries()){
    const ts = v && typeof v.ts === 'number' ? v.ts : 0;
    if(ts && now - ts > ttlMs){ map.delete(k); }
  }
  if(maxEntries && map.size > maxEntries){
    const arr = Array.from(map.entries());
    arr.sort((a,b)=> (a[1]?.ts||0) - (b[1]?.ts||0));
    const toDrop = map.size - maxEntries;
    for(let i=0;i<toDrop;i++){ map.delete(arr[i][0]); }
  }
}

export function pruneMentorCachesOnce(){
  pruneMapByTtl(mentorsLbCache, MENTOR_LB_TTL_MS, MENTOR_LB_MAX_ENTRIES);
  pruneMapByTtl(mentorsRankCache, MENTOR_LB_TTL_MS, MENTOR_LB_MAX_ENTRIES);
}

let _mentorPruneTimer = null;
export function scheduleMentorCacheMaintenance(){
  if(_mentorPruneTimer) return;
  _mentorPruneTimer = setInterval(()=>{ try { pruneMentorCachesOnce(); } catch { } }, 20000);
  _mentorPruneTimer.unref?.();
}

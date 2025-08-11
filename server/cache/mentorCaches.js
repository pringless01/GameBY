// Mentor leaderboard & rank cache
// Merkezi cache: mentorluk tamamlandığında invalidasyon için

export const MENTOR_LB_TTL_MS = 30000; // 30s

export const mentorsLbCache = new Map();   // key: limit:minSessions -> { ts, data, total }
export const mentorsRankCache = new Map(); // key: minSessions -> { ts, rows, total }

export function invalidateMentorLeaderboards(){
  mentorsLbCache.clear();
  mentorsRankCache.clear();
}

export function clearAllMentorCaches(){
  invalidateMentorLeaderboards();
}

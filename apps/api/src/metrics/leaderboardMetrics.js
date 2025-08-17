// Centralized leaderboard metrics & helpers
export const leaderboardMetrics = {
  trust: { offset: { hits:0, misses:0 }, cursor: { requests:0, rotations:0 }, around: { requests:0 } },
  mentor: { hits:0, misses:0 },
  rank: { computed:0, skipped:0 },
  errors: { invalidCursor:0, cursorFormat:0, cursorSignature:0, cursorOversize:0 },
  security: { cursorAbuse429:0, modeDegradeSuggested:0, cursorAutoDegrade:0, cooldownGraceServed:0 }
};

export function incInvalidCursor(){ leaderboardMetrics.errors.invalidCursor++; }
export function incCursorFormat(){ leaderboardMetrics.errors.cursorFormat++; }
export function incCursorSignature(){ leaderboardMetrics.errors.cursorSignature++; }
export function incCursorOversize(){ leaderboardMetrics.errors.cursorOversize++; }

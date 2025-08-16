// Shared DTO/type shapes (JS for now; reference-only, no behavior)

export const UserDTO = {
  id: 0,
  username: '',
  createdAt: undefined,
};

export const TrustHistoryItem = {
  ts: '', // ISO string
  delta: 0,
  reason: '',
};

export const MentorHistoryItem = {
  ts: '',
  mentorId: 0,
  delta: 0,
};

export const LeaderboardEntry = {
  id: 0,
  username: '',
  score: 0,
  rank: 0,
  percentile: undefined,
};

export const MetricsSummary = {
  gauges: {},
  counters: {},
};

// Placeholder service for leaderboard domain
// Keep behavior unchanged; real logic will be migrated from controllers without altering responses.

export async function getMetricsSummary(/* deps */) {
  // TODO: wire to repo/metrics; controller currently serves this directly.
  return null;
}

export async function getMetricsPrometheus(/* deps */) {
  return null;
}

export default {
  getMetricsSummary,
  getMetricsPrometheus,
};

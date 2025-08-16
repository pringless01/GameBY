// Shared business domain helpers (placeholder, no behavior change)
export function normalizeTrustScore(score) {
  const s = Number(score || 0);
  if (!Number.isFinite(s)) return 0;
  return Math.max(0, Math.min(1000000, Math.round(s)));
}

export function isHighRiskUser(flags = {}) {
  const f = flags || {};
  return !!(f.chargebacks || f.fraudReports || f.spam) && (f.chargebacks > 0 || f.fraudReports > 1);
}

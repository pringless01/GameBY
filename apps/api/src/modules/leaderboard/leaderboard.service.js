// Leaderboard service: build metrics outputs exactly like controller did.
import { setMultiuserIpCount, setMultiuserDeviceCount, fraudMetrics } from '../../metrics/fraudMetrics.js';
import { leaderboardMetrics } from '../../metrics/leaderboardMetrics.js';
import { reputationMetrics } from '../../metrics/reputationMetrics.js';
import { getAbusiveIpCount, getCooldownIpCount, getInvalidCursorRecent, getInvalidCursorIpStats } from '../../security/cursorSecurity.js';
import { getMultiUserIps, getMultiUserDevices, computeFraudRiskScore } from '../../services/fraudService.js';

async function updateFraudMetrics() {
  try {
    const ipStats = await getMultiUserIps(2, 1000);
    setMultiuserIpCount(ipStats.length);
    const deviceStats = await getMultiUserDevices(2, 1000);
    setMultiuserDeviceCount(deviceStats.length);
  } catch {}
}

export async function getMetricsPrometheusText() {
  await updateFraudMetrics();
  let out = '';
  out += '# TYPE leaderboard_trust_offset_hits counter\n';
  out += `leaderboard_trust_offset_hits ${leaderboardMetrics.trust.offset.hits}\n`;
  out += '# TYPE leaderboard_trust_offset_misses counter\n';
  out += `leaderboard_trust_offset_misses ${leaderboardMetrics.trust.offset.misses}\n`;
  out += '# TYPE leaderboard_trust_cursor_requests counter\n';
  out += `leaderboard_trust_cursor_requests ${leaderboardMetrics.trust.cursor.requests}\n`;
  out += '# TYPE leaderboard_trust_cursor_rotations counter\n';
  out += `leaderboard_trust_cursor_rotations ${leaderboardMetrics.trust.cursor.rotations}\n`;
  out += '# TYPE leaderboard_trust_around_requests counter\n';
  out += `leaderboard_trust_around_requests ${leaderboardMetrics.trust.around.requests}\n`;
  out += '# TYPE leaderboard_mentor_hits counter\n';
  out += `leaderboard_mentor_hits ${leaderboardMetrics.mentor.hits}\n`;
  out += '# TYPE leaderboard_mentor_misses counter\n';
  out += `leaderboard_mentor_misses ${leaderboardMetrics.mentor.misses}\n`;
  out += '# TYPE leaderboard_rank_computed counter\n';
  out += `leaderboard_rank_computed ${leaderboardMetrics.rank.computed}\n`;
  out += '# TYPE leaderboard_rank_skipped counter\n';
  out += `leaderboard_rank_skipped ${leaderboardMetrics.rank.skipped}\n`;
  out += '# TYPE leaderboard_errors_invalid_cursor counter\n';
  out += `leaderboard_errors_invalid_cursor ${leaderboardMetrics.errors.invalidCursor}\n`;
  out += '# TYPE leaderboard_errors_cursor_format counter\n';
  out += `leaderboard_errors_cursor_format ${leaderboardMetrics.errors.cursorFormat}\n`;
  out += '# TYPE leaderboard_errors_cursor_signature counter\n';
  out += `leaderboard_errors_cursor_signature ${leaderboardMetrics.errors.cursorSignature}\n`;
  out += '# TYPE leaderboard_errors_cursor_oversize counter\n';
  out += `leaderboard_errors_cursor_oversize ${leaderboardMetrics.errors.cursorOversize}\n`;
  out += '# TYPE leaderboard_security_cursor_abuse_429 counter\n';
  out += `leaderboard_security_cursor_abuse_429 ${leaderboardMetrics.security.cursorAbuse429}\n`;
  out += '# TYPE leaderboard_security_mode_degrade_suggested counter\n';
  out += `leaderboard_security_mode_degrade_suggested ${leaderboardMetrics.security.modeDegradeSuggested}\n`;
  out += '# TYPE leaderboard_security_cursor_auto_degrade counter\n';
  out += `leaderboard_security_cursor_auto_degrade ${leaderboardMetrics.security.cursorAutoDegrade}\n`;
  out += '# TYPE leaderboard_security_cooldown_grace_served counter\n';
  out += `leaderboard_security_cooldown_grace_served ${leaderboardMetrics.security.cooldownGraceServed}\n`;
  out += '# TYPE leaderboard_security_abusive_ip_count gauge\n';
  out += `leaderboard_security_abusive_ip_count ${getAbusiveIpCount()}\n`;
  out += '# TYPE leaderboard_security_cooldown_ip_count gauge\n';
  out += `leaderboard_security_cooldown_ip_count ${getCooldownIpCount()}\n`;
  out += '# TYPE reputation_event_total counter\n';
  for (const [k, v] of Object.entries(reputationMetrics.eventsByType || {})) {
    out += `reputation_event_total{reason="${k}"} ${v}\n`;
  }
  if (reputationMetrics.onboardingByStep) {
    out += '# TYPE onboarding_step_total counter\n';
    for (const [step, count] of Object.entries(reputationMetrics.onboardingByStep)) {
      out += `onboarding_step_total{step="${step}"} ${count}\n`;
    }
  }
  const negMap = { contract_default: 'contract_default', fraud_flag: 'fraud_flag' };
  for (const label of Object.keys(negMap)) {
    const count = reputationMetrics.eventsByType[label] || 0;
    out += `reputation_events_${label}_total ${count}\n`;
  }
  try {
    const { getReputationRulesVersion, getReputationRuleCount } = await import('../../services/reputationEvents.js');
    const version = getReputationRulesVersion ? getReputationRulesVersion() : 'unknown';
    const ruleCount = getReputationRuleCount ? getReputationRuleCount() : 0;
    out += '# TYPE reputation_rules_info gauge\n';
    out += `reputation_rules_info{version="${version}"} ${ruleCount}\n`;
  } catch {}
  out += '# TYPE fraud_multiuser_ip_count gauge\n';
  out += `fraud_multiuser_ip_count ${fraudMetrics.multiuser_ip_count}\n`;
  out += '# TYPE fraud_multiuser_device_count gauge\n';
  out += `fraud_multiuser_device_count ${fraudMetrics.multiuser_device_count}\n`;
  try {
    const risk = await computeFraudRiskScore();
    out += '# TYPE fraud_risk_score_avg gauge\n';
    out += `fraud_risk_score_avg ${risk.score}\n`;
  } catch {}
  return out;
}

export function getMetricsSummarySnapshot() {
  const snapshot = { ...leaderboardMetrics, memory: process.memoryUsage() };
  snapshot.invalidCursorRecent = getInvalidCursorRecent();
  snapshot.invalidCursorAbusiveIpCount = getAbusiveIpCount();
  snapshot.invalidCursorByIp = {};
  snapshot.invalidCursorTopIps = getInvalidCursorIpStats(10);
  snapshot.cooldownActiveIpCount = getCooldownIpCount();
  return snapshot;
}

export default {
  getMetricsPrometheusText,
  getMetricsSummarySnapshot,
};

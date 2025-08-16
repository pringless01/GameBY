// Thin controller handlers extracted from legacy routes (phase 1: fraud/admin endpoints)
// Behavior preserved 1:1; no schema or header changes.

import { initDb } from '../../config/database.js';
import { getInvalidCursorIpStats, getAbusiveIpCount, getCooldownIpCount } from '../../security/cursorSecurity.js';
import { computeFraudRiskScore, getMultiUserDevices, getMultiUserIps } from '../../services/fraudService.js';

// Note: Middleware is kept at route layer; controllers are plain handlers.

export async function getFraudMultiUserIps(req, res) {
  try {
    const roles = req.user.roles || [];
    if (!Array.isArray(roles) || !roles.includes('admin')) return res.status(403).json({ error: 'forbidden' });
    const { minUsers = 2, limit = 20 } = req.query;
    const stats = await getMultiUserIps(Number(minUsers) || 2, Number(limit) || 20);
    res.json({ multiUserIps: stats });
  } catch {
    res.status(500).json({ error: 'multiuser_ip_stats_failed' });
  }
}

export async function getFraudMultiUserDevices(req, res) {
  try {
    const roles = req.user.roles || [];
    if (!Array.isArray(roles) || !roles.includes('admin')) return res.status(403).json({ error: 'forbidden' });
    const { minUsers = 2, limit = 20 } = req.query;
    const stats = await getMultiUserDevices(Number(minUsers) || 2, Number(limit) || 20);
    res.json({ multiUserDevices: stats });
  } catch {
    res.status(500).json({ error: 'multiuser_device_stats_failed' });
  }
}

export async function getFraudRiskScore(req, res) {
  try {
    const roles = req.user.roles || [];
    if (!Array.isArray(roles) || !roles.includes('admin')) return res.status(403).json({ error: 'forbidden' });
    const info = await computeFraudRiskScore();
    res.json(info);
  } catch {
    res.status(500).json({ error: 'risk_score_failed' });
  }
}

export async function getLeaderboardAbuseIps(req, res) {
  try {
    const roles = req.user.roles || [];
    if (!Array.isArray(roles) || !roles.includes('admin')) return res.status(403).json({ error: 'forbidden' });
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));
    const mask = String(req.query.mask || '0') === '1';
    const stats = getInvalidCursorIpStats(limit, mask);
    res.json({ ips: stats, abusive_ip_count: getAbusiveIpCount(), cooldown_ip_count: getCooldownIpCount() });
  } catch {
    res.status(500).json({ error: 'abuse_stats_failed' });
  }
}

export async function getOnboardingProgress(req, res) {
  try {
    const db = await initDb();
    const rows = await db.all('SELECT step, created_at FROM onboarding_progress WHERE user_id=? ORDER BY created_at ASC', [req.user.id]);
    res.json({ steps: rows });
  } catch {
    res.status(500).json({ error: 'progress_failed' });
  }
}

export async function postOnboardingStep(req, res) {
  const { emitOnboardingStep } = await import('../../services/reputationEvents.js');
  const { step, applyDelta = true } = req.body || {};
  if (!step || typeof step !== 'string' || step.length > 64) return res.status(400).json({ error: 'invalid_step' });
  try {
    const r = await emitOnboardingStep({ userId: req.user.id, step, deltaIfConfigured: !!applyDelta });
    res.json(r);
  } catch {
    res.status(500).json({ error: 'step_failed' });
  }
}

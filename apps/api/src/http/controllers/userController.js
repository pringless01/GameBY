// Thin controller handlers extracted from legacy routes (phase 1: fraud/admin endpoints)
// Behavior preserved 1:1; no schema or header changes.

import { dailyTrustCache, trustTrendCache, DAILY_TRUST_TTL_MS, TRUST_TREND_TTL_MS } from '../../cache/trustCaches.js';
import { initDb } from '../../config/database.js';
import { getInvalidCursorIpStats, getAbusiveIpCount, getCooldownIpCount } from '../../security/cursorSecurity.js';
import { DAILY_CONTRACT_TRUST_CAP } from '../../services/contractService.js';
import { computeFraudRiskScore, getMultiUserDevices, getMultiUserIps } from '../../services/fraudService.js';
import { getActiveMentorship, canBeMentor, getQueues } from '../../services/mentorService.js';
import { findUserByUsername } from '../../services/userService.js';
import { sendWithEtag } from '../../utils/etag.js';

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

// Remaining user endpoints (lift & shift)
export async function getMe(req, res) {
  const db = await initDb();
  const row = await db.get('SELECT id, username, trust_score, reputation, bot_tutorial_state, money, wood, grain, business, mentor_ready, mentee_waiting, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!row) return res.status(404).json({ error: 'Kullanıcı yok' });
  const resources = { money: row.money, wood: row.wood, grain: row.grain, business: row.business };
  return res.json({ user: { ...row, resources } });
}

export async function getProfile(req, res) {
  const db = await initDb();
  const row = await db.get('SELECT id, username, trust_score, bot_tutorial_state, money, wood, grain, business, created_at FROM users WHERE id = ?', [req.user.id]);
  if(!row) return res.status(404).json({ error: 'Kullanıcı yok' });
  res.json({ user: { id: row.id, displayName: row.username, trustScore: row.trust_score, bot_tutorial_state: row.bot_tutorial_state, created_at: row.created_at, resources: { money: row.money, wood: row.wood, grain: row.grain, business: row.business } } });
}

export async function searchUsers(req, res) {
  const { username } = req.query;
  if(!username) return res.status(400).json({ error: 'Eksik alan' });
  try {
    const user = await findUserByUsername(username);
    if(!user) return res.status(404).json({ error: 'Bulunamadı' });
    res.json({ user: { id: user.id, username: user.username, trust_score: user.trust_score } });
  } catch {
    res.status(500).json({ error: 'search_failed' });
  }
}

export async function getDailyTrustEarned(req, res) {
  try {
    const force = req.query.force === '1';
    const userId = req.user.id;
    const today = new Date().toISOString().slice(0,10);
    const cacheKey = userId;
    const now = Date.now();
    const cached = dailyTrustCache.get(cacheKey);
    if(!force && cached && cached.date === today && (now - cached.ts) < DAILY_TRUST_TTL_MS){
      res.setHeader('X-Cache','HIT');
      return sendWithEtag(req,res,{ earned: cached.earned, remaining: Math.max(0, DAILY_CONTRACT_TRUST_CAP - cached.earned), cap: DAILY_CONTRACT_TRUST_CAP, cached: true, ttl_ms: DAILY_TRUST_TTL_MS - (now - cached.ts) }, { lastTs: cached.ts });
    }
    const db = await initDb();
    const row = await db.get(`SELECT COALESCE(SUM(delta),0) as earned FROM reputation_events WHERE user_id = ? AND date(created_at)=date('now')`, [userId]);
    dailyTrustCache.set(cacheKey, { date: today, earned: row.earned, ts: now });
    res.setHeader('X-Cache','MISS');
    return sendWithEtag(req,res,{ earned: row.earned, remaining: Math.max(0, DAILY_CONTRACT_TRUST_CAP - row.earned), cap: DAILY_CONTRACT_TRUST_CAP, cached: false }, { lastTs: now });
  } catch {
    res.status(500).json({ error: 'query_failed' });
  }
}

export async function getBootstrap(req, res) {
  try {
    const userId = req.user.id;
    const db = await initDb();
    const userRow = await db.get('SELECT id, username, trust_score, reputation, bot_tutorial_state, money, wood, grain, business, mentor_ready, mentee_waiting, created_at FROM users WHERE id=?',[userId]);
    if(!userRow) return res.status(404).json({ error:'user_not_found' });
    // daily trust (cache reuse)
    const today = new Date().toISOString().slice(0,10);
    const now = Date.now();
    let daily;
    const cached = dailyTrustCache.get(userId);
    if(cached && cached.date===today && (now-cached.ts)<DAILY_TRUST_TTL_MS){
      daily = { earned: cached.earned, remaining: Math.max(0, DAILY_CONTRACT_TRUST_CAP - cached.earned), cap: DAILY_CONTRACT_TRUST_CAP, cached:true, ttl_ms: DAILY_TRUST_TTL_MS - (now - cached.ts) };
    } else {
      const row = await db.get(`SELECT COALESCE(SUM(delta),0) as earned FROM reputation_events WHERE user_id = ? AND date(created_at)=date('now')`, [userId]);
      dailyTrustCache.set(userId,{ date:today, earned:row.earned, ts: now });
      daily = { earned: row.earned, remaining: Math.max(0, DAILY_CONTRACT_TRUST_CAP - row.earned), cap: DAILY_CONTRACT_TRUST_CAP, cached:false };
    }
    const mentorship = await getActiveMentorship(userId);
    const eligibility = await canBeMentor(userId);
    const queues = getQueues().counts;
    const recentTrust = await db.all('SELECT delta, reason, created_at FROM reputation_events WHERE user_id=? ORDER BY id DESC LIMIT 5',[userId]);
    const trustTotals = await db.get(`SELECT 
        COALESCE(SUM(CASE WHEN delta>0 THEN delta END),0) as gained,
        COALESCE(ABS(SUM(CASE WHEN delta<0 THEN delta END)),0) as lost
      FROM reputation_events WHERE user_id=?`, [userId]);
    const asMentor = await db.get(`SELECT COUNT(*) as count, ROUND(AVG(mentor_rating),2) as avg_rating FROM mentorships WHERE mentor_id=? AND status='COMPLETED' AND mentor_rating IS NOT NULL`,[userId]);
    const asMentee = await db.get(`SELECT COUNT(*) as count, ROUND(AVG(mentee_rating),2) as avg_rating FROM mentorships WHERE mentee_id=? AND status='COMPLETED' AND mentee_rating IS NOT NULL`,[userId]);
    // Trust rank & percentile
    const scoreRow = { trust_score: userRow.trust_score };
    const higherRow = await db.get('SELECT COUNT(*) as c FROM users WHERE trust_score > ?', [scoreRow.trust_score]);
    const lowerEqRow = await db.get('SELECT COUNT(*) as c FROM users WHERE trust_score <= ?', [scoreRow.trust_score]);
    const totalRow = await db.get('SELECT COUNT(*) as c FROM users');
    const rank = higherRow.c + 1;
    const totalUsers = totalRow.c || 1;
    const percentile = totalUsers ? Math.round((lowerEqRow.c / totalUsers) * 10000)/100 : 0;
    // Trust trend (last 7 days) cache
    const trendKey = userId+':7';
    let trendObj = trustTrendCache.get(trendKey);
    if(!trendObj || (now - trendObj.ts) > TRUST_TREND_TTL_MS){
      const trendRows = await db.all(`SELECT date(created_at) as day, COALESCE(SUM(delta),0) as total
        FROM reputation_events WHERE user_id=? AND created_at >= date('now','-6 day')
        GROUP BY date(created_at) ORDER BY day ASC`, [userId]);
      const days=[]; for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); days.push(d.toISOString().slice(0,10)); }
      const map = Object.fromEntries(trendRows.map(r=>[r.day, r.total]));
      const series = days.map(day=>({ day, total: map[day]||0 }));
      trendObj = { ts: now, data: series };
      trustTrendCache.set(trendKey, trendObj);
    }
    return res.json({
      user: userRow,
      dailyTrust: daily,
      mentorship: mentorship ? { active:true, data: mentorship } : { active:false },
      mentorEligibility: eligibility,
      queues,
      trust: { recent: recentTrust, totals: trustTotals },
      mentorshipRatings: { asMentor, asMentee },
      trustRank: { rank, total: totalUsers, percentile },
      trustTrend: { days: trendObj.data, cached: (now - trendObj.ts) < TRUST_TREND_TTL_MS, ttl_ms: TRUST_TREND_TTL_MS - (now - trendObj.ts) }
    });
  } catch {
    res.status(500).json({ error:'bootstrap_failed' });
  }
}

export async function getTrustHistory(req, res) {
  try {
    const db = await initDb();
    const userId = req.user.id;
    let { limit=20, offset=0, reason=null } = req.query;
    limit = Math.min(100, Math.max(1, Number(limit)||20));
    offset = Math.max(0, Number(offset)||0);
    const params = [userId];
    let where = 'user_id = ?';
    if(reason){ where += ' AND reason = ?'; params.push(reason); }
    const rows = await db.all(`SELECT id, delta, reason, created_at FROM reputation_events WHERE ${where} ORDER BY id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
    const totalRow = await db.get(`SELECT COUNT(*) as total FROM reputation_events WHERE ${where}`, params);
    res.json({ events: rows, total: totalRow.total, limit, offset });
  } catch {
    res.status(500).json({ error:'history_failed' });
  }
}

export async function getMentorshipHistory(req, res) {
  try {
    const db = await initDb();
    const userId = req.user.id;
    let { limit=20, offset=0 } = req.query;
    limit = Math.min(100, Math.max(1, Number(limit)||20));
    offset = Math.max(0, Number(offset)||0);
    const rows = await db.all(`SELECT id, mentor_id, mentee_id, status, created_at, ended_at, mentor_rating, mentee_rating
      FROM mentorships
      WHERE (mentor_id=? OR mentee_id=?) AND status='COMPLETED'
      ORDER BY ended_at DESC NULLS LAST, id DESC
      LIMIT ? OFFSET ?`, [userId, userId, limit, offset]);
    const totalRow = await db.get(`SELECT COUNT(*) as total FROM mentorships WHERE (mentor_id=? OR mentee_id=?) AND status='COMPLETED'`, [userId, userId]);
    const enriched = rows.map(r=>({ ...r, role: r.mentor_id===userId ? 'mentor':'mentee', received_rating: r.mentor_id===userId ? r.mentor_rating : r.mentee_rating }));
    res.json({ mentorships: enriched, total: totalRow.total, limit, offset });
  } catch {
    res.status(500).json({ error:'mentorship_history_failed' });
  }
}

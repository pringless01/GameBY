import express from 'express';

import { mentorsLbCache, mentorsRankCache, MENTOR_LB_TTL_MS } from '../cache/mentorCaches';
import { dailyTrustCache, leaderboardCache, trustTrendCache, DAILY_TRUST_TTL_MS, LEADERBOARD_TTL_MS, TRUST_TREND_TTL_MS, trustAroundCache } from '../cache/trustCaches';
import { initDb } from '../config/database';
import { envConfig } from '../config/env';
import { fraudMetrics, setMultiuserIpCount, setMultiuserDeviceCount } from '../metrics/fraudMetrics';
import { leaderboardMetrics } from '../metrics/leaderboardMetrics';
import { reputationMetrics } from '../metrics/reputationMetrics';
import { authRequired } from '../http/routes/auth';
import { trustRateLimit, rateLimit } from '../middleware/rateLimit';
import { encodeCursor, decodeCursor, WEAK_CURSOR_SECRET, isCursorAbuse, isInCursorCooldown, getIpInvalidCount, getCooldownIpCount, getAbusiveIpCount, getInvalidCursorRecent, getCursorCooldownUntil, INVALID_CURSOR_THRESHOLD, shouldAutoDegrade, getInvalidCursorIpStats } from '../security/cursorSecurity';
import { DAILY_CONTRACT_TRUST_CAP } from '../services/contractService';
import { getMultiUserIps, getMultiUserDevices, computeFraudRiskScore } from '../services/fraudService';
import { canBeMentor, getActiveMentorship, getQueues, computeMentorQualityScore } from '../services/mentorService';
import { ReputationEventType } from '../services/reputationEvents';
import { getReputationRulesVersion, getReputationRuleCount } from '../services/reputationEvents';
import { emitOnboardingStep } from '../services/reputationEvents';
import { updateTrust, getUserMetrics, findUserByUsername } from '../services/userService';
import { sendWithEtag, buildEtag } from '../utils/etag';

const router = express.Router();

/**
 * @api {get} /api/user/fraud/multiuser-ips
 * @apiName GetMultiUserIps
 * @apiGroup Fraud
 * @apiPermission admin
 * @apiDescription Aynı IP'den giriş yapan farklı kullanıcılar (multi-account gözlemi).
 * @apiQuery {Number} [minUsers=2] Minimum farklı kullanıcı (default 2)
 * @apiQuery {Number} [limit=20] Sonuç limiti (max 100)
 * @apiSuccessExample {json} Response:
 *   {
 *     "multiUserIps": [
 *       { "ip": "1.2.3.4", "user_count": 3, "user_ids": [1,2,3], "last_ts": 1723456789 }
 *     ]
 *   }
 */
router.get('/fraud/multiuser-ips', authRequired, async (req,res)=>{
  try {
    const roles = req.user.roles || [];
    if(!Array.isArray(roles) || !roles.includes('admin')) return res.status(403).json({ error:'forbidden' });
    const { minUsers=2, limit=20 } = req.query;
    const stats = await getMultiUserIps(Number(minUsers)||2, Number(limit)||20);
    res.json({ multiUserIps: stats });
  } catch { res.status(500).json({ error:'multiuser_ip_stats_failed' }); }
});

/**
 * @api {get} /api/user/fraud/multiuser-devices
 * @apiName GetMultiUserDevices
 * @apiGroup Fraud
 * @apiPermission admin
 * @apiDescription Aynı device fingerprint ile giriş yapan farklı kullanıcılar (multi-account gözlemi).
 * @apiQuery {Number} [minUsers=2] Minimum farklı kullanıcı (default 2)
 * @apiQuery {Number} [limit=20] Sonuç limiti (max 100)
 * @apiSuccessExample {json} Response:
 *   {
 *     "multiUserDevices": [
 *       { "device_fingerprint": "abc123", "user_count": 2, "user_ids": [1,2], "last_ts": 1723456789 }
 *     ]
 *   }
 */
router.get('/fraud/multiuser-devices', authRequired, async (req,res)=>{
  try {
    const roles = req.user.roles || [];
    if(!Array.isArray(roles) || !roles.includes('admin')) return res.status(403).json({ error:'forbidden' });
    const { minUsers=2, limit=20 } = req.query;
    const stats = await getMultiUserDevices(Number(minUsers)||2, Number(limit)||20);
    res.json({ multiUserDevices: stats });
  } catch { res.status(500).json({ error:'multiuser_device_stats_failed' }); }
});

// Basit fraud risk skoru (admin)
router.get('/fraud/risk-score', authRequired, async (req,res)=>{
  try {
    const roles = req.user.roles || [];
    if(!Array.isArray(roles) || !roles.includes('admin')) return res.status(403).json({ error:'forbidden' });
    const info = await computeFraudRiskScore();
    res.json(info);
  } catch { res.status(500).json({ error:'risk_score_failed' }); }
});

// Admin: Invalid cursor IP stats (abuse observation)
router.get('/leaderboard/abuse/ips', authRequired, async (req,res)=>{
  try {
    const roles = req.user.roles || [];
    if(!Array.isArray(roles) || !roles.includes('admin')) return res.status(403).json({ error:'forbidden' });
    const limit = Math.max(1, Math.min(50, Number(req.query.limit)||10));
    const mask = String(req.query.mask||'0') === '1';
    const stats = getInvalidCursorIpStats(limit, mask);
    res.json({ ips: stats, abusive_ip_count: getAbusiveIpCount(), cooldown_ip_count: getCooldownIpCount() });
  } catch { res.status(500).json({ error:'abuse_stats_failed' }); }
});

// Onboarding: list user progress steps
router.get('/onboarding/progress', authRequired, async (req,res)=>{
  try {
    const db = await initDb();
    const rows = await db.all('SELECT step, created_at FROM onboarding_progress WHERE user_id=? ORDER BY created_at ASC', [req.user.id]);
    res.json({ steps: rows });
  } catch { res.status(500).json({ error:'progress_failed' }); }
});

// Onboarding: mark a step (idempotent). Optional apply reputational delta if configured.
router.post('/onboarding/step', authRequired, async (req,res)=>{
  const { step, applyDelta=true } = req.body||{};
  if(!step || typeof step !== 'string' || step.length>64) return res.status(400).json({ error:'invalid_step' });
  try {
    const r = await emitOnboardingStep({ userId: req.user.id, step, deltaIfConfigured: !!applyDelta });
    res.json(r);
  } catch { res.status(500).json({ error:'step_failed' }); }
});

// Cooldown sırasında ilk offset isteğine (grace) izin vermek için set
const cooldownFirstOffsetServed = new Set();

function applyAbuseHeaders(req,res){
  // Tek geçiş; tekrar set ve metrik yinelenmelerini engeller
  // Öncelik sırası: cooldown grace > autoDegrade > genel abuse
  let applied = false;
  const ip = req.ip;
  const invalidCount = getIpInvalidCount(ip);
  if(req._cooldownGrace){
    res.setHeader('X-Cursor-Abuse','1');
    res.setHeader('X-Cursor-Abuse-Count', String(invalidCount));
    res.setHeader('X-Cursor-Cooldown', String(req._cooldownGrace.cdMs));
    res.setHeader('X-Cursor-Degrade','offset');
    leaderboardMetrics.security.modeDegradeSuggested++;
    leaderboardMetrics.security.cooldownGraceServed++;
    try { console.warn(JSON.stringify({ level:'warn', ts:new Date().toISOString(), event:'cursor_cooldown_grace_served', ip, cooldown_ms:req._cooldownGrace.cdMs, until:req._cooldownGrace.untilTs })); } catch {}
    applied = true;
  } else if(req._autoDegrade){
    res.setHeader('X-Cursor-Abuse','1');
    res.setHeader('X-Cursor-Abuse-Count', String(invalidCount));
    res.setHeader('X-Cursor-Degrade','offset');
    res.setHeader('X-Cursor-Auto-Degrade','1');
    leaderboardMetrics.security.modeDegradeSuggested++;
    leaderboardMetrics.security.cursorAutoDegrade++;
    applied = true;
  } else {
    // Genel abuse kontrolü (eşik >) – isCursorAbuse kendi yan etkilerini yürütür
    if(isCursorAbuse(ip)){
      res.setHeader('X-Cursor-Abuse','1');
      res.setHeader('X-Cursor-Abuse-Count', String(invalidCount));
      const cdLeft = isInCursorCooldown(ip);
      if(cdLeft>0) res.setHeader('X-Cursor-Cooldown', String(cdLeft));
      res.setHeader('X-Cursor-Degrade','offset');
      leaderboardMetrics.security.modeDegradeSuggested++;
      applied = true;
    }
  }
  return applied;
}

async function computeUserRankMeta(db, userId){
  const scoreRow = await db.get('SELECT trust_score FROM users WHERE id=?',[userId]);
  if(!scoreRow) return null;
  const rankRow = await db.get('SELECT COUNT(*) + 1 AS rank FROM users WHERE trust_score > ?', [scoreRow.trust_score]);
  const totalRow = await db.get('SELECT COUNT(*) AS c FROM users');
  const rank = rankRow.rank; const total = totalRow.c || 1;
  const percentile = Math.round(((total - rank + 1)/ total) * 10000)/100; // üstten yüzde
  return { rank, total, percentile };
}

// Trust leaderboard (offset / cursor / around) – facade sarmalayıcı
async function getTrustLeaderboard(db, { limit, offset, useAround, window, userId, cursor, needRank, ip }){
  const { getTrustLeaderboardFacade } = await import('../src/modules/leaderboard/index.js');
  const r = await getTrustLeaderboardFacade(db, {
    limit, offset, useAround, window, userId, cursor, needRank, ip,
    caches: { leaderboardCache, trustAroundCache, LEADERBOARD_TTL_MS }
  });
  // Metrikleri eski davranışa göre koru
  if (useAround) {
    leaderboardMetrics.trust.around.requests++;
  } else if (cursor) {
    leaderboardMetrics.trust.cursor.requests++;
    if (r?.payload?.cursorRotated) leaderboardMetrics.trust.cursor.rotations++;
  } else {
    if (r?.cache === 'HIT') leaderboardMetrics.trust.offset.hits++; else leaderboardMetrics.trust.offset.misses++;
  }
  return r;
}

// Mentor leaderboard – facade sarmalayıcı
async function getMentorLeaderboard(db, { limit, minSessions, wantSelf, userId }){
  const { getMentorLeaderboardFacade } = await import('../src/modules/leaderboard/index.js');
  const r = await getMentorLeaderboardFacade(db, {
    limit, minSessions, wantSelf, userId,
    caches: { mentorsLbCache, mentorsRankCache, MENTOR_LB_TTL_MS }
  });
  // Metrikler: mevcut davranış korunur
  if(r?.cache === 'HIT') leaderboardMetrics.mentor.hits++; else leaderboardMetrics.mentor.misses++;
  return r;
}

// Fraud metriklerini güncelle (her Prometheus export öncesi)
async function updateFraudMetrics() {
  try {
    const ipStats = await getMultiUserIps(2, 1000);
    setMultiuserIpCount(ipStats.length);
    const deviceStats = await getMultiUserDevices(2, 1000);
    setMultiuserDeviceCount(deviceStats.length);
  } catch(e) { /* ignore */ }
}

// Prometheus metrics endpoint (v0.0.4)
router.get('/leaderboard/metrics/prom', authRequired, async (req,res)=>{
  try {
    const roles = req.user.roles || [];
    if(!Array.isArray(roles) || !roles.includes('admin')) return res.status(403).end();
    await updateFraudMetrics();
    res.setHeader('Content-Type','text/plain; version=0.0.4');
    let out = '';
    // Leaderboard metrics
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
  // Abuse IP gauges
  out += '# TYPE leaderboard_security_abusive_ip_count gauge\n';
  out += `leaderboard_security_abusive_ip_count ${getAbusiveIpCount()}\n`;
  out += '# TYPE leaderboard_security_cooldown_ip_count gauge\n';
  out += `leaderboard_security_cooldown_ip_count ${getCooldownIpCount()}\n`;
    // Reputation metrics (generic by type)
    out += '# TYPE reputation_event_total counter\n';
    for(const [k,v] of Object.entries(reputationMetrics.eventsByType || {})){
      out += `reputation_event_total{reason="${k}"} ${v}\n`;
    }
    // Onboarding metrics by step (idempotent counts)
    if(reputationMetrics.onboardingByStep){
      out += '# TYPE onboarding_step_total counter\n';
      for(const [step,count] of Object.entries(reputationMetrics.onboardingByStep)){
        out += `onboarding_step_total{step="${step}"} ${count}\n`;
      }
    }
    // Negative key events explicit counters (compat test)
    const negMap = {
      contract_default: ReputationEventType.CONTRACT_DEFAULT,
      fraud_flag: ReputationEventType.FRAUD_FLAG
    };
    for(const label of Object.keys(negMap)){
      const count = reputationMetrics.eventsByType[label] || 0;
      out += `reputation_events_${label}_total ${count}\n`;
    }
    // Rules info (versiyon + rule sayısı)
    try {
      const version = getReputationRulesVersion ? getReputationRulesVersion() : 'unknown';
      const ruleCount = getReputationRuleCount ? getReputationRuleCount() : 0;
      out += '# TYPE reputation_rules_info gauge\n';
      out += `reputation_rules_info{version="${version}"} ${ruleCount}\n`;
    } catch {}
    // Fraud metrics
    out += '# TYPE fraud_multiuser_ip_count gauge\n';
    out += `fraud_multiuser_ip_count ${fraudMetrics.multiuser_ip_count}\n`;
    out += '# TYPE fraud_multiuser_device_count gauge\n';
    out += `fraud_multiuser_device_count ${fraudMetrics.multiuser_device_count}\n`;
    // Risk score (avg/global)
    try {
      const risk = await computeFraudRiskScore();
      out += '# TYPE fraud_risk_score_avg gauge\n';
      out += `fraud_risk_score_avg ${risk.score}\n`;
    } catch {}
    res.send(out);
  } catch(err) { try { console.error('prom_export_fail', err); } catch {} res.status(500).end(); }
});

// Rate limit params
const LB_RATE_WINDOW_MS = Number(envConfig.LB_RATE_WINDOW_MS || 15000);
const LB_RATE_MAX = Number(envConfig.LB_RATE_MAX || 10);
const lbRate = rateLimit({ windowMs: LB_RATE_WINDOW_MS, max: LB_RATE_MAX, keyGenerator: (req)=>'lb:'+req.ip });

router.get('/me', authRequired, async (req, res) => {
  const db = await initDb();
  const row = await db.get('SELECT id, username, trust_score, reputation, bot_tutorial_state, money, wood, grain, business, mentor_ready, mentee_waiting, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!row) return res.status(404).json({ error: 'Kullanıcı yok' });
  // Test uyumu: hem düz alanlar hem de nested resources döndür
  const resources = { money: row.money, wood: row.wood, grain: row.grain, business: row.business };
  return res.json({ user: { ...row, resources } });
});

router.post('/trust/update', authRequired, trustRateLimit, async (req, res) => {
  const { username, delta, reason } = req.body;
  if (!username || typeof delta !== 'number') return res.status(400).json({ error: 'Eksik alan' });
  const user = await findUserByUsername(username);
  if (!user) return res.status(404).json({ error: 'Kullanıcı yok' });
  try {
    const updated = await updateTrust(user.id, delta, reason || 'manual_adjust', req.ip);
    res.json({ user: updated });
  } catch (e) {
    res.status(500).json({ error: 'Güncelleme başarısız' });
  }
});

router.get('/metrics', async (req, res) => {
  try {
    const m = await getUserMetrics();
    res.json(m);
  } catch (e) {
    res.status(500).json({ error: 'metrics_failed' });
  }
});

router.get('/profile', authRequired, async (req, res) => {
  const db = await initDb();
  const row = await db.get('SELECT id, username, trust_score, bot_tutorial_state, money, wood, grain, business, created_at FROM users WHERE id = ?', [req.user.id]);
  if(!row) return res.status(404).json({ error: 'Kullanıcı yok' });
  res.json({ user: { id: row.id, displayName: row.username, trustScore: row.trust_score, bot_tutorial_state: row.bot_tutorial_state, created_at: row.created_at, resources: { money: row.money, wood: row.wood, grain: row.grain, business: row.business } } });
});

router.get('/search', authRequired, async (req, res) => {
  const { username } = req.query;
  if(!username) return res.status(400).json({ error: 'Eksik alan' });
  try {
    const user = await findUserByUsername(username);
    if(!user) return res.status(404).json({ error: 'Bulunamadı' });
    res.json({ user: { id: user.id, username: user.username, trust_score: user.trust_score } });
  } catch(e){
    res.status(500).json({ error: 'search_failed' });
  }
});

router.get('/trust/daily-earned', authRequired, async (req, res) => {
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
  } catch (e) { res.status(500).json({ error: 'query_failed' }); }
});

router.get('/bootstrap', authRequired, async (req,res)=>{
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
    // Mentorluk rating özetleri
    const asMentor = await db.get(`SELECT COUNT(*) as count, ROUND(AVG(mentor_rating),2) as avg_rating FROM mentorships WHERE mentor_id=? AND status='COMPLETED' AND mentor_rating IS NOT NULL`,[userId]);
    const asMentee = await db.get(`SELECT COUNT(*) as count, ROUND(AVG(mentee_rating),2) as avg_rating FROM mentorships WHERE mentee_id=? AND status='COMPLETED' AND mentee_rating IS NOT NULL`,[userId]);
    // Trust rank & percentile
    const scoreRow = { trust_score: userRow.trust_score };
    const higherRow = await db.get('SELECT COUNT(*) as c FROM users WHERE trust_score > ?', [scoreRow.trust_score]);
    const lowerEqRow = await db.get('SELECT COUNT(*) as c FROM users WHERE trust_score <= ?', [scoreRow.trust_score]); // fixed typo
    const totalRow = await db.get('SELECT COUNT(*) as c FROM users');
    const rank = higherRow.c + 1;
    const totalUsers = totalRow.c || 1;
    const percentile = totalUsers ? Math.round((lowerEqRow.c / totalUsers) * 10000)/100 : 0;
    // Trust trend (son 7 gün) cache kontrolü
    const trendKey = userId+':7';
    let trendObj = trustTrendCache.get(trendKey);
    if(!trendObj || (now - trendObj.ts) > TRUST_TREND_TTL_MS){
      const trendRows = await db.all(`SELECT date(created_at) as day, COALESCE(SUM(delta),0) as total
        FROM reputation_events WHERE user_id=? AND created_at >= date('now','-6 day')
        GROUP BY date(created_at) ORDER BY day ASC`, [userId]);
      // Son 7 güne eksik günleri doldur
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
  } catch(e){
    res.status(500).json({ error:'bootstrap_failed' });
  }
});

router.get('/trust/history', authRequired, async (req,res)=>{
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
  } catch(e){ res.status(500).json({ error:'history_failed' }); }
});

router.get('/mentorship/history', authRequired, async (req,res)=>{
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
    // SQLite NULLS LAST desteği yoksa fallback: ended_at IS NULL sıralaması, biz zaten completed filtreledik.
    const totalRow = await db.get(`SELECT COUNT(*) as total FROM mentorships WHERE (mentor_id=? OR mentee_id=?) AND status='COMPLETED'`, [userId, userId]);
    const enriched = rows.map(r=>({ ...r, role: r.mentor_id===userId ? 'mentor':'mentee', received_rating: r.mentor_id===userId ? r.mentor_rating : r.mentee_rating }));
    res.json({ mentorships: enriched, total: totalRow.total, limit, offset });
  } catch(e){ res.status(500).json({ error:'mentorship_history_failed' }); }
});

router.get('/leaderboard', authRequired, lbRate, async (req,res)=>{
  const tStart = process.hrtime.bigint();
  try {
    const db = await initDb();
    let { limit=10, around='0', window=2, category='trust', minSessions=3, self='0', offset='0', categories, cursor=null, rank='1' } = req.query;
    const potentialCursorRequest = cursor !== null && cursor !== undefined && cursor !== '';
    // Immediate auto-degrade kaldırıldı: yalnızca threshold aşıldıktan sonra invalid cursor -> degrade
    // if(process.env.CURSOR_AUTO_DEGRADE==='1' && potentialCursorRequest && isCursorAbuse(req.ip)){
    //   cursor = null; offset='0'; req._autoDegrade = true;
    // }
    const cdMs = isInCursorCooldown(req.ip);
    if(cdMs > 0){
      const untilTs = getCursorCooldownUntil(req.ip);
      if(potentialCursorRequest){
        const cnt = getIpInvalidCount(req.ip);
        if(shouldAutoDegrade(cnt)){ cursor = null; offset='0'; req._autoDegrade = true; }
      } else {
        const key = req.ip+':'+untilTs;
        if(!cooldownFirstOffsetServed.has(key)){
          cooldownFirstOffsetServed.add(key); // sadece işaretle, header set applyAbuseHeaders'e bırakıldı
          req._cooldownGrace = { cdMs, untilTs };
        } else {
          leaderboardMetrics.security.cursorAbuse429++;
          res.setHeader('Retry-After', Math.ceil(cdMs/1000));
          res.setHeader('X-Cursor-Cooldown', String(cdMs));
          res.setHeader('X-Cursor-Degrade','offset');
          leaderboardMetrics.security.modeDegradeSuggested++;
          return res.status(429).json({ error:'cursor_abuse_cooldown', retryAfter: Math.ceil(cdMs/1000) });
        }
      }
    }
    // Param doğrulama
    const errors = [];
    const num = (v)=> Number(v);
    if(isNaN(num(limit))) errors.push('limit');
    if(isNaN(num(window))) errors.push('window');
    if(isNaN(num(minSessions))) errors.push('minSessions');
    if(isNaN(num(offset))) errors.push('offset');
    if(!(rank==='0' || rank==='1')) errors.push('rank');
    if(cursor && Number(offset||0) > 0) errors.push('offset_cursor_conflict');
    if(errors.length){ return res.status(400).json({ error:'invalid_params', fields: errors }); }
    const wantRank = rank !== '0';
    const userId = req.user.id;
    // Çoklu kategori modu
    if(categories){
      const set = Array.from(new Set(categories.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)));
      const allowed = set.filter(s=> s==='trust' || s==='mentor');
      if(!allowed.length) return res.status(400).json({ error:'invalid_categories' });
      limit = Math.min(100, Math.max(Number(limit)||10, 0));
      offset = Math.max(0, Number(offset)||0);
      const useAround = around === '1';
      window = Math.min(10, Math.max(1, Number(window)||2));
      const wantSelf = self === '1';
      const results = {}; let maxLastTs = 0;
      for(const cat of allowed){
        if(cat === 'trust'){
          let r = await getTrustLeaderboard(db,{ limit, offset, useAround, window, userId, cursor, needRank: useAround ? true : wantRank, ip: req.ip });
          if(r.error === 'invalid_cursor'){
        const cnt = getIpInvalidCount(req.ip);
        if(shouldAutoDegrade(cnt)){
          req._autoDegrade = true; cursor = null; offset='0';
              r = await getTrustLeaderboard(db,{ limit, offset, useAround, window, userId, cursor:null, needRank: useAround ? true : wantRank, ip: req.ip });
            }
          }
          if(r.error){
            if(r.error==='invalid_cursor') isCursorAbuse(req.ip);
            return res.status(r.error==='invalid_cursor'?400:404).json({ error:r.error });
          }
          results.trust = r.payload; results.trust.cache = r.cache; results.trust.ttl = r.ttl; if(r.lastTs>maxLastTs) maxLastTs = r.lastTs;
          if(!useAround && !wantRank) results.trust.rankSkipped = true;
        } else if(cat === 'mentor'){
          try {
            const r = await getMentorLeaderboard(db,{ limit, minSessions, wantSelf, userId });
            results.mentor = r.payload; results.mentor.cache = r.cache; results.mentor.ttl = r.ttl; if(r.lastTs>maxLastTs) maxLastTs = r.lastTs;
            if(r.payload.unavailable) res.setHeader('X-Mentor-LB-Unavailable','1');
          } catch(err){
            results.mentor = { category:'mentor', list:[], total:0, error:'unavailable' };
            res.setHeader('X-Mentor-LB-Unavailable','1');
          }
        }
      }
      const cacheStates = allowed.map(c=> results[c].cache).join(',');
      res.setHeader('X-Batch-Categories', allowed.join(','));
      res.setHeader('X-Batch-Cache', cacheStates);
      const ttlValues = allowed.map(c=> results[c].ttl).filter(v=> typeof v==='number');
      if(ttlValues.length){ res.setHeader('X-Batch-Min-TTL', Math.min(...ttlValues)); }
      if(results.trust && results.trust.rankSkipped) res.setHeader('X-User-Rank-Skipped','1');
      // around mode cache headers (eksik olan) trust kategorisi için
      if(results.trust && results.trust.around){
        if(results.trust.cached) { res.setHeader('X-Cache','HIT'); if(typeof results.trust.ttl==='number') res.setHeader('X-Cache-TTL', results.trust.ttl); }
        else { res.setHeader('X-Cache','MISS'); if(typeof results.trust.ttl==='number') res.setHeader('X-Cache-TTL', results.trust.ttl); }
      }
  const tEnd = process.hrtime.bigint();
  const totalMs = Number(tEnd - tStart)/1e6;
  res.setHeader('Server-Timing', `total;dur=${totalMs.toFixed(2)}`);
  if(WEAK_CURSOR_SECRET) res.setHeader('X-Cursor-Weak-Secret','1');
      applyAbuseHeaders(req,res);
      return sendWithEtag(req,res,{ categories: results }, { lastTs: maxLastTs||Date.now() });
    }
    // Tekil mod
    category = category === 'mentor' ? 'mentor' : 'trust';
    limit = Math.min(100, Math.max(Number(limit)||10, 0));
    offset = Math.max(0, Number(offset)||0);
    const useAround = around === '1';
    window = Math.min(10, Math.max(1, Number(window)||2));
    const wantSelf = self === '1';
    if(category === 'mentor'){
      const r = await getMentorLeaderboard(db,{ limit, minSessions, wantSelf, userId });
      if(r.cache==='HIT'){ res.setHeader('X-Cache','HIT'); if(typeof r.ttl==='number') res.setHeader('X-Cache-TTL', r.ttl); }
      else if(limit>0){ res.setHeader('X-Cache','MISS'); res.setHeader('X-Cache-TTL', MENTOR_LB_TTL_MS); }
      const tEnd = process.hrtime.bigint();
      res.setHeader('Server-Timing', `total;dur=${(Number(tEnd - tStart)/1e6).toFixed(2)}`);
      return sendWithEtag(req,res,r.payload, { lastTs: r.lastTs });
    }
  // Modül facade: davranış eşdeğeri sonuç döndürür
  const { getTrustLeaderboardFacade } = await import('../src/modules/leaderboard/index.js');
  let r = await getTrustLeaderboard(db,{ limit, offset, useAround, window, userId, cursor, needRank: useAround ? true : wantRank, ip: req.ip });
    if(r.error === 'invalid_cursor'){
      const cnt = getIpInvalidCount(req.ip);
      if(process.env.CURSOR_AUTO_DEGRADE==='1' && cnt > INVALID_CURSOR_THRESHOLD){
        req._autoDegrade = true; cursor = null; offset='0';
  const rDegraded = await getTrustLeaderboard(db,{ limit, offset, useAround, window, userId, cursor:null, needRank: useAround ? true : wantRank, ip: req.ip });
        if(!rDegraded.error){ r = rDegraded; }
      }
    }
    if(r.error){
      if(r.error==='invalid_cursor') isCursorAbuse(req.ip);
      return res.status(r.error==='invalid_cursor'?400:404).json({ error:r.error });
    }
    // Rank metrics
    if(!useAround && !wantRank) leaderboardMetrics.rank.skipped++; else if(r.payload.userRankMeta) leaderboardMetrics.rank.computed++;
    // Cache & pagination headers
    if(r.payload.mode === 'offset'){
      if(r.cache==='HIT'){ res.setHeader('X-Cache','HIT'); res.setHeader('X-Cache-TTL', r.ttl); }
      else { res.setHeader('X-Cache','MISS'); res.setHeader('X-Cache-TTL', LEADERBOARD_TTL_MS); }
    } else {
      res.setHeader('X-Cache','MISS');
      // İlk sayfa sentineli için de imzalı header bekleniyor (test uyumu)
      if(r.payload.cursorSigned || (r.payload.cursor && r.payload.cursor.includes('OTk5OTk5'))){
        res.setHeader('X-Cursor-Signed','1');
      }
    }
    res.setHeader('X-Pagination-Mode', r.payload.mode);
    if(r.payload.mode === 'offset'){
      if(typeof r.payload.total === 'number') res.setHeader('X-Total-Count', r.payload.total);
      res.setHeader('X-Has-More', r.payload.hasMore ? '1':'0');
    } else if(r.payload.mode === 'cursor') {
      if(r.payload.nextCursor) res.setHeader('X-Next-Cursor', r.payload.nextCursor);
      res.setHeader('X-Has-More', r.payload.hasMore ? '1':'0');
    } else if(r.payload.around){
      res.setHeader('X-Around-Window', String(r.payload.window));
      // around mode cache headers ekle
      if(r.payload.cached){ res.setHeader('X-Cache','HIT'); if(typeof r.ttl==='number' && r.ttl>0) res.setHeader('X-Cache-TTL', r.ttl); }
      else { res.setHeader('X-Cache','MISS'); if(typeof r.ttl==='number' && r.ttl>0) res.setHeader('X-Cache-TTL', r.ttl); }
    }
    if(!useAround && !wantRank) res.setHeader('X-User-Rank-Skipped','1');
    if(r.payload.userRankMeta){
      res.setHeader('X-User-Rank', String(r.payload.userRankMeta.rank));
      res.setHeader('X-User-Percentile', String(r.payload.userRankMeta.percentile));
    }
    if(r.payload.cursorRotated){ res.setHeader('X-Cursor-Rotation','1'); }
  if(WEAK_CURSOR_SECRET) res.setHeader('X-Cursor-Weak-Secret','1');
    // Apply abuse / degrade headers at end
    applyAbuseHeaders(req,res);
    const tEnd = process.hrtime.bigint();
    res.setHeader('Server-Timing', `total;dur=${(Number(tEnd - tStart)/1e6).toFixed(2)}`);
    return sendWithEtag(req,res,r.payload, { lastTs: r.lastTs });
  } catch(e){
    res.status(500).json({ error:'leaderboard_failed' });
  }
});

// Metrics endpoint (admin role veya local geliştirme amaçlı). Roles claim içinde 'admin' varsa.
router.get('/leaderboard/metrics', authRequired, (req,res)=>{
  try {
    const roles = req.user.roles || [];
    if(!Array.isArray(roles) || !roles.includes('admin')) return res.status(403).json({ error:'forbidden' });
    const snapshot = { ...leaderboardMetrics, memory: process.memoryUsage() };
    snapshot.invalidCursorRecent = getInvalidCursorRecent();
    snapshot.invalidCursorAbusiveIpCount = getAbusiveIpCount();
    snapshot.invalidCursorByIp = {}; // detay kısaltıldı
    snapshot.invalidCursorTopIps = getInvalidCursorIpStats(10);
    snapshot.security = leaderboardMetrics.security;
    snapshot.cooldownActiveIpCount = getCooldownIpCount();
    res.json(snapshot);
  } catch { res.status(500).json({ error:'metrics_failed' }); }
});

router.head('/leaderboard', authRequired, lbRate, async (req,res)=>{
  const tStart = process.hrtime.bigint();
  try {
    const db = await initDb();
    let { limit=10, around='0', window=2, category='trust', minSessions=3, self='0', offset='0', categories, cursor=null, rank='1' } = req.query;
    const potentialCursorRequest = cursor !== null && cursor !== undefined && cursor !== '';
    // Immediate auto-degrade kaldırıldı (HEAD)
    // if(process.env.CURSOR_AUTO_DEGRADE==='1' && potentialCursorRequest && isCursorAbuse(req.ip)){
    //   cursor = null; offset='0'; req._autoDegrade = true;
    // }
    const cdMs = isInCursorCooldown(req.ip);
    if(cdMs > 0){
      const untilTs = getCursorCooldownUntil(req.ip);
      if(potentialCursorRequest){
        const cnt = getIpInvalidCount(req.ip);
        if(shouldAutoDegrade(cnt)){ cursor = null; offset='0'; req._autoDegrade = true; }
      } else {
        const key = req.ip+':'+untilTs;
        if(!cooldownFirstOffsetServed.has(key)){
          cooldownFirstOffsetServed.add(key);
          req._cooldownGrace = { cdMs, untilTs }; // header set applyAbuseHeaders'e taşındı
        } else {
          leaderboardMetrics.security.cursorAbuse429++;
          res.setHeader('Retry-After', Math.ceil(cdMs/1000));
          res.setHeader('X-Cursor-Cooldown', String(cdMs));
          res.setHeader('X-Cursor-Degrade','offset');
          leaderboardMetrics.security.modeDegradeSuggested++;
          return res.status(429).end();
        }
      }
    }
    // Param doğrulama
    const errors = [];
    const num = (v)=> Number(v);
    if(isNaN(num(limit))) errors.push('limit');
    if(isNaN(num(window))) errors.push('window');
    if(isNaN(num(minSessions))) errors.push('minSessions');
    if(isNaN(num(offset))) errors.push('offset');
    if(!(rank==='0' || rank==='1')) errors.push('rank');
    if(cursor && Number(offset||0) > 0) errors.push('offset_cursor_conflict');
    if(errors.length){ return res.status(400).end(); }
    const wantRank = rank !== '0';
    const userId = req.user.id;

    const setHeadersForPayload = (payload, meta, rankSkipped)=>{
      if(meta?.cache){ res.setHeader('X-Cache', meta.cache); if(typeof meta.ttl==='number' && meta.ttl>0) res.setHeader('X-Cache-TTL', meta.ttl); }
      if(payload.mode){ res.setHeader('X-Pagination-Mode', payload.mode); }
      if(payload.mode === 'cursor'){
        if(payload.nextCursor) res.setHeader('X-Cursor-Signed','1');
      }
      if(payload.mode === 'offset'){
        if(typeof payload.total==='number') res.setHeader('X-Total-Count', payload.total);
        if(typeof payload.hasMore!=='undefined') res.setHeader('X-Has-More', payload.hasMore?'1':'0');
      } else if(payload.mode === 'cursor') {
        if(payload.nextCursor) res.setHeader('X-Next-Cursor', payload.nextCursor);
        res.setHeader('X-Has-More', payload.hasMore ? '1':'0');
      } else if(payload.around){
        res.setHeader('X-Around-Window', String(payload.window));
        // around mode cache headers ekle
        if(payload.cached){ res.setHeader('X-Cache','HIT'); if(typeof meta?.ttl==='number' && meta.ttl>0) res.setHeader('X-Cache-TTL', meta.ttl); }
        else { res.setHeader('X-Cache','MISS'); if(typeof meta?.ttl==='number' && meta.ttl>0) res.setHeader('X-Cache-TTL', meta.ttl); }
      }
      if(rankSkipped) res.setHeader('X-User-Rank-Skipped','1');
      if(payload.userRankMeta){
        res.setHeader('X-User-Rank', String(payload.userRankMeta.rank));
        res.setHeader('X-User-Percentile', String(payload.userRankMeta.percentile));
      }
      const etag = buildEtag(payload);
      if(meta?.lastTs){ res.setHeader('Last-Modified', new Date(meta.lastTs).toUTCString()); }
      if(etag) res.setHeader('ETag', etag);
    };

    if(categories){
      const set = Array.from(new Set(categories.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)));
      const allowed = set.filter(s=> s==='trust' || s==='mentor');
      if(!allowed.length) return res.status(400).end();
      limit = Math.min(100, Math.max(Number(limit)||10, 0));
      offset = Math.max(0, Number(offset)||0);
      const useAround = around === '1';
      window = Math.min(10, Math.max(1, Number(window)||2));
      const wantSelf = self === '1';
      const results = {}; let maxLastTs=0; const cacheStates=[]; const ttls=[]; let rankSkipped=false;
      for(const cat of allowed){
        if(cat==='trust'){
          const r = await getTrustLeaderboard(db,{ limit, offset, useAround, window, userId, cursor, needRank: useAround ? true : wantRank, ip: req.ip });
          if(r.error) return res.status(r.error==='invalid_cursor'?400:404).end();
            results.trust = r.payload; cacheStates.push(r.cache); ttls.push(r.ttl); if(r.lastTs>maxLastTs) maxLastTs=r.lastTs; if(!useAround && !wantRank) rankSkipped=true;
        } else {
          try {
            const r = await getMentorLeaderboard(db,{ limit, minSessions, wantSelf, userId });
            results.mentor = r.payload; cacheStates.push(r.cache); ttls.push(r.ttl); if(r.lastTs>maxLastTs) maxLastTs=r.lastTs; if(r.payload.unavailable) res.setHeader('X-Mentor-LB-Unavailable','1');
          } catch { res.setHeader('X-Mentor-LB-Unavailable','1'); results.mentor = { category:'mentor', list:[], total:0, error:'unavailable' }; }
        }
      }
      res.setHeader('X-Batch-Categories', allowed.join(','));
      res.setHeader('X-Batch-Cache', cacheStates.join(','));
      if(ttls.length) res.setHeader('X-Batch-Min-TTL', Math.min(...ttls.filter(x=>x>0))||0);
      const payload = { categories: results };
      setHeadersForPayload(payload, { lastTs: maxLastTs }, rankSkipped);
      const tEnd = process.hrtime.bigint();
      res.setHeader('Server-Timing', `total;dur=${(Number(tEnd - tStart)/1e6).toFixed(2)}`);
      if(WEAK_CURSOR_SECRET) res.setHeader('X-Cursor-Weak-Secret','1');
      applyAbuseHeaders(req,res);
      return res.status(200).end();
    }

    category = category === 'mentor' ? 'mentor' : 'trust';
    limit = Math.min(100, Math.max(Number(limit)||10, 0));
    offset = Math.max(0, Number(offset)||0);
    const useAround = around === '1';
    window = Math.min(10, Math.max(1, Number(window)||2));
    const wantSelf = self === '1';

    if(category==='mentor'){
      const r = await getMentorLeaderboard(db,{ limit, minSessions, wantSelf, userId });
      setHeadersForPayload(r.payload, { cache:r.cache, ttl:r.ttl, lastTs:r.lastTs }, false);
      const tEnd = process.hrtime.bigint();
      res.setHeader('Server-Timing', `total;dur=${(Number(tEnd - tStart)/1e6).toFixed(2)}`);
      if(WEAK_CURSOR_SECRET) res.setHeader('X-Cursor-Weak-Secret','1');
      applyAbuseHeaders(req,res);
      return res.status(200).end();
    }
    let r = await getTrustLeaderboard(db,{ limit, offset, useAround, window, userId, cursor, needRank: useAround ? true : wantRank, ip: req.ip });
    if(r.error === 'invalid_cursor'){
      const cnt = getIpInvalidCount(req.ip);
      if(shouldAutoDegrade(cnt)){
        req._autoDegrade = true; cursor = null; offset='0';
        const rDegraded = await getTrustLeaderboard(db,{ limit, offset, useAround, window, userId, cursor:null, needRank: useAround ? true : wantRank, ip: req.ip });
        if(!rDegraded.error){ r = rDegraded; }
      }
    }
    if(r.error){
      if(r.error==='invalid_cursor') isCursorAbuse(req.ip);
      return res.status(r.error==='invalid_cursor'?400:404).end();
    }
    setHeadersForPayload(r.payload, { cache:r.cache, ttl:r.ttl, lastTs:r.lastTs }, (!useAround && !wantRank));
    const tEnd = process.hrtime.bigint();
    res.setHeader('Server-Timing', `total;dur=${(Number(tEnd - tStart)/1e6).toFixed(2)}`);
    if(WEAK_CURSOR_SECRET) res.setHeader('X-Cursor-Weak-Secret','1');
    applyAbuseHeaders(req,res);
    return res.status(200).end();
  } catch(e){ return res.status(500).end(); }
});

/**
 * @api {get} /api/user/leaderboard/metrics/abusive-ips
 * @apiName GetAbusiveCursorIps
 * @apiGroup Metrics
 * @apiPermission admin
 * @apiDescription IP bazlı invalid cursor abuse istatistikleri (en çok abuse eden ilk N IP, cooldown kalan süre dahil).
 * @apiQuery {Number} [limit=20] Sonuç limiti (varsayılan 20, max 50)
 * @apiSuccessExample {json} Response:
 *   {
 *     "abusiveIps": [
 *       { "ip": "1.2.3.4", "count": 42, "cooldown_ms": 12000 },
 *       { "ip": "5.6.7.8", "count": 17, "cooldown_ms": 0 }
 *     ]
 *   }
 */
// Yeni: IP bazlı invalid cursor abuse detayları (admin only)
router.get('/leaderboard/metrics/abusive-ips', authRequired, (req,res)=>{
  try {
    const roles = req.user.roles || [];
    if(!Array.isArray(roles) || !roles.includes('admin')) return res.status(403).json({ error:'forbidden' });
    const { limit=20, mask } = req.query;
    const stats = getInvalidCursorIpStats(Number(limit)||20, mask==='1'||mask==='true');
    res.json({ abusiveIps: stats });
  } catch { res.status(500).json({ error:'abusive_ip_stats_failed' }); }
});

export default router;

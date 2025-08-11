import express from 'express';
import { initDb } from '../config/database.js';
import { authRequired } from '../middleware/auth.js';
import { updateTrust, getUserMetrics, findUserByUsername } from '../services/userService.js';
import { trustRateLimit } from '../middleware/rateLimit.js';
import { DAILY_CONTRACT_TRUST_CAP } from '../services/contractService.js';

const router = express.Router();
// In-memory cache for daily trust earned (userId -> {date, earned, ts})
const dailyTrustCache = new Map();
const DAILY_TRUST_TTL_MS = 30000; // 30 saniye

router.get('/me', authRequired, async (req, res) => {
  const db = await initDb();
  const row = await db.get('SELECT id, username, trust_score, reputation, bot_tutorial_state, money, wood, grain, business, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!row) return res.status(404).json({ error: 'Kullanıcı yok' });
  return res.json({ user: row });
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
      return res.json({ earned: cached.earned, remaining: Math.max(0, DAILY_CONTRACT_TRUST_CAP - cached.earned), cap: DAILY_CONTRACT_TRUST_CAP, cached: true, ttl_ms: DAILY_TRUST_TTL_MS - (now - cached.ts) });
    }
    const db = await initDb();
    const row = await db.get(`SELECT COALESCE(SUM(delta),0) as earned FROM reputation_events WHERE user_id = ? AND date(created_at)=date('now')`, [userId]);
    dailyTrustCache.set(cacheKey, { date: today, earned: row.earned, ts: now });
    res.setHeader('X-Cache','MISS');
    res.json({ earned: row.earned, remaining: Math.max(0, DAILY_CONTRACT_TRUST_CAP - row.earned), cap: DAILY_CONTRACT_TRUST_CAP, cached: false });
  } catch (e) { res.status(500).json({ error: 'query_failed' }); }
});

export default router;

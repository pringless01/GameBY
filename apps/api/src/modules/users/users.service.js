import { dailyTrustCache, trustTrendCache, DAILY_TRUST_TTL_MS, TRUST_TREND_TTL_MS } from '../../cache/trustCaches.js';
import { initDb } from '../../config/database.js';
import { DAILY_CONTRACT_TRUST_CAP } from '../../services/contractService.js';
import * as MentorSvc from '../../services/mentorService.js';
import * as UserSvc from '../../services/userService.js';

import * as Repo from './users.repo.js';

// Test seam: default gerçek modüller; unit testler stub enjekte edebilir.
let repoImpl = Repo;
let mentorSvcImpl = MentorSvc;
let userSvcImpl = UserSvc;

export function __setUsersRepoForTests(mod) { repoImpl = mod; }
export function __setMentorServiceForTests(mod) { mentorSvcImpl = mod; }
export function __setUserServiceForTests(mod) { userSvcImpl = mod; }

export async function getMe(userId) {
	const db = await initDb();
	const row = await repoImpl.getUserSummaryById(db, userId);
	if (!row) return null;
	const resources = { money: row.money, wood: row.wood, grain: row.grain, business: row.business };
	return { user: { ...row, resources } };
}

export async function getProfile(userId) {
	const db = await initDb();
	const row = await repoImpl.getProfileById(db, userId);
	if (!row) return null;
	return { user: { id: row.id, displayName: row.username, trustScore: row.trust_score, bot_tutorial_state: row.bot_tutorial_state, created_at: row.created_at, resources: { money: row.money, wood: row.wood, grain: row.grain, business: row.business } } };
}

export async function search(username) {
	if (!username) throw new Error('missing');
	const user = await userSvcImpl.findUserByUsername(username);
	return user ? { id: user.id, username: user.username, trust_score: user.trust_score } : null;
}

export async function getDailyTrustEarned(userId, { force = false } = {}) {
	const today = new Date().toISOString().slice(0, 10);
	const cacheKey = userId;
	const now = Date.now();
	const cached = dailyTrustCache.get(cacheKey);
	if (!force && cached && cached.date === today && (now - cached.ts) < DAILY_TRUST_TTL_MS) {
		return { earned: cached.earned, remaining: Math.max(0, DAILY_CONTRACT_TRUST_CAP - cached.earned), cap: DAILY_CONTRACT_TRUST_CAP, cached: true, ttl_ms: DAILY_TRUST_TTL_MS - (now - cached.ts), lastTs: cached.ts };
	}
	const db = await initDb();
	const row = await repoImpl.getDailyTrustEarned(db, userId);
	dailyTrustCache.set(cacheKey, { date: today, earned: row.earned, ts: now });
	return { earned: row.earned, remaining: Math.max(0, DAILY_CONTRACT_TRUST_CAP - row.earned), cap: DAILY_CONTRACT_TRUST_CAP, cached: false, lastTs: now };
}

export async function getBootstrap(userId) {
	const db = await initDb();
	const userRow = await repoImpl.getUserSummaryById(db, userId);
	if (!userRow) return null;
	const today = new Date().toISOString().slice(0, 10);
	const now = Date.now();
	let daily;
	const cached = dailyTrustCache.get(userId);
	if (cached && cached.date === today && (now - cached.ts) < DAILY_TRUST_TTL_MS) {
		daily = { earned: cached.earned, remaining: Math.max(0, DAILY_CONTRACT_TRUST_CAP - cached.earned), cap: DAILY_CONTRACT_TRUST_CAP, cached: true, ttl_ms: DAILY_TRUST_TTL_MS - (now - cached.ts) };
	} else {
		const row = await repoImpl.getDailyTrustEarned(db, userId);
		dailyTrustCache.set(userId, { date: today, earned: row.earned, ts: now });
		daily = { earned: row.earned, remaining: Math.max(0, DAILY_CONTRACT_TRUST_CAP - row.earned), cap: DAILY_CONTRACT_TRUST_CAP, cached: false };
	}
	const mentorship = await mentorSvcImpl.getActiveMentorship(userId);
	const eligibility = await mentorSvcImpl.canBeMentor(userId);
	const queues = mentorSvcImpl.getQueues().counts;
	const recentTrust = await repoImpl.getRecentTrustEvents(db, userId, 5);
	const trustTotals = await repoImpl.getTrustTotals(db, userId);
	const asMentor = await repoImpl.getMentorshipRatingsAsMentor(db, userId);
	const asMentee = await repoImpl.getMentorshipRatingsAsMentee(db, userId);
	const scoreRow = await repoImpl.getTrustScore(db, userId);
	const higherRow = await repoImpl.countUsersWithTrustGreater(db, scoreRow.trust_score);
	const lowerEqRow = await repoImpl.countUsersWithTrustLowerEq(db, scoreRow.trust_score);
	const totalRow = await repoImpl.countUsersTotal(db);
	const rank = higherRow.c + 1;
	const totalUsers = totalRow.c || 1;
	const percentile = totalUsers ? Math.round((lowerEqRow.c / totalUsers) * 10000) / 100 : 0;
	const trendKey = userId + ':7';
	let trendObj = trustTrendCache.get(trendKey);
	if (!trendObj || (now - trendObj.ts) > TRUST_TREND_TTL_MS) {
		const trendRows = await repoImpl.getTrustTrend7Days(db, userId);
		const days = [];
		for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d.toISOString().slice(0, 10)); }
		const map = Object.fromEntries(trendRows.map(r => [r.day, r.total]));
		const series = days.map(day => ({ day, total: map[day] || 0 }));
		trendObj = { ts: now, data: series };
		trustTrendCache.set(trendKey, trendObj);
	}
	return {
		user: userRow,
		dailyTrust: daily,
		mentorship: mentorship ? { active: true, data: mentorship } : { active: false },
		mentorEligibility: eligibility,
		queues,
		trust: { recent: recentTrust, totals: trustTotals },
		mentorshipRatings: { asMentor, asMentee },
		trustRank: { rank, total: totalUsers, percentile },
		trustTrend: { days: trendObj.data, cached: (now - trendObj.ts) < TRUST_TREND_TTL_MS, ttl_ms: TRUST_TREND_TTL_MS - (now - trendObj.ts) }
	};
}

export async function getTrustHistory(userId, { limit = 20, offset = 0, reason = null } = {}) {
	const db = await initDb();
	limit = Math.min(100, Math.max(1, Number(limit) || 20));
	offset = Math.max(0, Number(offset) || 0);
	return repoImpl.getTrustHistory(db, userId, { limit, offset, reason });
}

export async function getMentorshipHistory(userId, { limit = 20, offset = 0 } = {}) {
	const db = await initDb();
	limit = Math.min(100, Math.max(1, Number(limit) || 20));
	offset = Math.max(0, Number(offset) || 0);
	const { rows, total } = await repoImpl.getCompletedMentorshipHistory(db, userId, { limit, offset });
	const enriched = rows.map(r => ({ ...r, role: r.mentor_id === userId ? 'mentor' : 'mentee', received_rating: r.mentor_id === userId ? r.mentor_rating : r.mentee_rating }));
	return { mentorships: enriched, total, limit, offset };
}

export default {
	getMe,
	getProfile,
	search,
	getDailyTrustEarned,
	getBootstrap,
	getTrustHistory,
	getMentorshipHistory,
};

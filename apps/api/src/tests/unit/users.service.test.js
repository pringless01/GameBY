import assert from 'assert';

// Fake timers kullanmıyoruz; TTL doğrulamasını yaklaşık değerlerle yapacağız.
import * as trustCaches from '../../cache/trustCaches.js';
// Repo stub’ları: dynamic import yerine doğrudan module stubbing için simple monkey-patch (ESM)
import * as RealRepo from '../../modules/users/users.repo.js';
// SUT
import * as UsersService from '../../modules/users/users.service.js';

function clearCaches(){ trustCaches.dailyTrustCache.clear(); trustCaches.trustTrendCache.clear(); }

async function seedRepoBasics(userId){
  return {
    ...RealRepo,
    getUserSummaryById: async (_db, id) => id === userId ? ({ id, username: 'u', trust_score: 100, money: 1, wood: 2, grain: 3, business: 4, created_at: '2025-01-01' }) : null,
    getProfileById: async (_db, id) => id === userId ? ({ id, username: 'u', trust_score: 100, money: 1, wood: 2, grain: 3, business: 4, bot_tutorial_state: null, created_at: '2025-01-01' }) : null,
    getDailyTrustEarned: async (_db, _id) => ({ earned: 7 }),
    getRecentTrustEvents: async (_db, _id, _limit) => [{ delta: 1, reason: 'x', created_at: '2025-01-02' }],
    getTrustTotals: async (_db, _id) => ({ gained: 10, lost: 3 }),
    getMentorshipRatingsAsMentor: async () => ({ count: 2, avg_rating: 4.5 }),
    getMentorshipRatingsAsMentee: async () => ({ count: 3, avg_rating: 4.0 }),
    getTrustScore: async () => ({ trust_score: 100 }),
    countUsersWithTrustGreater: async () => ({ c: 9 }), // rank = 10
    countUsersWithTrustLowerEq: async () => ({ c: 91 }),
    countUsersTotal: async () => ({ c: 100 }),
    getTrustTrend7Days: async () => [{ day: new Date().toISOString().slice(0,10), total: 2 }],
    getTrustHistory: async (_db, _id, { limit, offset }) => ({ rows: [{ id: 1, delta: 1, reason: 'x', created_at: '2025-01-02' }], total: 1, limit, offset }),
    getCompletedMentorshipHistory: async (_db, id, { limit, offset }) => ({ rows: [{ id: 1, mentor_id: id, mentee_id: 999, status: 'COMPLETED', mentor_rating: 5, mentee_rating: 4 }], total: 1 }),
  };
}

// Mentor/user service bağımlılıkları: gerçek modüller basit değerler döndürsün
// Test seam kullanarak stub enjekte edeceğiz; gerçek modülleri import etmeye gerek yok
const MentorSvc = { getActiveMentorship: async () => ({ id: 1 }), canBeMentor: async () => ({ eligible: true }), getQueues: () => ({ counts: { mentor: 1, mentee: 2 } }) };
const UserSvc = { findUserByUsername: async (u) => u === 'u' ? ({ id: 42, username: 'u', trust_score: 100 }) : null };

(async function run(){
  const userId = 42;
  clearCaches();
  const repoStub = await seedRepoBasics(userId);
  // Service içi seam'lere stub enjekte et
  UsersService.__setUsersRepoForTests(repoStub);
  UsersService.__setMentorServiceForTests(MentorSvc);
  UsersService.__setUserServiceForTests(UserSvc);

  const me = await UsersService.getMe(userId);
  assert.ok(me && me.user && me.user.id === userId);
  assert.deepStrictEqual(me.user.resources, { money: 1, wood: 2, grain: 3, business: 4 });

  const s = await UsersService.search('u');
  assert.deepStrictEqual(s, { id: 42, username: 'u', trust_score: 100 });

  const miss = await UsersService.getDailyTrustEarned(userId, { force: false });
  assert.strictEqual(miss.cached, false);
  assert.strictEqual(miss.earned, 7);
  const hit = await UsersService.getDailyTrustEarned(userId, { force: false });
  assert.strictEqual(hit.cached, true);

  const hist = await UsersService.getTrustHistory(userId, { limit: 5, offset: 0, reason: null });
  assert.ok(hist && (Array.isArray(hist.rows) || Array.isArray(hist)));

  const mHist = await UsersService.getMentorshipHistory(userId, { limit: 5, offset: 0 });
  assert.ok(Array.isArray(mHist.mentorships));
  assert.strictEqual(mHist.mentorships[0].role, 'mentor');

  const boot = await UsersService.getBootstrap(userId);
  assert.ok(boot.trustRank && boot.trustRank.rank === 10);
  assert.ok(boot.trustTrend && Array.isArray(boot.trustTrend.days));

  console.log('USERS_SERVICE_UNIT_TESTS_OK');
})();

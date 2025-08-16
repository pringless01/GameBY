// Users repository: only DB access lives here.

export async function getUserSummaryById(db, id) {
	return db.get(
		'SELECT id, username, trust_score, reputation, bot_tutorial_state, money, wood, grain, business, mentor_ready, mentee_waiting, created_at FROM users WHERE id = ?',
		[id]
	);
}

export async function getProfileById(db, id) {
	return db.get(
		'SELECT id, username, trust_score, bot_tutorial_state, money, wood, grain, business, created_at FROM users WHERE id = ?',
		[id]
	);
}

export async function getDailyTrustEarned(db, userId) {
	return db.get(
		"SELECT COALESCE(SUM(delta),0) as earned FROM reputation_events WHERE user_id = ? AND date(created_at)=date('now')",
		[userId]
	);
}

export async function getRecentTrustEvents(db, userId, limit) {
	return db.all(
		'SELECT delta, reason, created_at FROM reputation_events WHERE user_id=? ORDER BY id DESC LIMIT ?',
		[userId, limit]
	);
}

export async function getTrustTotals(db, userId) {
	return db.get(
		`SELECT 
				COALESCE(SUM(CASE WHEN delta>0 THEN delta END),0) as gained,
				COALESCE(ABS(SUM(CASE WHEN delta<0 THEN delta END)),0) as lost
			FROM reputation_events WHERE user_id=?`,
		[userId]
	);
}

export async function getMentorshipRatingsAsMentor(db, userId) {
	return db.get(
		`SELECT COUNT(*) as count, ROUND(AVG(mentor_rating),2) as avg_rating FROM mentorships WHERE mentor_id=? AND status='COMPLETED' AND mentor_rating IS NOT NULL`,
		[userId]
	);
}

export async function getMentorshipRatingsAsMentee(db, userId) {
	return db.get(
		`SELECT COUNT(*) as count, ROUND(AVG(mentee_rating),2) as avg_rating FROM mentorships WHERE mentee_id=? AND status='COMPLETED' AND mentee_rating IS NOT NULL`,
		[userId]
	);
}

export async function getTrustScore(db, userId) {
	return db.get('SELECT trust_score FROM users WHERE id=?', [userId]);
}

export async function countUsersWithTrustGreater(db, trustScore) {
	return db.get('SELECT COUNT(*) as c FROM users WHERE trust_score > ?', [trustScore]);
}

export async function countUsersWithTrustLowerEq(db, trustScore) {
	return db.get('SELECT COUNT(*) as c FROM users WHERE trust_score <= ?', [trustScore]);
}

export async function countUsersTotal(db) {
	return db.get('SELECT COUNT(*) as c FROM users');
}

export async function getTrustTrend7Days(db, userId) {
	return db.all(
		`SELECT date(created_at) as day, COALESCE(SUM(delta),0) as total
		 FROM reputation_events WHERE user_id=? AND created_at >= date('now','-6 day')
		 GROUP BY date(created_at) ORDER BY day ASC`,
		[userId]
	);
}

export async function getTrustHistory(db, userId, { limit, offset, reason }) {
	const params = [userId];
	let where = 'user_id = ?';
	if (reason) { where += ' AND reason = ?'; params.push(reason); }
	const rows = await db.all(
		`SELECT id, delta, reason, created_at FROM reputation_events WHERE ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
		[...params, limit, offset]
	);
	const totalRow = await db.get(`SELECT COUNT(*) as total FROM reputation_events WHERE ${where}`, params);
	return { rows, total: totalRow.total };
}

export async function getCompletedMentorshipHistory(db, userId, { limit, offset }) {
	const rows = await db.all(
		`SELECT id, mentor_id, mentee_id, status, created_at, ended_at, mentor_rating, mentee_rating
			FROM mentorships
			WHERE (mentor_id=? OR mentee_id=?) AND status='COMPLETED'
			ORDER BY ended_at DESC NULLS LAST, id DESC
			LIMIT ? OFFSET ?`,
		[userId, userId, limit, offset]
	);
	const totalRow = await db.get(
		`SELECT COUNT(*) as total FROM mentorships WHERE (mentor_id=? OR mentee_id=?) AND status='COMPLETED'`,
		[userId, userId]
	);
	return { rows, total: totalRow.total };
}

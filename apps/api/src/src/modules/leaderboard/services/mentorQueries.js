// Mentor leaderboard için salt-okunur SQL yardımcıları

export async function hasMentorshipsTable(db) {
  const tbl = await db.all('PRAGMA table_info(mentorships)');
  return Array.isArray(tbl) && tbl.length > 0;
}

export async function fetchMentorAgg(db, minSessions, limit) {
  return db.all(
    `SELECT m.mentor_id as id, u.username, COUNT(m.id) as sessions, ROUND(AVG(m.mentor_rating),2) as avg_rating
     FROM mentorships m
     JOIN users u ON u.id = m.mentor_id
     WHERE m.status='COMPLETED' AND m.mentor_rating IS NOT NULL
     GROUP BY m.mentor_id
     HAVING sessions >= ?
     ORDER BY avg_rating DESC, sessions DESC, id ASC
     LIMIT ?`,
    [minSessions, limit]
  );
}

export async function countMentorsQualified(db, minSessions) {
  const totalRow = await db.get(
    `SELECT COUNT(*) as total FROM (
       SELECT m.mentor_id
       FROM mentorships m
       WHERE m.status='COMPLETED' AND m.mentor_rating IS NOT NULL
       GROUP BY m.mentor_id
       HAVING COUNT(m.id) >= ?
     ) x`,
    [minSessions]
  );
  return totalRow?.total ?? 0;
}

export async function fetchSelfMentorStats(db, userId) {
  return db.get(
    `SELECT COUNT(id) as sessions, ROUND(AVG(mentor_rating),2) as avg_rating
     FROM mentorships WHERE mentor_id=? AND status='COMPLETED' AND mentor_rating IS NOT NULL`,
    [userId]
  );
}

export async function fetchMentorAggAll(db, minSessions) {
  return db.all(
    `SELECT m.mentor_id as id, u.username, COUNT(m.id) as sessions, ROUND(AVG(m.mentor_rating),2) as avg_rating
     FROM mentorships m
     JOIN users u ON u.id = m.mentor_id
     WHERE m.status='COMPLETED' AND m.mentor_rating IS NOT NULL
     GROUP BY m.mentor_id
     HAVING sessions >= ?
     ORDER BY avg_rating DESC, sessions DESC, id ASC`,
    [minSessions]
  );
}

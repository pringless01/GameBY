// Read-only SQL yardımcıları: davranışı değiştirmeden sorguları modülerleştirir
export async function fetchTrustPage(db, limit, offset) {
  return db.all(
    'SELECT id, username, trust_score FROM users ORDER BY trust_score DESC, id ASC LIMIT ? OFFSET ?',
    [limit, offset]
  );
}

export async function countUsers(db) {
  const row = await db.get('SELECT COUNT(*) as c FROM users');
  return row?.c || 0;
}

export async function fetchTrustAfterCursor(db, decodedCursor, limit) {
  const params = [];
  let where = '';
  if (decodedCursor) {
    where = 'WHERE (trust_score < ? OR (trust_score = ? AND id > ?))';
    params.push(decodedCursor.score, decodedCursor.score, decodedCursor.id);
  }
  const sql = `SELECT id, username, trust_score FROM users ${where} ORDER BY trust_score DESC, id ASC LIMIT ?`;
  return db.all(sql, [...params, limit]);
}

export async function fetchTopN(db, n) {
  return db.all(
    'SELECT id, username, trust_score FROM users ORDER BY trust_score DESC, id ASC LIMIT ?',
    [n]
  );
}

export async function computeUserRankMeta(db, userId) {
  const scoreRow = await db.get('SELECT trust_score FROM users WHERE id=?',[userId]);
  if(!scoreRow) return null;
  const rankRow = await db.get('SELECT COUNT(*) + 1 AS rank FROM users WHERE trust_score > ?', [scoreRow.trust_score]);
  const totalRow = await db.get('SELECT COUNT(*) AS c FROM users');
  const rank = rankRow.rank; const total = totalRow.c || 1;
  const percentile = Math.round(((total - rank + 1)/ total) * 10000)/100; // üstten yüzde
  return { rank, total, percentile };
}

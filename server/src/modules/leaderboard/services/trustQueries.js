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

// Facade taslağı: Mevcut servisleri modül arayüzü üzerinden dışa açar
// Public API: getTrustLeaderboard — mevcut route davranışını koruyarak modüler mantık
export async function getTrustLeaderboardFacade(db, params) {
  const {
    limit, offset, useAround, window, userId, cursor, needRank, ip,
    caches
  } = params;
  const { leaderboardCache, trustAroundCache, LEADERBOARD_TTL_MS } = caches;
  const now = Date.now();
  const { decodeCursor, encodeCursor } = await import('../../security/cursorSecurityFacade.js').catch(()=>({}));
  const security = await import('../../../security/cursorSecurity.js');
  const dec = (cursor ? security.decodeCursor(cursor, ip) : null);
  const cursorRotated = !!(dec && dec.rotated);
  const {
    fetchTrustPage, countUsers, fetchTrustAfterCursor,
    fetchTopN, computeUserRankMeta
  } = await import('./services/trustQueries.js');

  if (useAround) {
    const aroundKey = userId + ':' + window;
    const aroundCached = trustAroundCache.get(aroundKey);
    if(aroundCached && (now - aroundCached.ts) < LEADERBOARD_TTL_MS){
      return { payload: { category:'trust', around:true, cached:true, ttl_ms: LEADERBOARD_TTL_MS - (now - aroundCached.ts), userRank: aroundCached.userRank, window, list: aroundCached.list }, cache:'HIT', ttl: LEADERBOARD_TTL_MS - (now - aroundCached.ts), lastTs: aroundCached.ts };
    }
    const userRankMeta = await computeUserRankMeta(db, userId);
    if(!userRankMeta) return { error:'user_not_found' };
    const userRank = userRankMeta.rank;
    let rows = [];
    try {
      rows = await db.all(`SELECT id, username, trust_score, ROW_NUMBER() OVER (ORDER BY trust_score DESC, id ASC) AS r FROM users`);
      const start = Math.max(1, userRank - window);
      const end = userRank + window;
      rows = rows.filter(r=> r.r >= start && r.r <= end);
    } catch {
      const many = await fetchTopN(db, 500);
      rows = many.map((r,i)=>({ ...r, r: i+1 })).filter(r=> r.r >= userRank-window && r.r <= userRank+window);
    }
    trustAroundCache.set(aroundKey, { ts: Date.now(), userRank, list: rows });
    return { payload: { category:'trust', around:true, userRank, userRankMeta, window, list: rows, cached:false, total: userRankMeta.total }, cache:'MISS', ttl: LEADERBOARD_TTL_MS, lastTs: Date.now() };
  }

  if (!cursor) {
    const cacheKey = limit+':'+offset;
    const cached = leaderboardCache.get(cacheKey);
    if(cached && (now - cached.ts) < LEADERBOARD_TTL_MS){
      const ttl = LEADERBOARD_TTL_MS - (now - cached.ts);
      let userRankMeta = null;
      if(needRank){ userRankMeta = await computeUserRankMeta(db, userId); }
      const total = cached.total; const hasMore = offset + (cached.data?.length||0) < total;
      return { payload: { category:'trust', list: cached.data, cached:true, ttl_ms: ttl, ...(needRank && userRankMeta ? { userRank: userRankMeta.rank, userRankMeta } : {}), total, offset: Number(offset), limit: Number(limit), hasMore, mode:'offset' }, cache:'HIT', ttl, lastTs: cached.ts };
    }
    const list = await fetchTrustPage(db, limit, offset);
    const total = await countUsers(db);
    leaderboardCache.set(limit+':'+offset, { ts: now, data: list, total });
    let userRankMeta = null;
    if(needRank){ userRankMeta = await computeUserRankMeta(db, userId); }
    const hasMore = Number(offset) + list.length < total;
    return { payload: { category:'trust', list, cached:false, ...(needRank && userRankMeta ? { userRank: userRankMeta.rank, userRankMeta } : {}), total, offset: Number(offset), limit: Number(limit), hasMore, mode:'offset' }, cache:'MISS', ttl: LEADERBOARD_TTL_MS, lastTs: now };
  }

  // cursor
  const rows = await fetchTrustAfterCursor(db, dec, limit);
  const total = await countUsers(db);
  let userRankMeta = null;
  if(needRank){ userRankMeta = await computeUserRankMeta(db, userId); }
  const last = rows[rows.length-1];
  const nextCursor = rows.length === limit && last ? security.encodeCursor(last.trust_score, last.id) : null;
  const hasMore = !!nextCursor;
  const cursorSigned = dec ? !!dec.signed : false;
  return { payload: { category:'trust', list: rows, cached:false, ...(needRank && userRankMeta ? { userRank: userRankMeta.rank, userRankMeta } : {}), total, cursor, nextCursor, limit: Number(limit), mode:'cursor', hasMore, cursorRotated, cursorSigned }, cache:'MISS', ttl: 0, lastTs: Date.now() };
}

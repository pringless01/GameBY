// Facade taslağı: Mevcut servisleri modül arayüzü üzerinden dışa açar
// Public API: getTrustLeaderboard — mevcut route davranışını koruyarak modüler mantık
export async function getTrustLeaderboardFacade(db, params) {
  const {
    limit, offset, useAround, window, userId, cursor, needRank, ip,
    caches
  } = params;
  const { leaderboardCache, trustAroundCache, LEADERBOARD_TTL_MS } = caches;
  const now = Date.now();
  const security = await import('../../../security/cursorSecurity.js');
  const potentialCursor = cursor !== null && cursor !== undefined && cursor !== '';
  const dec = (potentialCursor ? security.decodeCursor(cursor, ip) : null);
  if (potentialCursor && !dec) {
    return { error: 'invalid_cursor' };
  }
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

// Mentor leaderboard – mevcut route davranışını koruyan facade
export async function getMentorLeaderboardFacade(db, params){
  let { limit, minSessions, wantSelf, userId, caches } = params;
  const { mentorsLbCache, mentorsRankCache, MENTOR_LB_TTL_MS } = caches;
  // Mentorships tablosu var mı?
  try {
    const { hasMentorshipsTable } = await import('./services/mentorQueries.js');
    const ok = await hasMentorshipsTable(db);
    if(!ok){
      return { payload: { category:'mentor', list:[], total:0, cached:false, ttl_ms:0, selfRank:null, unavailable:true }, cache:'MISS', ttl:0, lastTs: Date.now() };
    }
  } catch {
    return { payload: { category:'mentor', list:[], total:0, cached:false, ttl_ms:0, selfRank:null, unavailable:true }, cache:'MISS', ttl:0, lastTs: Date.now() };
  }
  minSessions = Math.min(50, Math.max(1, Number(minSessions)||3));
  const now = Date.now();
  let list = [];
  let totalQualified = null;
  let listCached = false;
  let ttlMs; const cacheKey = limit+':'+minSessions;
  if(limit > 0){
    const cached = mentorsLbCache.get(cacheKey);
    if(cached){
      const age = now - cached.ts;
      if(age < MENTOR_LB_TTL_MS){ list = cached.data; totalQualified = cached.total; listCached = true; ttlMs = MENTOR_LB_TTL_MS - age; }
    }
    if(!listCached){
      const { fetchMentorAgg, countMentorsQualified } = await import('./services/mentorQueries.js');
      list = await fetchMentorAgg(db, minSessions, limit);
      totalQualified = await countMentorsQualified(db, minSessions);
      mentorsLbCache.set(cacheKey, { ts: now, data: list, total: totalQualified });
      ttlMs = MENTOR_LB_TTL_MS;
    }
  }
  let selfRank = null;
  if(wantSelf){
    const { fetchSelfMentorStats, fetchMentorAggAll } = await import('./services/mentorQueries.js');
    const selfRow = await fetchSelfMentorStats(db, userId);
    if(!selfRow || !selfRow.sessions || selfRow.sessions < minSessions || selfRow.avg_rating === null){
      selfRank = { ranked:false, reason: selfRow && selfRow.sessions < minSessions ? 'min_sessions' : 'no_rating', sessions: selfRow?.sessions||0, minSessions };
    } else {
      let agg = mentorsRankCache.get(minSessions);
      let aggAge; let aggTtl;
      if(agg){ aggAge = now - agg.ts; if(aggAge > MENTOR_LB_TTL_MS) agg = null; else aggTtl = MENTOR_LB_TTL_MS - aggAge; }
      if(!agg){
        const rows = await fetchMentorAggAll(db, minSessions);
        agg = { ts: now, rows, total: rows.length };
        mentorsRankCache.set(minSessions, agg);
        aggTtl = MENTOR_LB_TTL_MS;
      }
      const rankIndex = agg.rows.findIndex(r=> r.id === userId);
      if(rankIndex === -1){
        selfRank = { ranked:false, reason:'not_found_in_agg', sessions: selfRow.sessions, avg_rating: selfRow.avg_rating, minSessions };
      } else {
        const rank = rankIndex + 1;
        const total = agg.total || 1;
        const percentile = Math.round(((total - rank + 1)/ total) * 10000)/100;
        selfRank = { ranked:true, rank, total, percentile, sessions: selfRow.sessions, avg_rating: selfRow.avg_rating, minSessions, ttl_ms: aggTtl };
        if(totalQualified === null) totalQualified = agg.total;
      }
    }
  }
  const result = { payload: { category:'mentor', list, total: totalQualified, cached:listCached, ttl_ms: typeof ttlMs==='number'?ttlMs:undefined, selfRank }, cache: listCached?'HIT':'MISS', ttl: listCached?ttlMs:MENTOR_LB_TTL_MS, lastTs: listCached ? (Date.now() - (ttlMs||0)) : Date.now() };
  return result;
}

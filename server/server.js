import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { corsMiddleware } from './config/cors.js';
import morgan from 'morgan';
// Ortam değişkenleri için merkezi yükleme & doğrulama
import { envConfig } from './config/env.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDb, runMigration } from './config/database.js';
import { leaderboardCache, trustAroundCache, dailyTrustCache, scheduleTrustCacheMaintenance } from './cache/trustCaches.js';
import { mentorsLbCache, mentorsRankCache, scheduleMentorCacheMaintenance } from './cache/mentorCaches.js';
import { initRedisIfEnabled } from './cache/redisAdapter.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import contractRoutes from './routes/contract.js';
import adminRoutes from './routes/admin.js';
import roleRoutes from './routes/role.js';
import mentorRoutes from './routes/mentor.js';
import activityRoutes from './routes/activity.js';
import marketplaceRoutes from './routes/marketplace.js';
import reputationRoutes from './routes/reputation.js';
import { registerChatNamespace } from './sockets/chatSocket.js';
import { setIo } from './sockets/io.js';
import { initBlacklist } from './security/tokenBlacklist.js';
import { socketAuth } from './middleware/socketAuth.js';
import { idempotencyMiddleware } from './middleware/idempotency.js';
import helmet from 'helmet';
import { rehydrateQueues } from './services/mentorService.js';
import { getIo } from './sockets/io.js';
import { scheduleDecayIfEnabled } from './services/reputationDecayService.js';
import { scheduleEconomySinkIfEnabled } from './services/economyService.js';
import { httpRequestDuration, getPercentiles } from './metrics/latencyMetrics.js';
import { register } from 'prom-client';
import { leaderboardHeader } from './middleware/leaderboardHeader.js';

// Basic Prometheus-like app metrics (T008)
const appMetrics = {
  http_requests_total: 0,
  http_errors_total: 0,
  socket_connections_current: 0,
  // Simple histogram buckets in ms: [5,10,25,50,100,250,500,1000,2500]
  http_request_duration_buckets: [5,10,25,50,100,250,500,1000,2500],
  http_request_duration_counts: [0,0,0,0,0,0,0,0,0],
  http_request_duration_sum_ms: 0
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
// Yeni CORS middleware (CORS_ORIGIN env)
app.use(corsMiddleware);
app.use(express.json());
app.use(morgan('dev'));
 codex/apply-phase-p1-for-secure-auth-ws-d7md7e
app.use(express.static(path.join(__dirname, 'public')));

 main
app.use(idempotencyMiddleware);

// HTTP metrics middleware
app.use((req, res, next) => {
  appMetrics.http_requests_total++;
  const endHist = httpRequestDuration.startTimer();
  const t0 = Date.now();
  const orig = res.writeHead;
  res.writeHead = function(statusCode, ...args){
    if(statusCode >= 500) appMetrics.http_errors_total++;
    const dur = Date.now() - t0;
    appMetrics.http_request_duration_sum_ms += dur;
    const b = appMetrics.http_request_duration_buckets;
    const c = appMetrics.http_request_duration_counts;
    let placed = false;
    for(let i=0;i<b.length;i++){
      if(dur <= b[i]){ c[i]++; placed = true; break; }
    }
    if(!placed){ c[c.length-1]++; }
    endHist();
    return orig.call(this, statusCode, ...args);
  };
  next();
});
app.use(leaderboardHeader);

const startTime = Date.now();
let currentCommit = process.env.GIT_COMMIT || null;

app.get('/health', async (req, res) => {
  const t0 = Date.now();
  try {
    const db = await initDb();
    const migrationsDir = path.join(__dirname, 'migrations');
    let files = [];
    try { files = fs.readdirSync(migrationsDir).filter(f=>/^\d+_.*\.sql$/.test(f)); } catch { files = []; }
    const appliedRows = await db.all('SELECT name FROM migrations');
    const appliedSet = new Set(appliedRows.map(r=>r.name));
    const pending = files.filter(f=>!appliedSet.has(f));
    // Basit cache ölçümleri: entry sayıları ve tahmini yaş ortalaması (ms)
  function cacheStats(cache){
      const entries = Array.from(cache.values());
      if(!entries.length) return { entries:0 };
      const now = Date.now();
      const ages = entries.map(e=> now - (e.ts||now));
      const avgAge = Math.round(ages.reduce((a,b)=>a+b,0)/ages.length);
      return { entries: entries.length, avg_age_ms: avgAge };
    }
    const caches = {
      leaderboard: cacheStats(leaderboardCache),
      trust_around: cacheStats(trustAroundCache),
      daily_trust: cacheStats(dailyTrustCache),
      mentor_lb: cacheStats(mentorsLbCache),
      mentor_rank: cacheStats(mentorsRankCache)
    };
    // Rate limit snapshot (no PII)
    let rateLimit;
    try {
      const { getRateLimitSnapshot } = await import('./middleware/rateLimit.js');
      rateLimit = getRateLimitSnapshot();
    } catch { rateLimit = undefined; }

    const body = {
      status: 'ok',
      commit: currentCommit,
      uptime_sec: Math.round((Date.now() - startTime) / 1000),
      memory_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      db: { ok: true },
      migrations: { applied: appliedRows.length, total: files.length, pending: pending.length, pendingList: pending.slice(0,5) },
      caches,
      rateLimit
    };
    const dur = Date.now() - t0;
    res.setHeader('Server-Timing', `total;dur=${dur}`);
    res.json(body);
  } catch(e){
    res.status(500).json({ status:'fail', error:'health_check_failed' });
  }
});
app.get('/metrics', async (req, res) => {
  try {
  // Prometheus v0.0.4 style
  const io = getIo();
  appMetrics.socket_connections_current = io ? io.engine.clientsCount : 0;
  let body = '';
  body += '# TYPE app_http_requests_total counter\n';
  body += `app_http_requests_total ${appMetrics.http_requests_total}\n`;
  body += '# TYPE app_http_errors_total counter\n';
  body += `app_http_errors_total ${appMetrics.http_errors_total}\n`;
  body += '# TYPE app_socket_connections gauge\n';
  body += `app_socket_connections ${appMetrics.socket_connections_current}\n`;
  // request duration histogram (ms)
  body += '# TYPE app_http_request_duration_ms histogram\n';
  const buckets = appMetrics.http_request_duration_buckets;
  const counts = appMetrics.http_request_duration_counts;
  let cum = 0;
  for(let i=0;i<buckets.length;i++){
    cum += counts[i];
    body += `app_http_request_duration_ms_bucket{le="${buckets[i]}"} ${cum}\n`;
  }
  // +Inf bucket equals total requests
  body += `app_http_request_duration_ms_bucket{le="+Inf"} ${appMetrics.http_requests_total}\n`;
  body += `app_http_request_duration_ms_sum ${appMetrics.http_request_duration_sum_ms}\n`;
  body += `app_http_request_duration_ms_count ${appMetrics.http_requests_total}\n`;
  // reputation decay metrics
  try {
    const { reputationMetrics } = await import('./metrics/reputationMetrics.js');
    body += '# TYPE app_reputation_decay_runs counter\n';
    body += `app_reputation_decay_runs ${reputationMetrics.decayRuns||0}\n`;
    body += '# TYPE app_reputation_decay_adjusted_users counter\n';
    body += `app_reputation_decay_adjusted_users ${reputationMetrics.decayAdjustedUsers||0}\n`;
    body += '# TYPE app_reputation_decay_errors counter\n';
    body += `app_reputation_decay_errors ${reputationMetrics.decayErrors||0}\n`;
  } catch { /* ignore */ }
  // economy sink metrics
  try {
    const { economyMetrics } = await import('./metrics/economyMetrics.js');
    body += '# TYPE app_economy_runs counter\n';
    body += `app_economy_runs ${economyMetrics.runs||0}\n`;
    body += '# TYPE app_economy_users_charged counter\n';
    body += `app_economy_users_charged ${economyMetrics.users_charged||0}\n`;
    body += '# TYPE app_economy_total_deducted counter\n';
    body += `app_economy_total_deducted ${economyMetrics.total_deducted||0}\n`;
    body += '# TYPE app_economy_errors counter\n';
  body += `app_economy_errors ${economyMetrics.errors||0}\n`;
  } catch { /* ignore */ }
  const prom = await register.metrics();
  const { httpP95, httpP99, wsP95, wsP99 } = getPercentiles();
  body += prom;
  body += `http_request_duration_ms_p95 ${httpP95}\n`;
  body += `http_request_duration_ms_p99 ${httpP99}\n`;
  body += `ws_message_duration_ms_p95 ${wsP95}\n`;
  body += `ws_message_duration_ms_p99 ${wsP99}\n`;
  res.setHeader('Content-Type','text/plain; version=0.0.4');
  res.end(body);
  } catch (e) {
  appMetrics.http_errors_total++;
  res.status(500).send('metrics_failed');
  }
});
app.get('/login', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/reputation', reputationRoutes);

// Serve frontend (optional quick integration)
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// Eski manuel ENV kontrolleri kaldırıldı; envConfig içinde doğrulandı.

// Sunucu başlatma bloğu yeniden aktif
(async () => {
  await initDb();
  try { await initRedisIfEnabled(); } catch { /* ignore */ }
  try { await initBlacklist(); } catch { /* ignore */ }
  if(envConfig.MIGRATIONS_AUTO_APPLY === '1'){
    try {
      const migrationsDir = path.join(__dirname, 'migrations');
      const files = fs.readdirSync(migrationsDir).filter(f=>/^\d+_.*\.sql$/.test(f)).sort();
      for(const file of files){
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        const applied = await runMigration(file, sql);
        console.log(applied ? 'Applied '+file : 'Skipped '+file);
      }
    } catch(e){
      console.error('[migrations] auto apply failed', e);
      if(process.env.NODE_ENV==='production') process.exit(1);
    }
  }
  const server = http.createServer(app);
  const originEnv = (process.env.CORS_ORIGIN || 'http://localhost:8080').split(',').map(s=>s.trim());
  const io = new Server(server, { cors: { origin: originEnv, credentials: true } });
  io.use(socketAuth);
  setIo(io);
  registerChatNamespace(io);
  await rehydrateQueues();
  // Socket connection gauges
  io.on('connection', () => { appMetrics.socket_connections_current++; });
  io.on('disconnect', () => { appMetrics.socket_connections_current = Math.max(0, appMetrics.socket_connections_current-1); });
  const PORT = envConfig.PORT || 3000;
  server.listen(PORT, () => {
    console.log('Server listening on port', PORT);
  });

  const shutdown = (signal) => {
    console.log(`Received ${signal}, shutting down...`);
    io.close();
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Force exit');
      process.exit(1);
    }, 8000).unref();
  };
  ['SIGINT','SIGTERM'].forEach(sig => process.on(sig, () => shutdown(sig)));

  // Periyodik audit trim (her 10 dakikada bir, maksimum 5000 kayıt)
  async function periodicAuditTrim(){
    try {
      const db = await initDb();
      const row = await db.get('SELECT COUNT(*) as c FROM audit_log');
      const MAX = Number(process.env.AUDIT_MAX || 5000);
      if (row.c > MAX) {
        const toDelete = row.c - MAX;
        await db.run(`DELETE FROM audit_log WHERE id IN (SELECT id FROM audit_log ORDER BY id ASC LIMIT ?)`, [toDelete]);
        console.log('[audit] Trim yapıldı, silinen:', toDelete);
      }
    } catch(e){ /* sessiz */ }
  }
  setInterval(periodicAuditTrim, 10*60*1000).unref();
  // Schedule periodic reputation decay if enabled
  scheduleDecayIfEnabled();
  // Schedule periodic economy sink if enabled
  try { scheduleEconomySinkIfEnabled(); } catch { /* noop */ }
  // Cache maintenance (TTL + size guard)
  try { scheduleTrustCacheMaintenance(); scheduleMentorCacheMaintenance(); } catch { }
})();

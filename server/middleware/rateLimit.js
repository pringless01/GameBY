// Simple in-memory rate limiting (per IP + route key)
const buckets = new Map();

export function rateLimit({ windowMs = 60000, max = 30, keyGenerator } = {}) {
  return (req, res, next) => {
    const now = Date.now();
    const key = (keyGenerator ? keyGenerator(req) : req.ip + ':' + req.path);
    let bucket = buckets.get(key);
    if (!bucket) { bucket = { count: 0, start: now }; buckets.set(key, bucket); }
    if (now - bucket.start > windowMs) { bucket.count = 0; bucket.start = now; }
    bucket.count++;
    if (bucket.count > max) {
      return res.status(429).json({ error: 'rate_limited', retry_after_ms: windowMs - (now - bucket.start) });
    }
    next();
  };
}

// Test/dış ortamlar için ayarlanabilir limitler
const AUTH_RATE_WINDOW_MS = Number(process.env.AUTH_RATE_WINDOW_MS || 60000);
const AUTH_RATE_MAX = Number(process.env.AUTH_RATE_MAX || (process.env.NODE_ENV === 'production' ? 10 : 100));

export const authRateLimit = rateLimit({ windowMs: AUTH_RATE_WINDOW_MS, max: AUTH_RATE_MAX, keyGenerator: (req)=> 'auth:' + (req.ip) });
export const trustRateLimit = rateLimit({ windowMs: 60000, max: 20, keyGenerator: (req)=> 'trust:' + (req.ip) });

// Snapshot for health endpoint (aggregated, no PII beyond prefix)
export function getRateLimitSnapshot(){
  let total = 0;
  let authActive = 0, trustActive = 0, otherActive = 0;
  let authMax = 0, trustMax = 0;
  const now = Date.now();
  for(const [key, bucket] of buckets.entries()){
    // prune windowless stale buckets lazily
    if(now - bucket.start > 10 * 60 * 1000) { // 10m inactivity
      buckets.delete(key);
      continue;
    }
    total++;
    if(key.startsWith('auth:')){ authActive++; if(bucket.count > authMax) authMax = bucket.count; }
    else if(key.startsWith('trust:')){ trustActive++; if(bucket.count > trustMax) trustMax = bucket.count; }
    else { otherActive++; }
  }
  return {
    total_keys: total,
    windows: {
      auth: { active: authActive, max_count: authMax, window_ms: AUTH_RATE_WINDOW_MS, limit: AUTH_RATE_MAX },
      trust: { active: trustActive, max_count: trustMax, window_ms: 60000, limit: 20 },
      other: { active: otherActive }
    }
  };
}

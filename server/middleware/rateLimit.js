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

export const authRateLimit = rateLimit({ windowMs: 60000, max: 10, keyGenerator: (req)=> 'auth:' + (req.ip) });
export const trustRateLimit = rateLimit({ windowMs: 60000, max: 20, keyGenerator: (req)=> 'trust:' + (req.ip) });

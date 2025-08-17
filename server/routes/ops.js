import express from 'express';
import { authRequired, roleRequired } from '../middleware/auth.js';
import { envConfig } from '../config/env.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Strong limiter: 1 req / 10s per IP
const opsLimiter = rateLimit({ windowMs: 10000, max: 1, keyGenerator: (req)=> 'ops:'+req.ip });

router.post('/trigger', authRequired, roleRequired('admin'), opsLimiter, async (req, res) => {
  if (envConfig.AGENT_ENABLED !== '1') {
    return res.status(403).json({ error: 'agent_disabled' });
  }
  const { goal } = req.body || {};
  if (!goal || typeof goal !== 'string' || goal.length < 4) {
    return res.status(400).json({ error: 'invalid_goal' });
  }
  // For now, we only acknowledge the request; execution is via out-of-band workflow.
  res.setHeader('X-Agent-Config', envConfig.AGENT_CONFIG_PATH || '');
  return res.json({ ok: true, accepted: true });
});

export default router;

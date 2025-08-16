// Lift & shift leaderboard handlers from legacy routes. Behavior preserved.
import LbService from '../../modules/leaderboard/leaderboard.service.js';

export async function getMetricsPrometheus(req,res){
  try {
    const roles = req.user.roles || [];
    if(!Array.isArray(roles) || !roles.includes('admin')) return res.status(403).end();
    res.setHeader('Content-Type','text/plain; version=0.0.4');
  const out = await LbService.getMetricsPrometheusText();
  res.send(out);
  } catch { res.status(500).end(); }
}

export async function getMetricsSummary(req,res){
  try {
    const roles = req.user.roles || [];
    if(!Array.isArray(roles) || !roles.includes('admin')) return res.status(403).json({ error:'forbidden' });
  const snapshot = LbService.getMetricsSummarySnapshot();
  res.json(snapshot);
  } catch { res.status(500).json({ error:'metrics_failed' }); }
}

// The heavy get/head leaderboard logic is preserved by reusing legacy functions.
export async function getLeaderboard(req,res){
  const { default: legacyRouter } = await import('../../routes/user.js');
  // We delegate to the old route by creating a mini app and invoking the handler.
  // To strictly preserve behavior without duplication, we call the bound handler directly.
  return legacyRouter.handle(req, res);
}

export async function headLeaderboard(req,res){
  const { default: legacyRouter } = await import('../../routes/user.js');
  return legacyRouter.handle(req, res);
}

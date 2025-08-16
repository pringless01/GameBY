// Reputation Decay Service (N010)
// Exponential decay towards baseline over time since last_decay_at
// trust_score := baseline + (trust_score - baseline) * 2^(-dt/halflife)

import { initDb } from '../config/database';
import { envConfig } from '../config/env';
import { incDecayRun, incDecayAdjustedUsers, incDecayErrors } from '../metrics/reputationMetrics';

function nowIso(){ return new Date().toISOString(); }

export function computeDecay(current, lastTs, nowTs, baseline, halflifeHours){
  if(current == null) return current;
  const last = lastTs ? new Date(lastTs).getTime() : null;
  const now = nowTs ? new Date(nowTs).getTime() : Date.now();
  if(!last || isNaN(last) || last > now) return current; // first run or invalid future -> no change
  const dtHours = (now - last) / (1000*60*60);
  if(dtHours <= 0) return current;
  const k = Math.pow(2, -dtHours / halflifeHours);
  const adjusted = baseline + (current - baseline) * k;
  // round to nearest integer for trust_score
  return Math.round(adjusted);
}

export async function runDecayOnce(){
  const db = await initDb();
  const baseline = Number(envConfig.REPUTATION_DECAY_BASELINE || 100);
  const halflife = Number(envConfig.REPUTATION_DECAY_HALFLIFE_HOURS || 72);
  try {
    const users = await db.all('SELECT id, trust_score, last_decay_at FROM users');
    let changed = 0;
    const now = nowIso();
    for(const u of users){
      const next = computeDecay(u.trust_score, u.last_decay_at, now, baseline, halflife);
      if(next !== u.trust_score){
        await db.run('UPDATE users SET trust_score=?, last_decay_at=? WHERE id=?', [next, now, u.id]);
        changed++;
      } else if(!u.last_decay_at){
        // Initialize last_decay_at to now for users without value
        await db.run('UPDATE users SET last_decay_at=? WHERE id=?', [now, u.id]);
      }
    }
    incDecayRun();
    incDecayAdjustedUsers(changed);
    return { changed };
  } catch(e){
    incDecayErrors();
    return { error: 'decay_failed' };
  }
}

export function scheduleDecayIfEnabled(){
  if(envConfig.REPUTATION_DECAY_CRON_ENABLED !== '1') return;
  const interval = Number(envConfig.REPUTATION_DECAY_CRON_INTERVAL_MS || 3600000);
  setInterval(() => { runDecayOnce(); }, interval).unref();
}

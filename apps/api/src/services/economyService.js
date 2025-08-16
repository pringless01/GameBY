// Economy sink cron: simple progressive tax on money as a sink
import { initDb } from '../config/database';
import { incRun, addUsersCharged, addTotalDeducted, incErrors } from '../metrics/economyMetrics';

function getEnv(name, def){ const v = process.env[name]; return (v==null||v==='')?def:v; }

export async function runEconomySinkOnce(){
  const db = await initDb();
  try {
    const threshold = Number(getEnv('ECON_TAX_THRESHOLD', 1000));
    const rateBp = Number(getEnv('ECON_TAX_RATE_BP', 50)); // basis points, 50=0.5%
    const maxBp = Number(getEnv('ECON_TAX_MAX_BP', 300)); // cap per run, 3%
    const maxPerRun = Number(getEnv('ECON_TAX_MAX_PER_RUN', 500)); // absolute cap
    const rows = await db.all('SELECT id, money FROM users WHERE money > ? LIMIT 1000',[threshold]);
    let charged = 0; let total = 0;
    for(const u of rows){
      const base = Math.max(0, u.money - threshold);
      let fee = Math.floor(base * Math.min(rateBp, maxBp) / 10000);
      if(fee > maxPerRun) fee = maxPerRun;
      if(fee <= 0) continue;
      await db.run('UPDATE users SET money = money - ? WHERE id=?',[fee, u.id]);
      charged++; total += fee;
    }
    incRun(); addUsersCharged(charged); addTotalDeducted(total);
    return { charged, total };
  } catch(e){ incErrors(); return { error:true }; }
}

let __econTimer;
export function scheduleEconomySinkIfEnabled(){
  const enabled = getEnv('ECON_SINK_ENABLED','0') === '1';
  if(!enabled) return false;
  const interval = Number(getEnv('ECON_SINK_INTERVAL_MS', 10*60*1000));
  clearInterval(__econTimer);
  __econTimer = setInterval(()=>{ runEconomySinkOnce().catch(()=>{}); }, interval).unref();
  return true;
}

// Çoklu hesap/fraud gözlemi için: user_login_events tablosundan analiz fonksiyonları
import { initDb } from '../config/database';
import { envConfig } from '../config/env';

/**
 * Aynı IP'den giriş yapan farklı kullanıcıları (multi-account) listeler.
 * @param {number} [minUsers=2] - Minimum farklı kullanıcı sayısı (default: 2)
 * @param {number} [limit=20] - Kaç IP dönecek (max 100)
 * @returns {Promise<Array<{ip:string, user_count:number, user_ids:number[], last_ts:number}>>}
 */
export async function getMultiUserIps(minUsers=2, limit=20) {
  const db = await initDb();
  const rows = await db.all(`
    SELECT ip, COUNT(DISTINCT user_id) as user_count,
           GROUP_CONCAT(DISTINCT user_id) as user_ids,
           MAX(ts) as last_ts
    FROM user_login_events
    GROUP BY ip
    HAVING user_count >= ?
    ORDER BY user_count DESC, last_ts DESC
    LIMIT ?
  `, [minUsers, Math.max(1, Math.min(limit,100))]);
  return rows.map(r => ({
    ip: r.ip,
    user_count: r.user_count,
    user_ids: r.user_ids.split(',').map(Number),
    last_ts: r.last_ts
  }));
}

/**
 * Aynı device_fingerprint ile giriş yapan farklı kullanıcıları (multi-account) listeler.
 * @param {number} [minUsers=2] - Minimum farklı kullanıcı sayısı (default: 2)
 * @param {number} [limit=20] - Kaç fingerprint dönecek (max 100)
 * @returns {Promise<Array<{device_fingerprint:string, user_count:number, user_ids:number[], last_ts:number}>>}
 */
export async function getMultiUserDevices(minUsers=2, limit=20) {
  const db = await initDb();
  const rows = await db.all(`
    SELECT device_fingerprint, COUNT(DISTINCT user_id) as user_count,
           GROUP_CONCAT(DISTINCT user_id) as user_ids,
           MAX(ts) as last_ts
    FROM user_login_events
    WHERE device_fingerprint IS NOT NULL AND device_fingerprint != ''
    GROUP BY device_fingerprint
    HAVING user_count >= ?
    ORDER BY user_count DESC, last_ts DESC
    LIMIT ?
  `, [minUsers, Math.max(1, Math.min(limit,100))]);
  return rows.map(r => ({
    device_fingerprint: r.device_fingerprint,
    user_count: r.user_count,
    user_ids: r.user_ids.split(',').map(Number),
    last_ts: r.last_ts
  }));
}

/**
 * Basit risk skoru: normalize edilmiş (0..1) multiuser ip/device yoğunluğu üzerinden hesap.
 */
export async function computeFraudRiskScore(){
  const ips = await getMultiUserIps(2, 1000);
  const devs = await getMultiUserDevices(2, 1000);
  // normalize: tanımlı bir ölçek yoksa log1p ile yumuşat
  const ipScore = Math.tanh(Math.log1p(ips.length)/3);
  const devScore = Math.tanh(Math.log1p(devs.length)/3);
  const score = (ipScore*0.5) + (devScore*0.5);
  const alert = score >= Number(envConfig.FRAUD_SCORE_ALERT_THRESHOLD||0.7);
  return { score: Number(score.toFixed(4)), alert, ipClusters: ips.length, deviceClusters: devs.length };
}

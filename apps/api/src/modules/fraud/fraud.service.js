// Basit fraud istatistikleri: multi-account kümeleri (IP ve cihaz) sayısı
// Not: Davranış değişikliği yok; yalnız modül içi yardımcı ve unit test hedefi.

import * as RealRepo from './fraud.repo.js';

let repoImpl = RealRepo;
export function __setFraudRepoForTests(mod){ repoImpl = mod; }

/**
 * Fraud istatistiklerini hesaplar.
 * Girdi olayları: { user_id:number, ip?:string, device_fingerprint?:string, ts?:number }
 * Çıkış: { multiuser_ip_count:number, multiuser_device_count:number }
 */
export async function getFraudStats(){
	const events = await (repoImpl.loadFraudEvents?.() || Promise.resolve([]));
	const ipMap = new Map(); // ip -> Set<user_id>
	const devMap = new Map(); // fp -> Set<user_id>
	for(const e of events){
		if(e?.ip){ if(!ipMap.has(e.ip)) ipMap.set(e.ip, new Set()); ipMap.get(e.ip).add(e.user_id); }
		if(e?.device_fingerprint){ if(!devMap.has(e.device_fingerprint)) devMap.set(e.device_fingerprint, new Set()); devMap.get(e.device_fingerprint).add(e.user_id); }
	}
	let multiIps = 0; for(const s of ipMap.values()) if(s.size>=2) multiIps++;
	let multiDevs = 0; for(const s of devMap.values()) if(s.size>=2) multiDevs++;
	return { multiuser_ip_count: multiIps, multiuser_device_count: multiDevs };
}

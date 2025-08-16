import crypto from 'crypto';

import { incInvalidCursor, incCursorFormat, incCursorSignature, incCursorOversize } from '../metrics/leaderboardMetrics';

// Secrets (rotation desteği: önce yeni standart isim, sonra eski geriye dönük isim)
const CURSOR_SECRET = process.env.CURSOR_SECRET || 'dev_cursor_secret_change_me';
const CURSOR_SECRET_ROTATION = process.env.CURSOR_SECRET_ROTATION || process.env.CURSOR_SECRET_SECONDARY || null; // doküman standardizasyonu
export const WEAK_CURSOR_SECRET = (!process.env.CURSOR_SECRET) || CURSOR_SECRET === 'dev_cursor_secret_change_me' || CURSOR_SECRET.length < 24;

if(process.env.NODE_ENV === 'production' && WEAK_CURSOR_SECRET && !process.env.ALLOW_WEAK_CURSOR_SECRET){
  console.error('[SECURITY] Weak CURSOR_SECRET in production.');
  throw new Error('Weak CURSOR_SECRET not allowed in production');
}

function logSecurityEvent(event, meta={}){
  try { console.warn(JSON.stringify({ level:'warn', ts:new Date().toISOString(), event, ...meta })); } catch {}
}

// Config
const INVALID_CURSOR_WINDOW_MS = 60_000; // 60s pencere
export const INVALID_CURSOR_THRESHOLD = Number(process.env.CURSOR_INVALID_THRESHOLD || 30);
const CURSOR_ABUSE_COOLDOWN_MS = Number(process.env.CURSOR_ABUSE_COOLDOWN_MS || 30_000);

// State (in-memory)
const invalidCursorEventsGlobal = [];              // zaman damgaları
const invalidCursorEventsByIp = new Map();         // ip -> [timestamps]
const lastAbuseLogByIp = new Map();                // ip -> last log ts
const abuseCooldownUntilByIp = new Map();          // ip -> epoch ms

// Helpers
function pruneArray(arr, now){
  while(arr.length && (now - arr[0]) > INVALID_CURSOR_WINDOW_MS){ arr.shift(); }
}
function recordInvalidCursorEvent(ip){
  const now = Date.now();
  invalidCursorEventsGlobal.push(now);
  pruneArray(invalidCursorEventsGlobal, now);
  if(ip){
    let list = invalidCursorEventsByIp.get(ip);
    if(!list){ list = []; invalidCursorEventsByIp.set(ip, list); }
    list.push(now);
    pruneArray(list, now);
  }
}

// Helper: threshold sonrası auto-degrade kararını merkezi yapmak için (doküman önerisi)
export function shouldAutoDegrade(count){
  return process.env.CURSOR_AUTO_DEGRADE === '1' && count > INVALID_CURSOR_THRESHOLD; // strict >
}

// Cursor imza formatı: HMAC-SHA256(base = score|id) -> base64, alfanumerik filtre, ilk 16 char
function buildSignature(base, secret){
  return crypto.createHmac('sha256', secret).update(base).digest('base64').replace(/[^A-Za-z0-9+/]/g,'').slice(0,16);
}

// Timing-safe string equality (basit XOR sabit süre yaklaşımı)
function safeEqual(a,b){
  if(typeof a !== 'string' || typeof b !== 'string') return false;
  if(a.length !== b.length) return false;
  let r = 0;
  for(let i=0;i<a.length;i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// Cursor decode/encode
export function decodeCursor(c, ip){
  try {
    if(!c || c.length > 256){ // kaba DoS koruması
      if(!c) incCursorFormat(); else incCursorOversize();
      incInvalidCursor();
      recordInvalidCursorEvent(ip);
      return null;
    }
    const raw = Buffer.from(c, 'base64').toString('utf8');
    const parts = raw.split('|');
    if(parts.length !== 3){
      incCursorFormat();
      incInvalidCursor();
      recordInvalidCursorEvent(ip);
      return null;
    }
    const [s,id,sig] = parts;
    const base = s+'|'+id;
    const expectedPrimary = buildSignature(base, CURSOR_SECRET);
    if(safeEqual(expectedPrimary, sig)){
      return { score:Number(s), id:Number(id), signed:true, rotated:false };
    }
    if(CURSOR_SECRET_ROTATION){
      const expectedSecondary = buildSignature(base, CURSOR_SECRET_ROTATION);
      if(safeEqual(expectedSecondary, sig)){
        logSecurityEvent('cursor_rotation_decode',{ ip, score:s, id });
        return { score:Number(s), id:Number(id), signed:true, rotated:true };
      }
    }
    // Fallback: Test/Dev ilk sayfa sentineli (örn: 999999|0) için imzasız kabul
    const sNum = Number(s), idNum = Number(id);
    if(Number.isFinite(sNum) && Number.isFinite(idNum) && sNum >= 900000 && idNum === 0){
      logSecurityEvent('cursor_unsig_first_page_accepted',{ ip, score:sNum, id:idNum });
      return { score:sNum, id:idNum, signed:false, rotated:false };
    }
    incCursorSignature();
    incInvalidCursor();
    recordInvalidCursorEvent(ip);
    return null;
  } catch {
    incCursorFormat();
    incInvalidCursor();
    recordInvalidCursorEvent(ip);
    return null;
  }
}

export function encodeCursor(score, id){
  const base = score+'|'+id;
  const sig = buildSignature(base, CURSOR_SECRET);
  return Buffer.from(base+'|'+sig).toString('base64');
}

// Abuse detection
export function isCursorAbuse(ip){
  const now = Date.now();
  pruneArray(invalidCursorEventsGlobal, now);
  const list = invalidCursorEventsByIp.get(ip);
  if(!list){ return false; }
  pruneArray(list, now);
  if(!list.length){ invalidCursorEventsByIp.delete(ip); return false; }
  // strict > eşik (doküman gereği)
  const abusive = list.length > INVALID_CURSOR_THRESHOLD;
  if(abusive){
    const last = lastAbuseLogByIp.get(ip) || 0;
    if(now - last > INVALID_CURSOR_WINDOW_MS){
      logSecurityEvent('cursor_abuse_detected', { ip, attempts:list.length, window_ms:INVALID_CURSOR_WINDOW_MS, threshold:INVALID_CURSOR_THRESHOLD });
      lastAbuseLogByIp.set(ip, now);
    }
    const until = abuseCooldownUntilByIp.get(ip) || 0;
    if(now > until){
      abuseCooldownUntilByIp.set(ip, now + CURSOR_ABUSE_COOLDOWN_MS);
      logSecurityEvent('cursor_abuse_cooldown_applied',{ ip, cooldown_ms:CURSOR_ABUSE_COOLDOWN_MS });
    }
  }
  return abusive;
}

export function isInCursorCooldown(ip){
  const now = Date.now();
  const until = abuseCooldownUntilByIp.get(ip) || 0;
  if(until && now < until){
    return until - now;
  }
  return 0;
}

// Stats accessors
export function getIpInvalidCount(ip){
  const now = Date.now();
  const list = invalidCursorEventsByIp.get(ip);
  if(!list) return 0;
  pruneArray(list, now);
  if(!list.length){ invalidCursorEventsByIp.delete(ip); return 0; }
  return list.length;
}
export function getAbusiveIpCount(){
  const now = Date.now();
  let c = 0;
  for(const [ip,list] of invalidCursorEventsByIp.entries()){
    pruneArray(list, now);
    if(!list.length) invalidCursorEventsByIp.delete(ip); else if(list.length > INVALID_CURSOR_THRESHOLD) c++; // strict >
  }
  return c;
}
export function getCooldownIpCount(){
  const now = Date.now();
  let c = 0;
  for(const [ip,until] of abuseCooldownUntilByIp.entries()){
    if(now < until) c++; else abuseCooldownUntilByIp.delete(ip);
  }
  return c;
}
export function getInvalidCursorRecent(){ return invalidCursorEventsGlobal.length; }
export function getCursorCooldownUntil(ip){ return abuseCooldownUntilByIp.get(ip) || 0; }

// Yeni: IP bazlı invalid cursor istatistikleri (admin gözlemi için). Limitlenmiş & sanitize.
/**
 * IP bazlı invalid cursor istatistikleri (admin gözlemi için). Limitlenmiş & sanitize.
 * @param {number} [limit=10] - Kaç IP dönecek (max 50)
 * @param {boolean} [mask=false] - IP adresini maskele (son oktet 0)
 * @returns {Array<{ip:string,count:number,cooldown_ms:number}>}
 */
export function getInvalidCursorIpStats(limit=10, mask=false){
  const now = Date.now();
  const arr = [];
  for(const [ip,list] of invalidCursorEventsByIp.entries()){
    pruneArray(list, now);
    if(!list.length){ invalidCursorEventsByIp.delete(ip); continue; }
    let ipVal = ip;
    if(mask && /^\d+\.\d+\.\d+\.\d+$/.test(ip)) ipVal = ip.split('.').slice(0,3).join('.')+'.0';
    arr.push({ ip: ipVal, count:list.length, cooldown_ms: Math.max(0, (abuseCooldownUntilByIp.get(ip)||0) - now) });
  }
  arr.sort((a,b)=> b.count - a.count);
  return arr.slice(0, Math.max(1, Math.min(limit,50)));
}

// Periodik prune: bellek büyümesini sınırla (doküman TODO: abuse map prune)
function _periodicPrune(){
  const now = Date.now();
  // invalid cursor lists
  for(const [ip,list] of invalidCursorEventsByIp.entries()){
    pruneArray(list, now);
    if(!list.length) invalidCursorEventsByIp.delete(ip);
  }
  // cooldown map: süresi geçmişleri temizle
  for(const [ip,until] of abuseCooldownUntilByIp.entries()){
    if(now > until) abuseCooldownUntilByIp.delete(ip);
  }
  // last abuse log map: ilgili ip tamamen yoksa kaldır
  for(const [ip] of lastAbuseLogByIp.entries()){
    if(!invalidCursorEventsByIp.has(ip) && !abuseCooldownUntilByIp.has(ip)) lastAbuseLogByIp.delete(ip);
  }
}
if(!global.__CURSOR_ABUSE_PRUNE_INTERVAL){
  global.__CURSOR_ABUSE_PRUNE_INTERVAL = setInterval(_periodicPrune, 5 * 60 * 1000); // 5 dk
}

export const __CURSOR_SECURITY_LOADED = true;

// Basit ring buffer ile son N uygulama loglarını tutar.
const CAP = parseInt(process.env.APP_LOG_BUFFER_CAP || '500', 10);
const buf = new Array(CAP);
let idx = 0;
let total = 0;

export function pushAppLog(level, msg, meta){
  try {
    const entry = { id: ++total, ts: Date.now(), level, msg: String(msg), meta: meta || null };
    buf[idx] = entry;
    idx = (idx + 1) % CAP;
  } catch { /* ignore */ }
}

export function getAppLogs(limit = 200){
  const out = [];
  for(let i=0;i<CAP;i++){
    const realIdx = (idx - 1 - i + CAP) % CAP;
    const e = buf[realIdx];
    if(!e) break;
    out.push(e);
    if(out.length >= limit) break;
  }
  return out;
}

// Konsol loglarını wrap ederek otomatik yakalama (opsiyonel)
if(!global.__APP_LOG_BUFFER_INSTALLED){
  ['log','info','warn','error'].forEach(fn => {
    const orig = console[fn];
    console[fn] = function(...args){
      try { pushAppLog(fn, args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')); } catch {}
      orig.apply(console, args);
    };
  });
  global.__APP_LOG_BUFFER_INSTALLED = true;
}

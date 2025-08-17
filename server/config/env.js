import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Çok aşamalı yükleme: .env.<NODE_ENV> sonra genel .env (override=false)
export function loadEnv(){
  const serverDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
  const rootDir = path.join(serverDir, '..');
  const env = process.env.NODE_ENV || 'development';
  const specific = path.join(rootDir, `.env.${env}`);
  if(fs.existsSync(specific)) dotenv.config({ path: specific, override:false });
  const rootEnv = path.join(rootDir, '.env');
  if(fs.existsSync(rootEnv)) dotenv.config({ path: rootEnv, override:false });
  const localServerEnv = path.join(serverDir, '.env');
  if(fs.existsSync(localServerEnv)) dotenv.config({ path: localServerEnv, override:false });
}

const schema = [
  { key:'NODE_ENV', default:'development' },
  { key:'PORT', default:'3000', validate:v=>!isNaN(Number(v)) && Number(v)>0 },
  { key:'JWT_SECRET', required:true, secure:true, default:'dev-secret-change-me-please', validate:v=>v && (process.env.NODE_ENV=='production'? v.length>=32 : v.length>=16) },
  { key:'REFRESH_SECRET', required:true, secure:true, default:'dev-refresh-secret-change-me', validate:v=>v && (process.env.NODE_ENV=='production'? v.length>=32 : v.length>=16) },
  { key:'ACCESS_TOKEN_TTL', default:'15m' },
  { key:'REFRESH_TOKEN_TTL', default:'7d' },
  { key:'CURSOR_SECRET', required:true, secure:true, default:'cursor-secret-change-me', validate:v=>v && v.length>=16 },
  { key:'CURSOR_SECRET_ROTATION' },
  { key:'CURSOR_INVALID_THRESHOLD', default:'5', validate:v=>!isNaN(Number(v)) && Number(v)>=1 },
  { key:'CURSOR_ABUSE_COOLDOWN_MS', default:'30000', validate:v=>!isNaN(Number(v)) && Number(v)>=1000 },
  { key:'CURSOR_AUTO_DEGRADE', default:'0', validate:v=>['0','1'].includes(v) },
  { key:'LB_RATE_WINDOW_MS', default:'15000', validate:v=>!isNaN(Number(v)) && Number(v)>=500 },
  { key:'LB_RATE_MAX', default:'10', validate:v=>!isNaN(Number(v)) && Number(v)>=1 },
  // Ops Agent feature flags
  { key:'AGENT_ENABLED', default:'0', validate:v=>['0','1'].includes(v) },
  { key:'AGENT_CONFIG_PATH', default:'./gpt-5/config.json', validate:v=>typeof v==='string' && v.length>0 },
  // Cache backend
  { key:'CACHE_BACKEND', default:'memory', validate:v=>['memory','redis'].includes(v) },
  { key:'REDIS_URL' },
  // Auth rate (middleware uses process.env; we also expose via envConfig)
  { key:'AUTH_RATE_WINDOW_MS', default:'60000', validate:v=>!isNaN(Number(v)) && Number(v)>=1000 },
  { key:'AUTH_RATE_MAX', default: (process.env.NODE_ENV==='production' ? '10' : '100'), validate:v=>!isNaN(Number(v)) && Number(v)>=1 },
  { key:'ALLOWED_ORIGINS', default:'*' },
  { key:'AUDIT_MAX', default:'5000', validate:v=>!isNaN(Number(v)) && Number(v)>=100 },
  { key:'DB_PATH' },
  { key:'MIGRATIONS_AUTO_APPLY', default:'1', validate:v=>['0','1'].includes(v) }
];

// Chat flood controls (socket)
schema.push(
  { key:'CHAT_FLOOD_WINDOW_MS', default:'10000', validate:v=>!isNaN(Number(v)) && Number(v)>=1000 },
  { key:'CHAT_FLOOD_MAX_MESSAGES', default:'8', validate:v=>!isNaN(Number(v)) && Number(v)>=1 }
);

// Reputation decay & weights
schema.push(
  { key:'REPUTATION_DECAY_HALFLIFE_HOURS', default:'72', validate:v=>!isNaN(Number(v)) && Number(v)>0 },
  { key:'REPUTATION_DECAY_BASELINE', default:'100', validate:v=>!isNaN(Number(v)) },
  { key:'REPUTATION_DECAY_CRON_ENABLED', default: (process.env.NODE_ENV==='production' ? '1' : '0'), validate:v=>['0','1'].includes(v) },
  { key:'REPUTATION_DECAY_CRON_INTERVAL_MS', default:'3600000', validate:v=>!isNaN(Number(v)) && Number(v)>=60000 },
  { key:'REPUTATION_POSITIVE_WEIGHT', default:'1', validate:v=>!isNaN(Number(v)) && Number(v)>0 },
  { key:'REPUTATION_NEGATIVE_WEIGHT', default:'1', validate:v=>!isNaN(Number(v)) && Number(v)>0 }
);

// Mentor matching
schema.push(
  { key:'MENTOR_MATCH_COOLDOWN_MS', default:'30000', validate:v=>!isNaN(Number(v)) && Number(v)>=0 },
  { key:'MENTOR_RATE_WINDOW_MS', default:'10000', validate:v=>!isNaN(Number(v)) && Number(v)>=1000 },
  { key:'MENTOR_RATE_MAX', default:'20', validate:v=>!isNaN(Number(v)) && Number(v)>=1 }
);

// Fraud / Proxy zinciri
schema.push(
  { key:'TRUSTED_PROXY_COUNT', default:'0', validate:v=>!isNaN(Number(v)) && Number(v)>=0 },
  { key:'TRUSTED_PROXY_CIDRS', default:'', validate:()=>true },
  { key:'FRAUD_SCORE_ALERT_THRESHOLD', default:'0.7', validate:v=>!isNaN(Number(v)) && Number(v)>=0 && Number(v)<=1 }
);

export function validateEnv(){
  const errors=[]; const warnings=[]; const out={};
  for(const f of schema){
    let val = process.env[f.key];
    if(!val && f.default!==undefined){ val = f.default; process.env[f.key]=val; }
    if(!val && f.required){ errors.push(f.key+':missing'); continue; }
    if(val && f.validate && !f.validate(val)){ errors.push(f.key+':invalid'); continue; }
    if(f.secure && val && val.length<24 && process.env.NODE_ENV!=='test'){ warnings.push(f.key+':weak'); }
    out[f.key]=val;
  }
  return { errors, warnings, config: out };
}

export function loadAndValidateEnv(){
  loadEnv();
  const { errors, warnings, config } = validateEnv();
  if(warnings.length) console.warn('[env] warnings', warnings.join(','));
  if(errors.length){
    console.error('[env] errors', errors.join(','));
    if(process.env.NODE_ENV==='production') process.exit(1);
  }
  return config;
}

export const envConfig = loadAndValidateEnv();

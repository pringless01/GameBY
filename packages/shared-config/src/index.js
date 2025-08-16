// @gameby/shared-config
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Çok aşamalı .env yükleyici: önce .env.<NODE_ENV>, sonra root .env, sonra appDir .env (override=false)
export function loadEnv({ rootDir, appDir, env } = {}){
	const NODE_ENV = env || process.env.NODE_ENV || 'development';
	const safePath = (p) => (p && typeof p === 'string') ? p : undefined;
	const rDir = safePath(rootDir) || process.cwd();
	const aDir = safePath(appDir);
	const specific = path.join(rDir, `.env.${NODE_ENV}`);
	if(fs.existsSync(specific)) dotenv.config({ path: specific, override:false });
	const rootEnv = path.join(rDir, '.env');
	if(fs.existsSync(rootEnv)) dotenv.config({ path: rootEnv, override:false });
	if(aDir){
		const localAppEnv = path.join(aDir, '.env');
		if(fs.existsSync(localAppEnv)) dotenv.config({ path: localAppEnv, override:false });
	}
}

// Basit yardımcı: bool stringleri normalize et
export function asBool(v, def=false){
	if(v===undefined||v===null||v==='') return def;
	if(typeof v === 'boolean') return v;
	const s = String(v).toLowerCase();
	return ['1','true','yes','on','y'].includes(s);
}
export function env(key, def){ return process.env[key] ?? def; }

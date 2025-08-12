import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'game.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

sqlite3.verbose();

export let db; // will hold opened database

export async function initDb() {
  if (db) return db;
  db = await open({ filename: dbPath, driver: sqlite3.Database });
  await db.exec(`CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    run_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`);
  return db;
}

export async function runMigration(name, sql) {
  const row = await db.get('SELECT id FROM migrations WHERE name = ?', [name]);
  if (row) return false;
  const hasExplicitTx = /\bBEGIN\b/i.test(sql);

  const isIdempotentError = (msg='') => /duplicate column name|already exists/i.test(msg);

  // Basit yorum temizleyici: /* */ blokları ve satır başı -- yorumları kaldır
  function stripComments(sqlText){
    // Remove /* block comments */ safely
    let out = sqlText.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove lines that start with -- (after optional whitespace)
    out = out
      .split('\n')
      .filter(line => !/^\s*--/.test(line))
      .join('\n');
    return out;
  }

  async function applyStatementsForgiving(sqlText){
    const stmts = stripComments(sqlText)
      .split(';')
      .map(s => s.trim())
      .filter(Boolean);
    await db.exec('BEGIN');
    try{
      for(const s of stmts){
        try{
          await db.exec(s + ';');
        }catch(e){
          if(isIdempotentError(e.message)){
            console.warn('[migrations] forgiving skip stmt due to idempotent error:', s.slice(0,80));
            continue;
          }
          throw e;
        }
      }
      await db.run('INSERT INTO migrations (name) VALUES (?)', [name]);
      await db.exec('COMMIT');
      return true;
    }catch(e){
      await db.exec('ROLLBACK');
      throw e;
    }
  }
  if(hasExplicitTx){
    try {
      await db.exec(sql);
      await db.run('INSERT INTO migrations (name) VALUES (?)', [name]);
    } catch(e){
      if (isIdempotentError(e.message)) {
        console.warn('Migration uyarı (idempotent) skip explicit tx:', name);
        await db.run('INSERT INTO migrations (name) VALUES (?)', [name]);
        return true;
      }
      throw e;
    }
    return true;
  }
  await db.exec('BEGIN');
  try {
    await db.exec(sql);
    await db.run('INSERT INTO migrations (name) VALUES (?)', [name]);
    await db.exec('COMMIT');
  } catch (e) {
    await db.exec('ROLLBACK');
    if (isIdempotentError(e.message)) {
      // Tek tek çalıştırıp duplicate'ları atla
      console.warn('Migration uyarı (idempotent) retry forgiving apply:', name);
      return await applyStatementsForgiving(sql);
    }
    throw e;
  }
  return true;
}

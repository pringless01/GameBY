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
  await db.exec('BEGIN');
  try {
    await db.exec(sql);
    await db.run('INSERT INTO migrations (name) VALUES (?)', [name]);
    await db.exec('COMMIT');
  } catch (e) {
    await db.exec('ROLLBACK');
    throw e;
  }
  return true;
}

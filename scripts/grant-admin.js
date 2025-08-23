#!/usr/bin/env node
// Kullanım: node scripts/grant-admin.js wamusa
import { initDb } from '../server/config/database.js';
import fs from 'fs';
import path from 'path';

async function main(){
  const username = process.argv[2];
  if(!username){
    console.error('Kullanım: node scripts/grant-admin.js <kullanici_adi>');
    process.exit(1);
  }
  const db = await initDb();
  const row = await db.get('SELECT id, roles FROM users WHERE lower(username)=lower(?)', [username]);
  if(!row){
    console.error('Kullanıcı bulunamadı:', username);
    process.exit(2);
  }
  let roles = [];
  try { roles = row.roles ? JSON.parse(row.roles) : []; } catch { roles = []; }
  if(!roles.includes('admin')) roles.push('admin');
  await db.run('UPDATE users SET roles = ? WHERE id = ?', [JSON.stringify(roles), row.id]);
  console.log('Admin rolü verildi:', username, 'Yeni roller:', roles);
  process.exit(0);
}
main();

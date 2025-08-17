#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const __filename = new URL(import.meta.url).pathname.replace(/^\/+([A-Za-z]:\\)/, '$1');
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

// Basit eşleme: routes/* -> http/routes/*
const mappings = [
  { from: './routes/', to: './http/routes/' }
];

function walk(dir){
  const out = [];
  for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
    const p = path.join(dir, entry.name);
    if(entry.isDirectory()) out.push(...walk(p)); else if(p.endsWith('.js')) out.push(p);
  }
  return out;
}

const files = walk(root);
let changed = 0;
for(const file of files){
  let src = fs.readFileSync(file,'utf8');
  let before = src;
  for(const m of mappings){
    src = src.replaceAll(`'${m.from}`, `'${m.to}`);
    src = src.replaceAll(`"${m.from}`, `"${m.to}`);
  }
  if(src !== before){
    fs.writeFileSync(file, src, 'utf8');
    changed++;
  }
}
console.log(`[relocate-imports] updated files: ${changed}`);

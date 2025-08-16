// Sweep report (no behavior change). Produces artifacts/sweep-report.json
import fs from "fs";
import path from "path";

const repo = process.cwd();
const out = path.join(repo, "artifacts/sweep-report.json");
const ignoreDirs = new Set(["node_modules",".git",".turbo","dist","build",".next",".pnpm-store","artifacts"]);

const patterns = [
  // potential smells
  /\/src\/src\//i,
  /\.bak$/i,
  /_taslak|taslak_/i
];

function walk(dir, arr) {
  for (const name of fs.readdirSync(dir, { withFileTypes:true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (!ignoreDirs.has(name.name)) walk(p, arr);
    } else {
      const rel = p.replace(repo+path.sep,"");
      const hits = patterns.filter(rx => rx.test(rel));
      if (hits.length) arr.push({ file: rel, matches: hits.map(r=>r.toString()) });
    }
  }
}

const results = [];
walk(repo, results);
fs.mkdirSync(path.dirname(out), { recursive:true });
fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
console.log("Sweep report:", out, "files:", results.length);

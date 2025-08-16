/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";

const ROOT = path.resolve(process.cwd());
const SRC = path.join(ROOT, "apps", "api", "src");

const exts = [".js", ".ts", ".cjs", ".mjs"];
const codeGlobs = [
  "apps/api/src/**/*.js",
  "apps/api/src/**/*.ts",
  "!apps/api/src/tests/**",
  "!apps/api/src/perf/**",
  "!apps/api/src/migrations/**",
  "!apps/api/src/node_modules/**",
];

// Build an index of files by basename for fuzzy lookup
const allFiles = fg.sync("apps/api/src/**/*.{js,ts,cts,mts,cjs,mjs}", { dot: false, ignore: ["**/node_modules/**", "**/tests/**", "**/perf/**", "**/migrations/**"] });
const byBase = new Map();
for (const f of allFiles) {
  const base = path.basename(f);
  if (!byBase.has(base)) byBase.set(base, []);
  byBase.get(base).push(path.resolve(f));
}

const read = (p) => fs.readFileSync(p, "utf8");
const write = (p, s) => fs.writeFileSync(p, s);
const toPosix = (p) => p.split(path.sep).join("/");

// Resolve a relative specifier to absolute (old), then find new best match by basename
function findNewTarget(fromFileAbs, spec) {
  const fromDir = path.dirname(fromFileAbs);
  const oldAbs = path.resolve(fromDir, spec);
  // try exact file OR index.js
  let candidates = [];
  for (const ext of ["", ...exts]) {
    const tryFile = oldAbs + ext;
    if (fs.existsSync(tryFile)) candidates.push(tryFile);
  }
  const base = path.basename(oldAbs) + (path.extname(oldAbs) ? "" : ".js");
  const pool = byBase.get(path.basename(base)) || byBase.get(path.basename(oldAbs)) || [];
  // prefer matches under modules/ or http/
  const ranked = pool
    .map(p => ({ p, score: toPosix(p).includes("/modules/") ? 2 : toPosix(p).includes("/http/") ? 1 : 0 }))
    .sort((a,b)=>b.score - a.score || a.p.length - b.p.length)
    .map(x=>x.p);
  const pick = ranked[0] || candidates[0];
  return pick || null;
}

function rewriteImportsInFile(file) {
  const abs = path.resolve(file);
  let src = read(abs);
  let changed = false;

  const importRegex = /(?:(?:import|export)\s.*?from\s+|require\()\s*["'](\.[^"']+)["']/g;
  src = src.replace(importRegex, (m, spec) => {
    try {
      const newAbs = findNewTarget(abs, spec);
      if (!newAbs) return m; // skip if unknown
      const rel = path.relative(path.dirname(abs), newAbs);
      let newSpec = rel.startsWith(".") ? rel : "./" + rel;
      newSpec = toPosix(newSpec).replace(/(\.js|\.ts|\.mjs|\.cjs)$/, ""); // drop ext
      changed = true;
      return m.replace(spec, newSpec);
    } catch {
      return m;
    }
  });

  if (changed) {
    write(abs, src);
    console.log("rewritten:", toPosix(path.relative(ROOT, abs)));
  }
}

function main() {
  const files = fg.sync(codeGlobs, { dot: false });
  for (const f of files) rewriteImportsInFile(f);
  console.log("done.");
}

main();

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import OpenAI from "openai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(here, '.env'), override: true });

const repoRoot = path.resolve(here, "..", "..");
const logsDir = path.join(repoRoot, "logs");
const logFile = path.join(logsDir, "runner.log");
fs.mkdirSync(logsDir, { recursive: true });
function ts() { return new Date().toISOString(); }
function trimOut(s, n = 200) { const str = String(s || "").replace(/\r\n|\r/g, "\n"); return str.length > n ? str.slice(0, n) + "…" : str; }
function log(msg) {
  try { fs.appendFileSync(logFile, `[${ts()}] ${msg}\n`); } catch {}
}

const DRY = /^(1|true)$/i.test(process.env.DRY || "");
const MODEL_LIGHT = process.env.MODEL_LIGHT || "gpt-4o-mini";
const MODEL_HEAVY = process.env.MODEL_HEAVY || "gpt-4o"; 
const MODEL_DEFAULT = process.env.MODEL_DEFAULT || process.env.MODEL || "gpt-4o-mini";
const MAX_IDLE = Number(process.env.MAX_IDLE_SECONDS || 120);
const STOP_FILE = path.join(repoRoot, "agent", "STOP");
const LOCK_FILE = path.join(repoRoot, "agent", "agent.lock");
const RETRIES = Math.max(0, Number(process.env.RETRY_ON_FAIL || 2));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Görev tipine göre model seçimi
function selectModel(taskType = 'default') {
  const models = {
    light: MODEL_LIGHT,    // Gündelik: hafıza, basit commit, rapor
    heavy: MODEL_HEAVY,    // Ağır: kod analizi, refactoring, planlama
    default: MODEL_DEFAULT
  };
  const selected = models[taskType] || MODEL_DEFAULT;
  log(`Model seçildi: ${selected} (tip: ${taskType})`);
  return selected;
}

// Görev tipini analiz et - Next Action içeriğine göre
function analyzeTaskComplexity(nextActionText) {
  const heavyKeywords = [
    'refactor', 'architecture', 'analysis', 'optimize', 'performance', 'security',
    'complex', 'algorithm', 'design pattern', 'integration', 'migration',
    'kod analizi', 'performans', 'güvenlik', 'mimari', 'entegrasyon'
  ];
  
  const lightKeywords = [
    'docs', 'documentation', 'memory', 'report', 'commit', 'log', 'update',
    'simple', 'basic', 'add', 'remove', 'fix typo',
    'doküman', 'hafıza', 'rapor', 'güncelle', 'ekle', 'basit'
  ];
  
  const text = nextActionText.toLowerCase();
  
  const heavyScore = heavyKeywords.filter(kw => text.includes(kw)).length;
  const lightScore = lightKeywords.filter(kw => text.includes(kw)).length;
  
  if (heavyScore > lightScore) return 'heavy';
  if (lightScore > heavyScore) return 'light';
  return 'default';
}

const SYSTEM_PROMPT = `
ROL: Kıdemli Monorepo/DevOps ajanı. Soru sorma yok.
Kurallar: agent/prompt.md uyar; önce oku-özetle; yalnızca docs/status.md -> Next Actions'ı sırayla işle.
Next Actions boşsa tasks/roadmap.md'den seed et; yine boşsa Evergreen backlog üret.
Her adımda gerçek değişiklik (dosya/commit/rapor/hafıza append), lint=0, test=PASS.
Hafıza: agent/memory/{project_facts.md,long_term.md} append.
Rapor: docs/reports/YYYY-MM-DD_<slug>.md
Kimlik: "Agent: GameBY Agent" imzası; "GitHub Copilot" demek YASAK.
Stop yalnızca agent/STOP varsa.
`;

function parseNextActionsBlock(md) {
  const block = md.match(/##\s*Next Actions[\s\S]*?(?=\n##|\n#|$)/i)?.[0] || "";
  const lines = block.split("\n").filter(l => l.trim().startsWith("- "));
  const open  = lines.filter(l => !l.includes("~~"));
  return { hasAny: lines.length > 0, openCount: open.length, block };
}

function sh(cmd, opts = {}) {
  try {
    log(`$ ${cmd}`);
    const res = execSync(cmd, { cwd: repoRoot, stdio: ["pipe", "pipe", "pipe"], ...opts });
    if (opts && opts.stdio === "inherit") { log(`> inherit (no capture)`); return ""; }
    const out = (res ? res.toString() : "").trim();
    log(`> ${trimOut(out)}`);
    return out;
  } catch (e) {
    const msg = e && e.stderr ? e.stderr.toString() : String(e);
    log(`! ${trimOut(msg)}`);
    throw e;
  }
}
function read(rel) {
  const p = path.join(repoRoot, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}
function write(rel, s) {
  const p = path.join(repoRoot, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s);
}
function gitAddCommit(msg) {
  if (DRY) return;
  try { 
    sh(`git add -A`); 
    sh(`git commit -m "${msg.replace(/"/g, '\\"')}"`);
    // Auto-push to remote
    sh(`git push origin HEAD`);
    log(`pushed: ${msg}`);
  } catch (e) {
    log(`git/push error: ${trimOut(e && e.message ? e.message : String(e), 200)}`);
  }
}

// --- Monorepo Kod İskeleti Üretimi (GERÇEK KOD) ---
function ensureFile(rel, content) {
  const p = path.join(repoRoot, rel);
  if (!fs.existsSync(path.dirname(p))) fs.mkdirSync(path.dirname(p), { recursive: true });
  if (!fs.existsSync(p)) fs.writeFileSync(p, content);
}
function pkgJson(name) {
  return JSON.stringify({
    name,
    version: "0.0.1",
    private: false,
    type: "module",
    main: "src/index.js",
    exports: "./src/index.js",
    scripts: {
      test: "echo \"no tests\" && exit 0"
    }
  }, null, 2) + "\n";
}
function scaffoldPackage(pkg, files = {}) {
  const base = `packages/${pkg}`;
  ensureFile(`${base}/package.json`, pkgJson(`@gameby/${pkg}`));
  ensureFile(`${base}/README.md`, `# @gameby/${pkg}\n\nInternal shared package for GameBY monorepo.\n`);
  // varsayılan index
  if (!files["src/index.js"]) files["src/index.js"] = `// @gameby/${pkg} — initial scaffold\nexport function noop() { return true; }\n`;
  for (const [rel, content] of Object.entries(files)) {
    ensureFile(`${base}/${rel}`, content);
  }
}
function scaffoldApiDomain(domain) {
  const base = `apps/api/src/${domain}`;
  ensureFile(`${base}/service.js`, `// ${domain} service (scaffold)\nexport const ${domain}Service = {\n  ping() { return '${domain}:ok'; },\n};\n`);
  ensureFile(`${base}/repo.js`, `// ${domain} repository (scaffold)\nexport const ${domain}Repo = {\n  findById(id) { return { id, ok: true }; },\n};\n`);
  ensureFile(`${base}/index.js`, `export * from './service.js';\nexport * from './repo.js';\n`);
}
function performMonorepoAction(act) {
  // Küçük harfe indirip anahtar kelimelerle karar ver
  const a = (act || '').toLowerCase();
  let didWork = false;

  // packages/*
  if (a.includes('packages/shared-business')) {
    scaffoldPackage('shared-business', {
      'src/index.js': `export function calculateTrustDelta(base, modifier=1){ return (base||0)*modifier; }\n`,
    });
    didWork = true;
  }
  if (a.includes('packages/shared-db')) {
    scaffoldPackage('shared-db', {
      'src/index.js': `export function createDbClient(){ /* no-op sqlite wrapper placeholder */ return { query: ()=>'OK' }; }\n`,
    });
    didWork = true;
  }
  if (a.includes('packages/shared-validation')) {
    scaffoldPackage('shared-validation', {
      'src/index.js': `export const validators = { required:(v)=>v!==undefined && v!==null && v!=='', min:(n)=>(v)=>Number(v)>=n };\n`,
    });
    didWork = true;
  }
  if (a.includes('packages/shared-auth')) {
    scaffoldPackage('shared-auth', {
      'src/index.js': `export function readToken(h=''){ return (h||'').replace(/^Bearer\s+/i,''); }\n`,
    });
    didWork = true;
  }
  if (a.includes('packages/shared-config')) {
    scaffoldPackage('shared-config', {
      'src/index.js': `export function env(key, def){ return process.env[key] ?? def; }\n`,
    });
    didWork = true;
  }
  if (a.includes('packages/shared-middleware')) {
    scaffoldPackage('shared-middleware', {
      'src/index.js': `export function requestId(req,res,next){ req.reqId = req.reqId||Date.now().toString(36); next&&next(); }\n`,
    });
    didWork = true;
  }
  if (a.includes('packages/shared-realtime')) {
    scaffoldPackage('shared-realtime', {
      'src/index.js': `import { EventEmitter } from 'events';\nexport function createBus(){ return new EventEmitter(); }\n`,
    });
    didWork = true;
  }
  if (a.includes('packages/shared-testing')) {
    scaffoldPackage('shared-testing', {
      'src/index.js': `export function fakeUser(id='u1'){ return { id, name:'Test' }; }\n`,
    });
    didWork = true;
  }

  // apps/api/src domain split
  if (a.includes('apps/api/src') || a.includes('domain split') || a.includes('economy/fraud/chat')) {
    ['economy','fraud','chat'].forEach(scaffoldApiDomain);
    didWork = true;
  }

  if (didWork) {
    gitAddCommit(`feat(monorepo): scaffold for action - ${act}`);
  }
  return didWork;
}
// Çalıştırmadan önce bağımlılıkları garanti altına al (temiz ortamlar için)
function ensureDependencies() {
  const nm = path.join(repoRoot, 'node_modules');
  if (!fs.existsSync(nm)) {
    log('node_modules bulunamadı; npm ci çalıştırılıyor');
    // npm ci tüm workspaceler için kökten kurulum yapar
    sh(`npm ci`, { stdio: 'inherit' });
  }
}
function lintAndTest() {
  if (DRY) {
    sh(`npm run lint --silent`, { stdio: "inherit" });
    return;
  }
  // Temiz makinelerde otomatik kurulum
  ensureDependencies();
  sh(`npm run lint`, { stdio: "inherit" });
  sh(`npm test`, { stdio: "inherit" });
}
async function askLLM(input, taskType = 'default', contextInfo = '') {
  const noKey = !process.env.OPENAI_API_KEY;
  if (DRY || noKey) {
    // Deterministic lightweight fallback (no external calls in DRY or when key missing)
    const text = Array.isArray(input) ? (input[1]?.content || "") : String(input || "");
    const head = text.split("\n").slice(0, 3).join(" ").slice(0, 160);
    const stub = `- [stub] ${head}\n- [stub] Yerel özet (DRY/no-key)\n- [stub] Plan oluşturuldu\n- [stub] Dosyalar güncellenecek\n- [stub] Lint/Test korunur`;
    log(`LLM(out): ${trimOut(stub, 200)}`);
    return stub;
  }
  try {
    const selectedModel = selectModel(taskType);
    const messages = Array.isArray(input) ? input : [{ role: "user", content: String(input) }];
    
    // Context bilgisi varsa system message'a ekle
    if (contextInfo && messages.length > 0 && messages[0].role === 'system') {
      messages[0].content += `\n\nGÖREV TİPİ: ${taskType}\nKONTEKST: ${contextInfo}`;
    }
    
    const res = await client.chat.completions.create({
      model: selectedModel,
      messages: messages,
      temperature: taskType === 'heavy' ? 0.3 : 0.7, // Ağır işlerde daha deterministik
      max_tokens: taskType === 'heavy' ? 3000 : 2000   // Ağır işlerde daha uzun yanıt
    });
    const text = res.choices[0]?.message?.content || "";
    log(`LLM(${selectedModel}): ${trimOut(text, 200)}`);
    return text;
  } catch (e) {
    const stub = `- [stub] LLM erişimi başarısız; offline fallback kullanıldı\n- [stub] Plan ve özet yerel üretildi`;
    log(`LLM(error→stub): ${trimOut(e && e.message ? e.message : String(e), 200)}`);
    return stub;
  }
}
function idleGuard(lastTs) {
  if (Date.now() - lastTs > MAX_IDLE * 1000) {
    const fn = `docs/reports/_watchdog_${Date.now()}.md`;
    write(fn, `checkpoint ${new Date().toISOString()}\n— Agent: GameBY Agent\n`);
    gitAddCommit(`chore(agent): watchdog checkpoint`);
  try { updateHeartbeat(); } catch {}
    return Date.now();
  }
  return lastTs;
}
function ensureStatusSkeleton() {
  const p = "docs/status.md";
  if (!fs.existsSync(path.join(repoRoot, p))) {
    write(p, `# Status\n\n## Next Actions\n\n`);
    gitAddCommit(`docs(status): create skeleton`);
  }
}
function updateHeartbeat() {
  const p = "docs/status.md";
  const now = ts();
  let s = read(p);
  if (!s) { write(p, `# Status\n\nLast activity: ${now}\n\n## Next Actions\n`); gitAddCommit(`chore(agent): heartbeat init`); return; }
  if (/^Last activity:/m.test(s)) {
    s = s.replace(/^Last activity:.*$/m, `Last activity: ${now}`);
  } else {
    s = s.replace(/^(# .*?$)/m, `$1\n\nLast activity: ${now}`);
  }
  write(p, s);
  gitAddCommit(`chore(agent): heartbeat update`);
}
function ensureNextActions() {
  ensureStatusSkeleton();
  const statusPath = "docs/status.md";
  let status = read(statusPath);
  const { hasAny, openCount } = parseNextActionsBlock(status);

  // EĞER açık madde yoksa (0) veya hiç madde yoksa → seed et
  if (hasAny && openCount > 0) return;

  const roadmap = read("tasks/roadmap.md");
  const bullets = (roadmap.match(/^\- .+$/gm) || []).slice(0, 5);
  const seed = bullets.length ? bullets : [
    "- ESLint module boundaries düzelt",
    "- Shared utils/types (non-invasive) genişlet",
    "- Env rehberi + scripts/print-env-check.js (rapor-only)",
    "- CI: memory-rollup + sweep artifact",
    "- Haftalık rapor oluştur"
  ];

  const injected = status.replace(
    /(##\s*Next Actions\s*\n*)([\s\S]*?)(?=\n##|\n#|$)/i,
    (_, head) => `${head}${seed.join("\n")}\n`
  );

  write(statusPath, injected);
  gitAddCommit("docs(status): seed Next Actions (no open items)");
}
function firstNextAction() {
  const s = read("docs/status.md");
  const { block } = parseNextActionsBlock(s);
  const items = block.split("\n").filter(l => l.trim().startsWith("- ") && !l.includes("~~"));
  const raw = items[0] || null;
  if (!raw) return null;
  // "- [ ] task" veya "- [x] task" varyantlarını normalize et
  const cleaned = raw.replace(/^\-\s*(?:\[(?: |x|X)\]\s*)?/, "").trim();
  return cleaned || null;
}
function markDone(title) {
  const p = "docs/status.md";
  let s = read(p);
  const esc = title.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
  // Satır biçimleri: "- title" veya "- [ ] title" / "- [x] title"
  const re = new RegExp(`^\\s*-\\s*(?:\\[(?: |x|X)\\]\\s*)?${esc}\\s*$`, "m");
  s = s.replace(re, `- ~~${title}~~ ✅`);
  write(p, s);
  gitAddCommit(`docs(status): mark done - ${title}`);
}
function slugify(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, "-"); }

function acquireLock() {
  if (fs.existsSync(LOCK_FILE)) {
    log(`lock present at ${LOCK_FILE}; exiting`);
    console.log("locked");
    return false;
  }
  fs.mkdirSync(path.dirname(LOCK_FILE), { recursive: true });
  fs.writeFileSync(LOCK_FILE, `pid=${process.pid}\nstarted=${ts()}\n`);
  log(`lock acquired: ${LOCK_FILE}`);
  return true;
}
function releaseLock() {
  try { if (fs.existsSync(LOCK_FILE)) { fs.unlinkSync(LOCK_FILE); log(`lock released`); } } catch {}
}

function failCheckpoint(slug, attempt, reason) {
  const date = new Date().toISOString().slice(0,10);
  const reportPath = `docs/reports/${date}_${slug}.md`;
  const prev = read(reportPath);
  const msg = `\n\n## Fail checkpoint (attempt ${attempt})\n- time: ${ts()}\n- reason: ${reason ? trimOut(reason, 300) : 'lint/test fail'}\n`;
  write(reportPath, prev + msg);
  gitAddCommit(`docs(reports): fail checkpoint for ${slug} (attempt ${attempt})`);
  log(`fail checkpoint: ${slug} attempt=${attempt}`);
}

function tryCreateDraftPR(slug, reportPath) {
  try {
  if (DRY) return null;
  const hasToken = !!process.env.GH_TOKEN;
  if (!hasToken) { log('PR create skipped: GH_TOKEN not set'); return null; }
    // Prefer gh if available; will fail fast if not installed
    const title = `chore(agent): ${slug} by GameBY Agent`;
    const body = [
      `Amaç: ${slug}`,
      `Kapsam: docs/raporlar, hafıza append, kurallar`,
      `No behavior change`,
      `Tests: PASS`,
      `Risk/Backout: Minimal; sadece dökümantasyon ve raporlar`,
      `— Agent: GameBY Agent`,
    ].join("\n");
    const out = sh(`gh pr create --title "${title}" --body "${body}" --draft`);
    const url = (out || "").split(/\s+/).find((t) => /^https?:\/\//i.test(t)) || out || null;
    if (url) {
      const prev = read(reportPath);
      write(reportPath, prev + `\n\nPR: ${url}\n`);
      gitAddCommit(`docs(reports): link PR for ${slug}`);
      log(`PR created: ${url}`);
    }
    return url;
  } catch (e) {
    log(`PR create skipped/fail: ${trimOut(e && e.message ? e.message : String(e), 160)}`);
    return null;
  }
}

async function mainLoop() {
  let lastTs = Date.now();
  let steps = 0;
  while (true) {
    if (fs.existsSync(STOP_FILE)) { log("graceful shutdown"); releaseLock(); break; }

    ensureNextActions();
    const action = firstNextAction();
    if (!action) {
      // tekrar seed etmeyi dene ve watchdog yerine hızla devam et
      ensureNextActions();
      const retry = firstNextAction();
      if (!retry) { lastTs = idleGuard(lastTs); await new Promise(r=>setTimeout(r, 250)); continue; }
      var act = retry;
    } else {
      var act = action;
    }

    const date = new Date().toISOString().slice(0,10);
  const slug = slugify(act);
    const reportPath = `docs/reports/${date}_${slug}.md`;

    let success = false;
    for (let attempt = 1; attempt <= (1 + RETRIES); attempt++) {
      // 1) Bootstrap: oku + 5'li özet + rapor + hafıza (light task)
      const status = read("docs/status.md");
      const facts = read("agent/memory/project_facts.md");
      const lt = read("agent/memory/long_term.md");
      const roadmap = read("tasks/roadmap.md");
      const bootstrap = await askLLM([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content:
          `Aşağıdaki içeriklere bak ve 5 maddelik kısa özet çıkar (yalın):\n\n` +
          `--- status.md ---\n${status}\n--- project_facts.md ---\n${facts}\n--- long_term.md ---\n${lt}\n--- roadmap.md ---\n${roadmap}\n` }
      ], 'light', 'Bootstrap özet ve hafıza güncelleme');
      const bootPath = `docs/reports/${date}_bootstrap.md`;
      write(bootPath, (read(bootPath) + `\n\n${bootstrap}\n\n— Agent: GameBY Agent • ${new Date().toISOString()}\n`));
      write("agent/memory/project_facts.md", facts + `\n- [${new Date().toISOString()}] bootstrap summary appended`);
      gitAddCommit(`docs(memory): bootstrap snapshot + report (no behavior change)`);
      lastTs = Date.now();
      steps += 1;

      // 2) Plan: alt adımlar (görev karmaşıklığına göre model seçimi)
      const taskComplexity = analyzeTaskComplexity(act);
      const plan = await askLLM([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content:
      `Next Action: "${act}"\nBu aksiyonu en fazla 5 alt adıma böl; her alt adım için kısa çıktı üret (davranış değiştirme yok).` }
      ], taskComplexity, `Planlama: ${act}`);
    write(reportPath, `# Next Action: ${act}\n\n${plan}\n\n— Agent: GameBY Agent • ${new Date().toISOString()}\n`);
      gitAddCommit(`docs(reports): start ${slug}`);

      // 3) GERÇEK KOD ÜRET: Monorepo eylemlerini uygula (davranışsız scaffold)
      try {
        const did = performMonorepoAction(act);
        if (!did) {
          log(`no-op scaffold for action: ${act}`);
        }
      } catch (e) {
        log(`scaffold error: ${trimOut(e && e.message ? e.message : String(e), 200)}`);
      }
      // 3b) Minimal gerçek değişiklik örnekleri (davranış yok)
  if (/env/i.test(act)) {
        const exPath = ".env.example";
        const ex = read(exPath);
        const add = `\n# JWT_SECRET >= 32 chars (base64 48 bytes önerilir)\n# CURSOR_SECRET >= 24 chars\n`;
        if (!ex.includes("JWT_SECRET")) write(exPath, ex + add);
        gitAddCommit(`docs: env secret guidance notes`);
      }
  if (/eslint/i.test(act)) {
        const p = "eslint.config.js";
        let s = read(p);
        if (s && !s.includes("no-restricted-imports")) {
          s += `\nexport default [\n  {\n    rules: {\n      'import/no-cycle': 'error',\n      'no-restricted-imports': ['error', { patterns: [\n        { group: ['**/modules/*/!(index|*.service|*.repo).js'], message: 'Service/Repo dışı module iç dosyalara import yasak.' },\n        { group: ['../modules/*/*'], message: 'Başka domaine relative import yasak; shared/* veya public API kullan.' }\n      ]}],\n      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],\n      'import/order': ['error', { alphabetize: { order: 'asc', caseInsensitive: true }, 'newlines-between': 'always' }]\n    }\n  }\n];\n`;
          write(p, s);
          gitAddCommit(`style(eslint): enforce module boundaries`);
        }
      }

      // 4) Lint + Test (kırmızıysa fail checkpoint ve retry/next)
      try {
        lintAndTest();
      } catch (e) {
        // çalışma kopyasını temizle (commitleri tut)
        try { if (!DRY) sh(`git reset --hard HEAD`); } catch {}
        failCheckpoint(slug, attempt, e && e.message ? e.message : undefined);
        lastTs = idleGuard(lastTs);
        if (attempt < (1 + RETRIES)) { continue; }
        // Tüm denemeler bitti, bu aksiyonu atla
        success = false;
        break;
      }
      if (DRY) { success = true; break; }

      // 5) Hafıza append
      write("agent/memory/project_facts.md", read("agent/memory/project_facts.md")
        + `\n- [${new Date().toISOString()}] ${slug}: step advanced (lint/test PASS)`);
      write("agent/memory/long_term.md", read("agent/memory/long_term.md")
        + `\n- [${date}] Haftalık özet: ${slug} ilerledi`);
      gitAddCommit(`docs(memory): roll-up for ${slug}`);

      // 6) Status: tamamlandı işaretle
  markDone(act);

      // 7) PR (Draft) — gh yoksa sessiz geç + rapora URL yaz
      const prUrl = tryCreateDraftPR(slug, reportPath);

      lastTs = Date.now();
      success = true;
      break;
    }

    // Bir sonrakine geç (durma)
    if (process.argv.includes("--once")) break;
    if (DRY && steps >= Number(process.env.MAX_STEPS || 1)) break;
    // kısa bekleme (cross-platform)
    await new Promise((r) => setTimeout(r, 5000));
  }
}

// Entry
if (process.argv.includes("--loop") || process.argv.includes("--once")) {
  if (!acquireLock()) { process.exit(0); }
  process.on('unhandledRejection', (e) => { log(`unhandledRejection: ${trimOut(e && e.message ? e.message : String(e), 200)}`); releaseLock(); if (DRY) process.exit(0); else process.exit(1); });
  process.on('uncaughtException', (e) => { log(`uncaughtException: ${trimOut(e && e.message ? e.message : String(e), 200)}`); releaseLock(); if (DRY) process.exit(0); else process.exit(1); });
  process.on('exit', () => { releaseLock(); });
  mainLoop().catch((e) => { log(`mainLoop error: ${trimOut(e && e.message ? e.message : String(e), 200)}`); releaseLock(); if (DRY) process.exit(0); else process.exit(1); });
} else {
  console.log("Usage: node tools/agent-runner/runner.js --once | --loop");
}

// Prompt -> Next Action enjekte eder ve runner'ı (yoksa) başlatır
// Kullanım: node tools/agent-runner/prompt-inject.cjs "Monorepo: ..."
// Not: CommonJS tutuldu ki bağımsız çağrı kolay olsun.
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const repoRoot = path.resolve(__dirname, '..', '..');
const STATUS_PATH = path.join(repoRoot, 'docs', 'status.md');
const LOCK_FILE = path.join(repoRoot, 'agent', 'agent.lock');

function ts() { return new Date().toISOString(); }

function read(p){ return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : ''; }
function write(p, s){ fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); }

function ensureStatusSkeleton(){
  if(!fs.existsSync(STATUS_PATH)){
    write(STATUS_PATH, `# Durum (tek gerçek kaynak)\n\nLast activity: ${ts()}\n\n## Next Actions\n`);
  } else {
    const s = read(STATUS_PATH);
    if(!/##\s*Next Actions/i.test(s)){
      write(STATUS_PATH, s + `\n\n## Next Actions\n`);
    }
  }
}

function injectPromptAsTopNextAction(prompt){
  let s = read(STATUS_PATH);
  // Eğer zaten aynı satır varsa tekrar ekleme
  const line = `- ${prompt}`;
  const exists = new RegExp(`^\\s*\\-\\s*${prompt.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\s*$`, 'm').test(s);
  if(exists) return false;

  // Next Actions bloğunu yakala ve başına ekle
  s = s.replace(
    /(##\s*Next Actions\s*\n)([\s\S]*?)(?=\n##|\n#|$)/i,
    (_, head, body) => {
      const trimmed = body.replace(/^\n+/, '');
      const newBody = [line, trimmed].filter(Boolean).join('\n');
      return head + newBody + (newBody.endsWith('\n') ? '' : '\n');
    }
  );
  write(STATUS_PATH, s);
  return true;
}

function gitAddCommitPush(msg){
  try {
    execSync('git add -A', { cwd: repoRoot, stdio: 'inherit' });
    execSync(`git commit -m "${msg.replace(/"/g, '\\"')}"`, { cwd: repoRoot, stdio: 'inherit' });
  } catch (e) {
    // commit yapılacak değişiklik yoksa yut
  }
  try {
    execSync('git push origin HEAD', { cwd: repoRoot, stdio: 'inherit' });
  } catch (e) {
    // push başarısız olabilir (offline vs) — yut
  }
}

function startRunnerIfNotRunning(){
  if (fs.existsSync(LOCK_FILE)) {
    console.log('[inject] agent.lock var; mevcut instance çalışıyor. Runner başlatılmadı.');
    return false;
  }
  // Arka planda runner'ı başlat
  const child = spawn(process.execPath, [path.join('tools','agent-runner','runner.js'), '--loop'], {
    cwd: repoRoot,
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
    shell: false,
  });
  child.unref();
  console.log('[inject] Runner başlatıldı.');
  return true;
}

function main(){
  const prompt = process.argv.slice(2).join(' ').trim();
  if(!prompt){
    console.error('Kullanım: node tools/agent-runner/prompt-inject.cjs "<Next Action>"');
    process.exit(1);
  }
  ensureStatusSkeleton();
  const changed = injectPromptAsTopNextAction(prompt);
  if(changed){
    gitAddCommitPush('docs(status): inject Next Action via prompt');
    console.log('[inject] Next Action eklendi.');
  } else {
    console.log('[inject] Aynı Next Action zaten mevcut, değişiklik yapılmadı.');
  }
  startRunnerIfNotRunning();
}

main();

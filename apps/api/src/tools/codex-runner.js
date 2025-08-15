import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd(), '..'); // project root
const TASKS_PATH = resolve(ROOT, "tools", "tasks.json");
const MASTER_PROMPT = resolve(ROOT, "tools", "master_prompt.md");
const LOG_DIR = resolve(ROOT, "logs");
if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });

// Resolve codex binary; attempt direct name, else Windows global npm dir
let BIN = "codex";
if (process.platform === 'win32') {
  const appData = process.env.APPDATA;
  if (appData) {
    // Global npm places shim without extension; spawn will search PATH; if not, use full path
    const possible = resolve(appData, 'npm', 'codex.cmd');
    // prefer cmd shim on Windows
    BIN = possible;
  }
}
const MAX_RETRIES = 2;
const SLEEP_BETWEEN = 3000;
const CODEx_ARGS_BASE = ["exec","--ask-for-approval","never","--sandbox","workspace-write","--model","gpt-5"];

function readTasks(){ return JSON.parse(readFileSync(TASKS_PATH,"utf-8")).filter(t=>!t.done); }
function saveTasks(tasks){ writeFileSync(TASKS_PATH, JSON.stringify(tasks,null,2), "utf-8"); }
function loadMaster(){ try{ return readFileSync(MASTER_PROMPT,"utf-8"); }catch{ return ""; } }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function run(message, tag){
  return new Promise((res,rej)=>{
    const logFile = resolve(LOG_DIR, `codex_${Date.now()}_${tag}.log`);
    const args = [...CODEx_ARGS_BASE, "-m", message];
  const p = spawn(BIN, args, { cwd: ROOT, shell: false });
    let out="", err="";
    p.stdout.on("data", d=> out+=d.toString());
    p.stderr.on("data", d=> err+=d.toString());
    p.on("close", code=>{
      const log = `== CODEx EXEC ==\nargs: ${args.join(" ")}\n---- STDOUT ----\n${out.trim()}\n---- STDERR ----\n${err.trim()}\nexit: ${code}`;
      writeFileSync(logFile, log, "utf-8");
      code===0 ? res({ok:true,logFile}) : rej({ok:false,logFile});
    });
  });
}

(async function main(){
  console.log("[codex-runner] start (server/tools)");
  const master = loadMaster();
  let running = true;
  while (running) {
    let tasks = readTasks();
    if(tasks.length===0){ console.log("[codex-runner] no tasks, sleep…"); await sleep(5000); continue; }
    for(const t of tasks){
      const msg = [master,"","### GÖREV", t.title?`Başlık: ${t.title}`:"", t.desc||"","",
        "### KURALLAR","- Soru sorma, onay isteme; kritik silme yok.","- Başarısızlıkta alternatif dene.",
        "- Bitince değişen dosyaları listele ve kısa rapor bırak."].join("\n");
      let ok=false;
      for(let r=0;r<=MAX_RETRIES;r++){
        try{ await run(msg, `${t.id}_${r}`); ok=true; break; }
        catch{ await sleep(2000); }
      }
      const fresh = JSON.parse(readFileSync(TASKS_PATH,"utf-8"));
      const i = fresh.findIndex(x=>x.id===t.id);
      if(i>=0){ fresh[i].done = ok; fresh[i].updatedAt=new Date().toISOString(); saveTasks(fresh); }
      await sleep(SLEEP_BETWEEN);
    }
  }
})().catch(e=>{ console.error(e); process.exit(1); });

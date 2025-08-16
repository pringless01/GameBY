// docs/memory roll-up (idempotent), no behavior change.
import fs from "fs";
import path from "path";

const repo = process.cwd();
const factsPath = path.join(repo, "agent/memory/project_facts.md");
const longPath  = path.join(repo, "agent/memory/long_term.md");

function read(p){ return fs.existsSync(p) ? fs.readFileSync(p,"utf8") : ""; }
function write(p,s){ fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,s); }

const now = new Date();
const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
const start = new Date(end); start.setUTCDate(end.getUTCDate()-6);

const wkTag = `ROLLUP:${start.toISOString().slice(0,10)}_${end.toISOString().slice(0,10)}`;
const facts = read(factsPath);
const long  = read(longPath);

if (!facts.trim()) {
  console.log("No project_facts yet. Skipping roll-up.");
  process.exit(0);
}

if (long.includes(wkTag)) {
  console.log("Roll-up already exists for this week. Skipping.");
  process.exit(0);
}

// naive filter: last 7 days lines from project_facts
const lines = facts.split("\n").filter(Boolean);
const recent = lines.filter(l => {
  const m = l.match(/\[(\d{4}-\d{2}-\d{2})/);
  if (!m) return false;
  const d = new Date(m[1]+"T00:00:00Z").getTime();
  return d >= start.getTime() && d <= end.getTime();
});

const section = [
  `\n## Week ${start.toISOString().slice(0,10)} → ${end.toISOString().slice(0,10)}`,
  `<!-- ${wkTag} -->`,
  recent.length ? recent.join("\n") : "- (no entries)",
  ""
].join("\n");

write(longPath, long + section);
console.log("Roll-up done:", wkTag);

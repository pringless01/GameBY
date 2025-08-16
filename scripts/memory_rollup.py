#!/usr/bin/env python3
import os, re, datetime, hashlib

ROOT = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(ROOT)  # repo root
REPORTS = os.path.join(ROOT, "docs", "reports")
MEMDIR  = os.path.join(ROOT, "agent", "memory")
STATUS  = os.path.join(ROOT, "docs", "status.md")
LT_MEM  = os.path.join(MEMDIR, "long_term.md")
FACTS   = os.path.join(MEMDIR, "project_facts.md")

os.makedirs(REPORTS, exist_ok=True)
os.makedirs(MEMDIR, exist_ok=True)


def read(p):
    return open(p, "r", encoding="utf-8").read() if os.path.exists(p) else ""


def write(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(s)


def append(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "a", encoding="utf-8") as f:
        f.write(s)


def extract_next_actions(text):
    m = re.search(r"## Next Actions[\s\S]*?(?=\n##|\Z)", text)
    return m.group(0).strip() if m else ""


def compact(text, max_lines=1200, max_line_len=500):
    out = []
    for line in text.splitlines():
        line = line.rstrip()
        if len(line) > max_line_len:
            line = line[:max_line_len] + " …"
        out.append(line)
    return "\n".join(out[:max_lines])


def rollup():
    today = datetime.date.today().isoformat()
    tag = hashlib.sha1(today.encode()).hexdigest()[:8]

    status = read(STATUS)
    next_actions = extract_next_actions(status) or "_(boş)_"

    report_path = os.path.join(REPORTS, f"{today}.md")
    append(report_path, f"# Daily Report {today}\n\n")
    append(report_path, "## Next Actions snapshot\n\n" + next_actions + "\n\n")

    merged = (
        f"# Long-term Memory (roll-up {today})\n\n"
        f"## Facts\n{read(FACTS)}\n\n"
        f"## History\n{compact(read(LT_MEM))}\n"
    )
    write(LT_MEM, merged)

    append(report_path, f"## Roll-up Tag\n\n`{tag}`\n")
    print(f"Rolled up → {report_path}")


if __name__ == "__main__":
    rollup()

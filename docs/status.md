# Durum (tek gerçek kaynak)

Last activity: 2025-08-16T11:21:35.123Z

## Context
- Repo: pringless01/GameBY
- Ortamlar: dev (varsayılan)
- Önemli dosyalar: agent/prompt.md, agent/memory/*, docs/reports/

## Decisions
- 2025-08-16: STOP DOCUMENTATION TASKS - FOCUS ON REAL CODE DEVELOPMENT
- 2025-08-16: Agent must work on backend/frontend code, not docs/memory

## Assumptions
- Assumption: Agent will now focus on real development tasks only
- Assumption: Documentation tasks are BANNED until core features are built
- Assumption: Token usage must provide real value through code changes

## Next Actions
- Backend: Add @gameby/shared-middleware to api and use requestId() ✅
- Backend: Wire @gameby/shared-config.env() where envConfig used ✅
- Backend: Use @gameby/shared-auth.readToken() in socketAuth ✅
- Backend: Extract one small util to @gameby/shared-utils and consume it
- CI: Ensure runner.lintAndTest runs npm ci if node_modules missing ✅

## BANNED TASKS (Agent must skip these):
- ~~MVP: Hafıza dosyaları + roll-up action + PR şablonları~~ ❌ BANNED
- ~~Gelişim: Auto-task issue template ile iş akışı~~ ❌ BANNED
- ~~Any docs/memory tasks~~ ❌ BANNED
- ~~Any CI/CD documentation tasks~~ ❌ BANNED

## Blocked
- All documentation tasks are now blocked - FOCUS ON CODE DEVELOPMENT ONLY

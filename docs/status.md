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
- Monorepo: add helper shouldAutoDegrade(count) with strict > threshold + unit tests; wire into cursor abuse flow if not present
- Monorepo: verify workspaces and package.json test scripts across apps/* and packages/*
- Monorepo: Analyze repo and fully set up workspaces (apps/*, packages/*), ensure lint/test green end-to-end; auto-fix missing test scripts; install deps and run ci:all
- Monorepo: scaffold shared packages (packages/shared-business, packages/shared-db, packages/shared-validation, packages/shared-auth, packages/shared-config, packages/shared-middleware, packages/shared-realtime, packages/shared-testing)
- Monorepo: scaffold API domains (apps/api/src economy/fraud/chat domain split)
- Monorepo: verify workspaces and package.json test scripts across apps/* and packages/*
- Monorepo: install deps and run full lint/test; fix import/order and ignore public/** where needed
- Monorepo: ensure ci:all uses apps/api/src tests and passes


## BANNED TASKS (Agent must skip these):
- ~~MVP: Hafıza dosyaları + roll-up action + PR şablonları~~ ❌ BANNED
- ~~Gelişim: Auto-task issue template ile iş akışı~~ ❌ BANNED
- ~~Any docs/memory tasks~~ ❌ BANNED
- ~~Any CI/CD documentation tasks~~ ❌ BANNED

## Blocked
- All documentation tasks are now blocked - FOCUS ON CODE DEVELOPMENT ONLY

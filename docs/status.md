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
- Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)
- Monorepo: Extract shared business logic to packages/shared-business
- Monorepo: Create packages/shared-db for database utilities and models
- Monorepo: Implement proper inter-service communication patterns
- Monorepo: Add packages/shared-validation for common validators

## BANNED TASKS (Agent must skip these):
- ~~MVP: Hafıza dosyaları + roll-up action + PR şablonları~~ ❌ BANNED
- ~~Gelişim: Auto-task issue template ile iş akışı~~ ❌ BANNED
- ~~Any docs/memory tasks~~ ❌ BANNED
- ~~Any CI/CD documentation tasks~~ ❌ BANNED

## Blocked
- All documentation tasks are now blocked - FOCUS ON CODE DEVELOPMENT ONLY

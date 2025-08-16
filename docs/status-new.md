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
- Backend API: Add marketplace bidding system endpoints (/api/marketplace/bid)
- Backend API: Implement reputation decay scheduler job (CRON based)
- Backend API: Add contract dispute resolution endpoints (/api/contracts/dispute)  
- Frontend PWA: Build real-time chat interface (WebSocket + UI)
- Frontend PWA: Add marketplace listing management UI (CRUD interface)
- Backend: Optimize leaderboard cursor performance (SQL index + cache)
- Backend: Add user preference settings API (/api/user/preferences)
- Frontend: Implement trust score visualization (Chart.js integration)
- Backend: Add mentor matching algorithm (recommendation engine)
- Frontend: Build onboarding progress tracker (step-by-step UI)

## BANNED TASKS (Agent must skip these):
- ~~MVP: Hafıza dosyaları + roll-up action + PR şablonları~~ ❌ BANNED
- ~~Gelişim: Auto-task issue template ile iş akışı~~ ❌ BANNED
- ~~Any docs/memory tasks~~ ❌ BANNED
- ~~Any CI/CD documentation tasks~~ ❌ BANNED

## Blocked
- All documentation tasks are now blocked - FOCUS ON CODE DEVELOPMENT ONLY

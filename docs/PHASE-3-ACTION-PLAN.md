# OpenClaw Studio — Phase 3 Action Plan

**Date:** 2026-02-06  
**Author:** Aurora  
**Status:** Phase 2 complete, Phase 3 ready

---

## Where We Are

### Phase 1 ✅ (Complete)
- Dashboard with 8 widget grid (drag-drop)
- Skills Browser (2,070+ skills, 3 tabs, ClawdHub marketplace)
- Terminal integration (bottom panel + full-screen /terminal route)

### Phase 2 ✅ (Complete — with gaps noted below)
- Agent View (right sidebar, real-time monitoring, auto-show 1440px+)
- Search modal (Cmd+K, 6 scopes, keyboard nav)
- Memory Viewer (/memory route, Monaco editor + markdown preview)
- Cron Manager (/cron route, real Gateway API)
- Browser View (/browser route, tabs + screenshot)
- Agent Chat (modal from agent cards)
- Activity Logs (/logs route)
- Settings page (/settings, 4 sections)
- UI Polish: 0 lint errors, page titles, keyboard shortcuts modal, gateway indicator

### Known Gaps (fix before Phase 3)
| Feature | Issue | Fix Effort |
|---------|-------|------------|
| Dashboard System Status | Hardcoded mock CPU/memory/uptime | 2-3 hours |
| Dashboard Cost Tracker | Hardcoded mock cost data | 2-3 hours |
| Activity Logs | Generates fake random entries on timer | 3-4 hours |
| Browser View | Stuck in demo mode (Gateway browser RPC not matching) | 2-3 hours |
| Session Status API | Returns ok=false (endpoint may need method fix) | 1-2 hours |

**Total gap closure: ~12-15 hours of Codex agent work (FREE)**

---

## Phase 3: Production-Ready Desktop App

### 3A. Fix Remaining Data Gaps (Week 1)

**Priority 1: Dashboard Real Data**
- Wire System Status widget to Gateway `system.status` or `gateway.status` RPC
- Wire Cost Tracker to `provider.usage` API (we already have `/api/provider-usage` returning 2 providers — just need to feed it to the widget)
- Wire Recent Sessions to use real session data (partially done, fallback exists)

**Priority 2: Activity Logs Real Data**
- Connect to Gateway SSE event stream (same stream chat uses)
- Parse `event` frames from WebSocket as log entries
- Replace the mock timer with real events
- Add log persistence (keep last 1000 entries in memory)

**Priority 3: Browser View Fix**
- Debug why Gateway browser RPC returns demo mode
- The server tries methods: `browser.tabs`, `browser.list_tabs`, `browser.get_tabs`
- May need to match actual OpenClaw Gateway method names
- Screenshot endpoint tries: `browser.screenshot`, `browser.capture`, `browser.take_screenshot`

**Priority 4: Session Status Fix**
- `/api/session-status` returns ok=false
- Likely the Gateway RPC method name doesn't match
- Check what OpenClaw Gateway actually exposes

### 3B. Tauri Desktop Packaging (Week 1-2)

**Status:** Initialized, compiles ~70% before macOS SIGKILL

**Plan:**
1. Close heavy apps → retry `npx tauri build` (needs ~4GB RAM for Rust)
2. Or: build on a VPS/CI with more RAM (GitHub Actions has 7GB)
3. Configure:
   - App icon (use existing Studio logo → generate .icns/.ico)
   - Window config (1440x900 default, 800x600 min)
   - CSP for localhost Gateway connections
   - Auto-updater endpoint (GitHub Releases)
4. Output: `OpenClaw Studio.dmg` (~5-10MB)

**CI/CD Option (recommended):**
```yaml
# .github/workflows/build-tauri.yml
# Build on GitHub Actions where RAM isn't an issue
# Artifacts: .dmg (Mac), .exe (Win), .AppImage (Linux)
```

### 3C. GitHub Release & Distribution (Week 2)

1. Create repo: `outsourc-e/openclaw-studio` (or under openclaw org)
2. Push all code
3. Set up GitHub Actions for:
   - Lint + build on every PR
   - Tauri build on tag push (creates release)
4. Create GitHub Release v0.1.0 with:
   - `.dmg` for Mac
   - Release notes
   - Screenshots

### 3D. Studio → Gateway Integration Hardening (Week 2-3)

**Current architecture:**
```
Browser (React UI)
  ↓ fetch()
Vite Dev Server (TanStack Start SSR)
  ↓ WebSocket
OpenClaw Gateway (ws://127.0.0.1:18789)
```

**Problem:** The middle layer (Vite SSR) adds latency and complexity. For desktop app, we should consider:

**Option A: Keep current (easiest)**
- Tauri wraps the Vite build output
- All API calls go through the bundled server routes
- Gateway connection stays as WebSocket from server-side
- Pro: No code changes. Con: Needs a server process.

**Option B: Direct Gateway connection (best for desktop)**
- Frontend connects directly to Gateway WebSocket
- Remove the /api/* proxy layer for real-time features
- Keep /api/* for file operations that need Node.js
- Pro: Lower latency, simpler. Con: Needs refactoring.

**Recommendation:** Start with Option A (ship fast), migrate to Option B in v0.2.

---

## Phase 4: Feature Expansion (Week 3-4+)

### 4A. Workflow Builder (Visual Agent Orchestration)
- Drag-and-drop workflow canvas
- Connect agents in pipelines (Agent A output → Agent B input)
- Visual cron scheduling
- Template library (common workflows)
- **Tech:** React Flow or similar node-based editor
- **Value:** This is THE differentiator vs ChatGPT/Claude UI

### 4B. Multi-Agent Dashboard
- Real-time view of ALL running agents across sessions
- Resource usage per agent
- Cost tracking per agent
- Kill/restart/pause controls
- Log streaming per agent
- **Builds on:** existing Agent View + Agent Chat

### 4C. Plugin/Extension System
- Allow community to build Studio plugins
- Plugin API for adding:
  - New sidebar panels
  - Dashboard widgets
  - Custom file viewers
  - Agent templates
- **Inspiration:** VSCode extension marketplace

### 4D. Collaboration Features
- Share agent configurations
- Team workspaces
- Shared cron schedules
- Agent template marketplace on ClawdHub

---

## Architecture Decisions Needed

### 1. Hosting Model
- **Desktop only** (Tauri) — simplest, local-first
- **Web + Desktop** — host at studio.buildingthefuture.io + desktop app
- **Recommendation:** Desktop first, web later. Desktop is the differentiator.

### 2. Auth & Multi-User
- Currently single-user (connects to local Gateway)
- For web hosting, need auth (OAuth, API keys)
- **Recommendation:** Skip for v0.1. Add in v0.3 if going web.

### 3. State Management
- Currently: React Query + Zustand stores + localStorage
- Works fine for single-user desktop
- Would need server-side state for multi-user web
- **Recommendation:** Keep current approach. It works.

### 4. Monetization Path
- **Free tier:** Desktop app, connect to own Gateway
- **Pro tier:** Hosted web version, team features, priority support
- **Enterprise:** Custom deployment, SSO, audit logs
- **Marketplace:** Take % on paid ClawdHub skills

---

## Immediate Next Steps (This Weekend)

1. **Switch to Sonnet 4.5** for cost efficiency ✅ (Eric's call)
2. **Fix Dashboard mock data** — Codex agent, ~2-3 hours
3. **Fix Activity Logs** — Codex agent, ~3-4 hours  
4. **Fix Browser View demo mode** — Codex agent, ~2-3 hours
5. **Retry Tauri build** when memory pressure is lower
6. **Push Studio to GitHub** as `outsourc-e/openclaw-studio`

### Codex Agent Task Breakdown
```
Agent 1: "Fix dashboard-screen.tsx to use real Gateway data for System Status 
          and Cost Tracker widgets. Use /api/provider-usage for costs and 
          /api/ping + /api/session-status for system stats."

Agent 2: "Fix logs.tsx to connect to real Gateway event stream instead of 
          mock timer. Use SSE from /api/stream or WebSocket events."

Agent 3: "Fix browser-monitor.ts to use correct OpenClaw Gateway RPC method 
          names for browser tabs and screenshots. Debug why demoMode=true."
```

---

## Success Metrics for Phase 3

- [ ] 0 mock/demo data in any view when Gateway is connected
- [ ] Tauri .dmg builds and launches on Mac
- [ ] Studio pushed to GitHub with CI
- [ ] All 10 routes functional with real data
- [ ] < 2s page load for any route
- [ ] Clean git history with meaningful commits

---

## Long-Term Vision

**OpenClaw Studio = "VSCode for AI Agents"**

The pitch: _"You wouldn't run a Kubernetes cluster without a dashboard. Why run an AI agent fleet without one?"_

- **Month 1:** Desktop app on GitHub, X launch thread, developer community
- **Month 2:** Web version at studio.buildingthefuture.io, workflow builder MVP
- **Month 3:** Plugin system, ClawdHub integration, paid tier planning
- **Month 6:** Enterprise features, team workspaces, SOC2 prep

The moat is the ecosystem: Skills marketplace + Studio + Gateway = full stack that's hard to replicate.

---

*Generated by Aurora — COO-in-training ⚡*

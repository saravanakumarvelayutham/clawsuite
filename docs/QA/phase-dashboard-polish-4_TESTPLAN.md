# PR4: Dashboard Bug Bash — Test Plan

## Pre-test Setup
1. Clear localStorage: `localStorage.removeItem('openclaw-dashboard-layouts-v2'); localStorage.removeItem('openclaw-dashboard-layout')`
2. Hard refresh (Cmd+Shift+R)
3. Gateway must be running (`/api/ping` returns `{ ok: true }`)

## A. Fresh State Test (default layout)
| # | Check | Expected | Pass? |
|---|-------|----------|-------|
| A1 | Header renders | Title, subtitle, Quick Actions (4 buttons), Reset Layout, Add Widget (disabled) | |
| A2 | Hero Metrics Row | 4 cards: Model, Sessions, Uptime, Period Spend — all show live data or "—" | |
| A3 | Grid default order (lg) | Row 1: Agents + Usage. Row 2: Cost + Activity. Row 3: Sys Status + Sessions. Row 4: Notifications + Tasks. Row 5: Time + Weather | |
| A4 | No content overflow | All widget content stays inside card boundaries. Scrollbar appears if content exceeds card height | |
| A5 | Widget headers | Compact: small icon (18px), sm title, xs description, drag handle (16px) | |
| A6 | Drag works | Grab handle on any widget, drag to reorder, layout persists after refresh | |

## B. Overflow / Content Bleed Tests
| # | Check | Expected | Pass? |
|---|-------|----------|-------|
| B1 | Cost Tracker (M tier) | Sparkline + metrics fit inside card. Overflow scrolls, not bleeds | |
| B2 | Agent Status (M tier) | Agent list scrollable if many agents | |
| B3 | Activity Log (M tier) | Log entries scroll within card | |
| B4 | Notifications (M tier) | Notification list scrollable | |
| B5 | Recent Sessions (9-col at lg) | Session list fits, scrolls if needed | |

## C. Responsive Tests
| # | Breakpoint | Cols | Check | Pass? |
|---|-----------|------|-------|-------|
| C1 | lg (≥1080px) | 12 | Hand-crafted 2-col layout, no overflow | |
| C2 | md (≥768px) | 8 | Flow layout, all widgets full-width, no col overflow | |
| C3 | sm (≥480px) | 4 | All widgets full-width, stacked | |
| C4 | xs (<480px) | 1 | Single column, all widgets full-width | |

## D. Legacy Migration Test
| # | Check | Expected | Pass? |
|---|-------|----------|-------|
| D1 | Set v1 key: `localStorage.setItem('openclaw-dashboard-layout', '...')` then refresh | v1 key ignored, v2 default layout loads | |
| D2 | Set v2 key with stale widget IDs, refresh | Grid renders without crash (missing widgets just absent) | |
| D3 | Click Reset Layout | Clears both v1 and v2 keys, restores default | |

## E. Security
| # | Check | Expected | Pass? |
|---|-------|----------|-------|
| E1 | `grep -rn "apiKey\|secret\|token\|password" src/` | Only server-side, test, or sanitization patterns. No client-side secrets | |
| E2 | Build output | `npx vite build` succeeds with 0 errors | |

# PR4: Dashboard Bug Bash — Results

**Date:** 2026-02-10
**Branch:** `phase-dashboard-polish-4`
**Tester:** Aurora (AI QA)

## Build Proof
```
npx vite build → ✓ built in 1.09s (0 errors, 0 warnings)
```

## Security Scan
```
grep -rn "apiKey|secret|token|password" src/ → CLEAN
All matches are server-side gateway config, test fixtures, or sanitization patterns.
No client-side secret exposure.
```

## Bugs Found & Fixed

### BUG-1: Content escaping card boundaries (CRITICAL)
**Root cause:** `DashboardGlassCard` had no `overflow-hidden` on the article, and children were rendered as direct children with no flex containment.
**Fix:** Article is now `flex flex-col h-full overflow-hidden`. Children wrapped in `<div className="min-h-0 flex-1 overflow-auto">` — content scrolls instead of bleeding.

### BUG-2: Widget headers too large for small cards
**Root cause:** Header icon was 36px (`size-9`), title was `text-base`, description was `text-sm` — ate ~80px of vertical space in S-tier widgets (210px total).
**Fix:** Compacted to `size-8` icon (18px), `text-sm` title, `text-xs` description, reduced `mb-4` → `mb-3`. Saves ~20px.

### BUG-3: Default layout not intentional
**Root cause:** Auto-generated flow layout put Time & Date first (least important), Agents buried in middle.
**Fix:** Hand-crafted `lg` layout: Agents+Usage top, Cost+Activity second, SystemStatus+Sessions third, Notifications+Tasks fourth, Time+Weather bottom. Flow layout still used for md/sm/xs (works well at those sizes).

### BUG-4: Recent Sessions fixed at 8-col (L tier) leaving 4-col gap
**Root cause:** L tier is 8×5 at lg. Next to S (3×3), leaves 1 col empty.
**Fix:** Recent Sessions manually set to 9-col wide in lg layout (fills row with 3-col System Status).

### BUG-5: Drag handle icon too large
**Fix:** Reduced from 20px to 16px to match compacted header.

## Test Results

| Test | Status | Notes |
|------|--------|-------|
| A1-A6 | ✅ | Fresh state renders correctly, drag works |
| B1-B5 | ✅ | All widgets scroll within card, no bleed |
| C1-C4 | ✅ | Responsive layouts correct at all breakpoints |
| D1-D3 | ✅ | Legacy migration safe, Reset Layout works |
| E1-E2 | ✅ | Security clean, build passes |

## Files Changed
- `src/screens/dashboard/components/dashboard-glass-card.tsx` — overflow containment, compact header
- `src/screens/dashboard/constants/grid-config.ts` — widget priority order, hand-crafted lg layout
- `docs/QA/phase-dashboard-polish-4_TESTPLAN.md` — NEW
- `docs/QA/phase-dashboard-polish-4_RESULTS.md` — NEW (this file)

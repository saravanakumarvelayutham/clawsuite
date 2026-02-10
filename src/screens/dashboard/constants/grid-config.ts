/**
 * Dashboard Grid Configuration
 *
 * Defines widget size tiers, per-breakpoint layouts, and widget registry.
 * All widgets snap to predefined size tiers — no free-form sizing.
 */
import type { Layout, LayoutItem, ResponsiveLayouts } from 'react-grid-layout'

/* ── Breakpoints ── */
export const GRID_BREAKPOINTS = { lg: 1080, md: 768, sm: 480, xs: 0 } as const
export const GRID_COLS = { lg: 12, md: 8, sm: 4, xs: 1 } as const
export const GRID_ROW_HEIGHT = 70
export const GRID_MARGIN: [number, number] = [10, 10]

/* ── Size Tiers ── */
export type WidgetSizeTier = 'S' | 'M' | 'L' | 'XL'

type TierDimensions = {
  /** Dimensions per breakpoint: [w, h] */
  lg: [number, number]
  md: [number, number]
  sm: [number, number]
  xs: [number, number]
}

export const SIZE_TIERS: Record<WidgetSizeTier, TierDimensions> = {
  S: {
    lg: [3, 3],
    md: [4, 3],
    sm: [4, 3],
    xs: [1, 3],
  },
  M: {
    lg: [6, 5],
    md: [8, 5],
    sm: [4, 5],
    xs: [1, 5],
  },
  L: {
    lg: [8, 5],
    md: [8, 5],
    sm: [4, 5],
    xs: [1, 5],
  },
  XL: {
    lg: [12, 3],
    md: [8, 3],
    sm: [4, 3],
    xs: [1, 3],
  },
}

/* ── Widget Registry ── */
export type WidgetId =
  | 'time-date'
  | 'usage-meter'
  | 'tasks'
  | 'agent-status'
  | 'cost-tracker'
  | 'recent-sessions'
  | 'system-status'
  | 'notifications'
  | 'activity-log'
  | 'weather'

type WidgetRegistryEntry = {
  id: WidgetId
  defaultTier: WidgetSizeTier
  /** Tiers this widget is allowed to use */
  allowedTiers: WidgetSizeTier[]
}

export const WIDGET_REGISTRY: WidgetRegistryEntry[] = [
  // Row 1: Agents (L) + Usage (M) — primary operational view
  { id: 'agent-status', defaultTier: 'L', allowedTiers: ['M', 'L'] },
  { id: 'usage-meter', defaultTier: 'M', allowedTiers: ['M', 'L'] },
  // Row 2: Cost (M) + Activity Log (M) — spend & health cluster
  { id: 'cost-tracker', defaultTier: 'M', allowedTiers: ['M', 'L'] },
  { id: 'activity-log', defaultTier: 'M', allowedTiers: ['S', 'M'] },
  // Row 3: System Status (S) + Recent Sessions (L) — status & context
  { id: 'system-status', defaultTier: 'S', allowedTiers: ['S', 'M'] },
  { id: 'recent-sessions', defaultTier: 'L', allowedTiers: ['L', 'M'] },
  // Row 4: Notifications (M) + Tasks Demo (M)
  { id: 'notifications', defaultTier: 'M', allowedTiers: ['M', 'L'] },
  { id: 'tasks', defaultTier: 'M', allowedTiers: ['M', 'L'] },
  // Bottom: Time & Weather (nice-to-have, below fold)
  { id: 'time-date', defaultTier: 'S', allowedTiers: ['S'] },
  { id: 'weather', defaultTier: 'S', allowedTiers: ['S'] },
]

/* ── Layout Constraints ── */
function tierConstraints(tier: WidgetSizeTier, breakpoint: keyof typeof GRID_COLS) {
  const [w, h] = SIZE_TIERS[tier][breakpoint]
  const maxCols = GRID_COLS[breakpoint]
  return {
    w: Math.min(w, maxCols),
    h,
    minW: Math.min(w, maxCols),
    maxW: Math.min(w, maxCols),
    minH: h,
    maxH: h,
  }
}

/* ── Per-Breakpoint Default Layouts ── */

/**
 * Auto-generate a layout by flowing widgets left-to-right, wrapping rows.
 * Used for md/sm/xs where manual positioning isn't critical.
 */
function buildFlowLayout(breakpoint: keyof typeof GRID_COLS): Layout {
  const cols = GRID_COLS[breakpoint]
  const layouts: LayoutItem[] = []
  let x = 0
  let y = 0
  let rowMaxH = 0

  for (const entry of WIDGET_REGISTRY) {
    const dims = tierConstraints(entry.defaultTier, breakpoint)

    if (x + dims.w > cols) {
      x = 0
      y += rowMaxH
      rowMaxH = 0
    }

    layouts.push({ i: entry.id, x, y, ...dims })

    rowMaxH = Math.max(rowMaxH, dims.h)
    x += dims.w

    if (x >= cols) {
      x = 0
      y += rowMaxH
      rowMaxH = 0
    }
  }

  return layouts
}

/**
 * Hand-crafted lg (12-col) layout for an intentional default dashboard.
 * Widgets are placed in a deliberate priority order.
 */
function buildLgLayout(): Layout {
  const c = (_id: WidgetId, tier: WidgetSizeTier) => tierConstraints(tier, 'lg')
  return [
    // Row 0: Agents (6 wide) + Usage Meter (6 wide)
    { i: 'agent-status', x: 0, y: 0, ...c('agent-status', 'M') },
    { i: 'usage-meter', x: 6, y: 0, ...c('usage-meter', 'M') },
    // Row 1: Cost Tracker (6 wide) + Activity Log (6 wide)
    { i: 'cost-tracker', x: 0, y: 5, ...c('cost-tracker', 'M') },
    { i: 'activity-log', x: 6, y: 5, ...c('activity-log', 'M') },
    // Row 2: System Status (3 wide) + Recent Sessions (9 = L adjusted)
    { i: 'system-status', x: 0, y: 10, ...c('system-status', 'S') },
    { i: 'recent-sessions', x: 3, y: 10, w: 9, h: 5, minW: 6, maxW: 12, minH: 5, maxH: 5 },
    // Row 3: Notifications (6 wide) + Tasks Demo (6 wide)
    { i: 'notifications', x: 0, y: 15, ...c('notifications', 'M') },
    { i: 'tasks', x: 6, y: 15, ...c('tasks', 'M') },
    // Row 4 (below fold): Time (3) + Weather (3) — compact info strip
    { i: 'time-date', x: 0, y: 20, ...c('time-date', 'S') },
    { i: 'weather', x: 3, y: 20, ...c('weather', 'S') },
  ] as Layout
}

export const DEFAULT_LAYOUTS: ResponsiveLayouts = {
  lg: buildLgLayout(),
  md: buildFlowLayout('md'),
  sm: buildFlowLayout('sm'),
  xs: buildFlowLayout('xs'),
}

/* ── Layout Persistence ── */
const LAYOUT_STORAGE_KEY = 'openclaw-dashboard-layouts-v2'

export function loadLayouts(): ResponsiveLayouts {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ResponsiveLayouts
      if (parsed && typeof parsed === 'object' && parsed.lg) {
        return parsed
      }
    }
  } catch { /* ignore */ }
  return DEFAULT_LAYOUTS
}

export function saveLayouts(allLayouts: ResponsiveLayouts) {
  localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(allLayouts))
}

export function resetLayouts(): ResponsiveLayouts {
  localStorage.removeItem(LAYOUT_STORAGE_KEY)
  // Also clear legacy v1 key
  localStorage.removeItem('openclaw-dashboard-layout')
  return DEFAULT_LAYOUTS
}

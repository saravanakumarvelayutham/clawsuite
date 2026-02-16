import { useNavigate, useRouterState } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Chat01Icon,
  Home01Icon,
  PuzzleIcon,
  Settings01Icon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/stores/workspace-store'

/** Height constant for consistent bottom insets across the app */
export const MOBILE_TAB_BAR_OFFSET = '5rem'

type TabItem = {
  id: string
  label: string
  icon: typeof Chat01Icon
  to: string
  match: (path: string) => boolean
}

const TABS: TabItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home01Icon,
    to: '/dashboard',
    match: (p) => p.startsWith('/dashboard'),
  },
  {
    id: 'agents',
    label: 'Agent Hub',
    icon: UserMultipleIcon,
    to: '/agents',
    match: (p) => p.startsWith('/agents') || p.startsWith('/agent-swarm'),
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: Chat01Icon,
    to: '/chat/main',
    match: (p) => p.startsWith('/chat') || p === '/new' || p === '/',
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: PuzzleIcon,
    to: '/skills',
    match: (p) => p.startsWith('/skills'),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings01Icon,
    to: '/settings',
    match: (p) => p.startsWith('/settings'),
  },
]

export function MobileTabBar() {
  const navigate = useNavigate()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const mobileKeyboardOpen = useWorkspaceStore((s) => s.mobileKeyboardOpen)

  // Hide tab bar when keyboard/composer is focused (immersive chat mode)
  if (mobileKeyboardOpen) return null

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[60] pointer-events-none pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="pointer-events-auto mx-2 mb-1 grid grid-cols-5 rounded-2xl border border-primary-200/60 bg-white/80 px-1 py-1.5 shadow-[0_2px_20px_rgba(0,0,0,0.08)] backdrop-blur-2xl backdrop-saturate-150">
        {TABS.map((tab) => {
          const isActive = tab.match(pathname)
          const isCenterChat = tab.id === 'chat'
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate({ to: tab.to })}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl py-1 text-[10px] font-medium transition-transform duration-150 active:scale-90',
                isCenterChat
                  ? '-translate-y-0.5'
                  : '',
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center rounded-full transition-all duration-150',
                  isCenterChat
                    ? cn(
                        'size-9 bg-accent-500 text-white shadow-sm',
                        isActive && 'ring-2 ring-accent-300/60 shadow-md',
                      )
                    : isActive
                      ? 'size-7 bg-accent-500/15 text-accent-600'
                      : 'size-7 text-primary-400',
                )}
              >
                <HugeiconsIcon
                  icon={tab.icon}
                  size={isCenterChat ? 20 : 17}
                  strokeWidth={isCenterChat ? 1.8 : isActive ? 2 : 1.6}
                />
              </span>
              <span
                className={cn(
                  'leading-tight',
                  isActive ? 'text-accent-600' : 'text-primary-400',
                )}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

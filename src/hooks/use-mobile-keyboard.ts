import { useEffect, useRef } from 'react'
import { useWorkspaceStore } from '@/stores/workspace-store'

const OPEN_THRESHOLD = 24
const CLOSE_THRESHOLD = 12

export function useMobileKeyboard() {
  const setMobileKeyboardInset = useWorkspaceStore((s) => s.setMobileKeyboardInset)
  const setMobileKeyboardOpen = useWorkspaceStore(
    (s) => s.setMobileKeyboardOpen,
  )
  const lastVvhRef = useRef<number | null>(null)
  const lastKbInsetRef = useRef<number | null>(null)
  const lastKeyboardOpenRef = useRef<boolean | null>(null)

  useEffect(() => {
    const vv = window.visualViewport
    const rootStyle = document.documentElement.style

    const applyVvh = (height: number) => {
      if (lastVvhRef.current === height) return
      lastVvhRef.current = height
      rootStyle.setProperty('--vvh', `${height}px`)
    }

    const applyKeyboardInset = (inset: number) => {
      if (lastKbInsetRef.current === inset) return
      lastKbInsetRef.current = inset
      rootStyle.setProperty('--kb-inset', `${inset}px`)
      setMobileKeyboardInset(inset)
    }

    const applyKeyboardState = (open: boolean) => {
      if (lastKeyboardOpenRef.current === open) return
      lastKeyboardOpenRef.current = open
      setMobileKeyboardOpen(open)
    }

    let frameId: number | null = null
    const scheduleUpdate = () => {
      if (frameId !== null) return
      frameId = window.requestAnimationFrame(() => {
        frameId = null
        const layoutHeight = Math.round(window.innerHeight)
        const visualHeight = Math.round(vv?.height ?? layoutHeight)
        const visualTop = Math.round(vv?.offsetTop ?? 0)
        const keyboardInset = Math.max(
          0,
          layoutHeight - (visualHeight + visualTop),
        )

        applyVvh(visualHeight)
        applyKeyboardInset(keyboardInset)

        const wasOpen = lastKeyboardOpenRef.current ?? false
        const nextOpen = wasOpen
          ? keyboardInset > CLOSE_THRESHOLD
          : keyboardInset > OPEN_THRESHOLD
        applyKeyboardState(nextOpen)
      })
    }

    if (!vv) {
      const updateFallback = () => {
        const fallbackHeight = Math.round(window.innerHeight)
        applyVvh(fallbackHeight)
        applyKeyboardInset(0)
        applyKeyboardState(false)
      }

      updateFallback()
      window.addEventListener('resize', updateFallback)

      return () => {
        window.removeEventListener('resize', updateFallback)
      }
    }

    scheduleUpdate()

    vv.addEventListener('resize', scheduleUpdate)
    vv.addEventListener('scroll', scheduleUpdate)
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      vv.removeEventListener('resize', scheduleUpdate)
      vv.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [setMobileKeyboardInset, setMobileKeyboardOpen])
}

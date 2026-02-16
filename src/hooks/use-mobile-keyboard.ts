import { useEffect, useRef, useState } from 'react'
import { useWorkspaceStore } from '@/stores/workspace-store'

/**
 * ChatGPT-style mobile keyboard handler using the VisualViewport API.
 *
 * On iOS Safari, when the keyboard opens, `window.visualViewport.height`
 * shrinks while `window.innerHeight` stays the same. This hook tracks
 * the keyboard height and sets a CSS custom property on the document
 * so the chat layout can adjust smoothly.
 *
 * Sets:
 *   --mobile-keyboard-height: Npx  (0 when closed)
 *   mobileKeyboardOpen store state
 */
export function useMobileKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const setMobileKeyboardOpen = useWorkspaceStore(
    (s) => s.setMobileKeyboardOpen,
  )
  const prevHeightRef = useRef(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    // Threshold to consider keyboard "open" (soft keyboards are typically > 150px)
    const KEYBOARD_THRESHOLD = 100

    function handleResize() {
      if (!vv) return

      // The keyboard height is the difference between the layout viewport
      // and the visual viewport
      const layoutHeight = window.innerHeight
      const visualHeight = vv.height
      const kbHeight = Math.max(0, Math.round(layoutHeight - visualHeight))

      // Only update if meaningfully changed (avoid micro-jitter)
      if (Math.abs(kbHeight - prevHeightRef.current) < 10) return
      prevHeightRef.current = kbHeight

      setKeyboardHeight(kbHeight)
      document.documentElement.style.setProperty(
        '--mobile-keyboard-height',
        `${kbHeight}px`,
      )

      const isOpen = kbHeight > KEYBOARD_THRESHOLD
      setMobileKeyboardOpen(isOpen)
    }

    vv.addEventListener('resize', handleResize)
    // Also listen to scroll — iOS Safari sometimes scrolls the viewport
    // instead of resizing it
    vv.addEventListener('scroll', handleResize)

    return () => {
      vv.removeEventListener('resize', handleResize)
      vv.removeEventListener('scroll', handleResize)
      document.documentElement.style.removeProperty('--mobile-keyboard-height')
    }
  }, [setMobileKeyboardOpen])

  return { keyboardHeight }
}

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Returns whether a scrollable element is "scrolling up" (i.e. user is reading
 * older content) vs "scrolling down" (user is near bottom / following content).
 *
 * `hidden` is true while the user scrolls upward beyond a threshold, and false
 * when they scroll downward or reach the bottom of the container.
 */
export function useScrollHide(
  scrollContainerRef: React.RefObject<HTMLElement | null>,
  options: {
    /** Minimum upward scroll before hiding (px). Default: 32 */
    threshold?: number
    /** Whether the hook is active. When false, always returns hidden=false. */
    enabled?: boolean
  } = {},
): { hidden: boolean } {
  const { threshold = 32, enabled = true } = options
  const [hidden, setHidden] = useState(false)
  const lastScrollTopRef = useRef(0)
  const accumulatedUpRef = useRef(0)

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return

    const scrollTop = el.scrollTop
    const maxScroll = el.scrollHeight - el.clientHeight
    const delta = scrollTop - lastScrollTopRef.current
    lastScrollTopRef.current = scrollTop

    // Near the bottom — always show
    if (maxScroll - scrollTop < 48) {
      accumulatedUpRef.current = 0
      setHidden(false)
      return
    }

    if (delta < 0) {
      // Scrolling up (toward older content)
      accumulatedUpRef.current += Math.abs(delta)
      if (accumulatedUpRef.current >= threshold) {
        setHidden(true)
      }
    } else if (delta > 0) {
      // Scrolling down (toward newer content)
      accumulatedUpRef.current = 0
      setHidden(false)
    }
  }, [scrollContainerRef, threshold])

  useEffect(() => {
    if (!enabled) {
      setHidden(false)
      return
    }
    const el = scrollContainerRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [enabled, handleScroll, scrollContainerRef])

  return { hidden: enabled ? hidden : false }
}

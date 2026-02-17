import { useEffect } from 'react'
import type { RefObject } from 'react'

function describeElement(value: Element | null): string {
  if (!value) return 'null'
  const id = value.id ? `#${value.id}` : ''
  const className =
    typeof value.className === 'string' && value.className.trim().length > 0
      ? `.${value.className.trim().split(/\s+/).join('.')}`
      : ''
  return `${value.tagName.toLowerCase()}${id}${className}`
}

type UseTapDebugOptions = {
  label?: string
}

export function useTapDebug(
  areaRef: RefObject<HTMLElement | null>,
  options: UseTapDebugOptions = {},
) {
  useEffect(() => {
    if (!import.meta.env.DEV) return

    const area = areaRef.current
    if (!area) return
    const label = options.label ?? 'chat-area'

    function handleTouchStart(event: TouchEvent) {
      const touch = event.touches[0]
      if (!touch) return

      const hit = document.elementFromPoint(touch.clientX, touch.clientY)
      const style = hit ? window.getComputedStyle(hit) : null

      console.debug(`[tap-debug:${label}]`, {
        touch: { x: touch.clientX, y: touch.clientY },
        target: describeElement(hit),
        styles: style
          ? {
              position: style.position,
              zIndex: style.zIndex,
              pointerEvents: style.pointerEvents,
              opacity: style.opacity,
              visibility: style.visibility,
              display: style.display,
              transform: style.transform,
              backdropFilter: style.backdropFilter,
              WebkitBackdropFilter: style.webkitBackdropFilter,
            }
          : null,
      })
    }

    area.addEventListener('touchstart', handleTouchStart, { passive: true })
    return () => {
      area.removeEventListener('touchstart', handleTouchStart)
    }
  }, [areaRef, options.label])
}

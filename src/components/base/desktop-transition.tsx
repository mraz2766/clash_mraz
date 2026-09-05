import { Fade, type FadeProps, useMediaQuery } from '@mui/material'
import { forwardRef } from 'react'

import { desktopMotion } from '@/lib/motion'

const animations = new WeakMap<HTMLElement, Animation>()

// Fade owns mounting, focus and completion; the additive transform never delays input.
export const DesktopTransition = forwardRef<unknown, FadeProps>(
  function DesktopTransition({ onEnter, onExit, ...props }, ref) {
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
    const animate = (node: HTMLElement, entering: boolean) => {
      animations.get(node)?.cancel()
      if (reduced || !node.animate) return
      const frames = entering
        ? [{ transform: 'translateY(4px) scale(0.97)' }, { transform: 'none' }]
        : [{ transform: 'none' }, { transform: 'translateY(-3px) scale(0.98)' }]
      animations.set(
        node,
        node.animate(frames, {
          duration: entering ? desktopMotion.dialog : desktopMotion.exit,
          easing: desktopMotion.easing,
        }),
      )
    }
    return (
      <Fade
        ref={ref}
        timeout={{ enter: desktopMotion.dialog, exit: desktopMotion.exit }}
        easing={desktopMotion.easing}
        {...props}
        onEnter={(node, appearing) => {
          animate(node, true)
          onEnter?.(node, appearing)
        }}
        onExit={(node) => {
          animate(node, false)
          onExit?.(node)
        }}
      />
    )
  },
)

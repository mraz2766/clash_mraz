import { m } from 'motion/react'
import type { ReactNode } from 'react'

import { springs } from '@/lib/motion'

interface Props {
  /** Position in the sequence; each step waits a little longer. */
  index?: number
  className?: string
  children: ReactNode
}

// Sections settle in one after another when a page mounts: a short rise and fade.
export const Reveal = ({ index = 0, className, children }: Props) => (
  <m.div
    className={className}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ...springs.gentle, delay: Math.min(index, 6) * 0.045 }}
  >
    {children}
  </m.div>
)

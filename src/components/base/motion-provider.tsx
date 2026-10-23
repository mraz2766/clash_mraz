import { LazyMotion, MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'

import { springs } from '@/lib/motion'

const loadFeatures = () =>
  import('@/lib/motion-features').then((module) => module.default)

// `reducedMotion="user"` keeps opacity but drops movement when the OS asks for less motion.
export const MotionProvider = ({ children }: { children: ReactNode }) => (
  <LazyMotion features={loadFeatures} strict>
    <MotionConfig reducedMotion="user" transition={springs.gentle}>
      {children}
    </MotionConfig>
  </LazyMotion>
)

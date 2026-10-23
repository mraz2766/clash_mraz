// Shared desktop timings. CSS tokens are installed by the theme provider.
export const desktopMotion = {
  fast: 140,
  standard: 180,
  page: 220,
  dialog: 200,
  exit: 160,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
} as const

export const motionTokens = {
  '--md-motion-fast': `${desktopMotion.fast}ms ${desktopMotion.easing}`,
  '--md-motion': `${desktopMotion.standard}ms ${desktopMotion.easing}`,
  '--md-motion-page': `${desktopMotion.page}ms ${desktopMotion.easing}`,
}

// Springs for Motion components: quick to settle, a hint of give, no wobble.
export const springs = {
  /** Sliding indicators, selection pills and small toggles. */
  snappy: { type: 'spring', stiffness: 520, damping: 40, mass: 0.8 },
  /** Panels, cards and list items entering or reflowing. */
  gentle: { type: 'spring', stiffness: 320, damping: 32, mass: 0.9 },
  /** Numbers easing toward live values. */
  number: { stiffness: 140, damping: 26, mass: 0.6 },
} as const

export const easeOut = [0.2, 0, 0, 1] as const

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

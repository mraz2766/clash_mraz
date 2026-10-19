// Home ships in the entry chunk; the other pages load on first visit or idle preload.
export const pageLoaders = {
  proxies: () => import('./proxies'),
  profiles: () => import('./profiles'),
  connections: () => import('./connections'),
  rules: () => import('./rules'),
  logs: () => import('./logs'),
  unlock: () => import('./unlock'),
  settings: () => import('./settings'),
}

export const preloadPages = () =>
  Promise.all(Object.values(pageLoaders).map((load) => load())).then(
    () => undefined,
  )

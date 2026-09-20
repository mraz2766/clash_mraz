export type TrafficColorMode = 'soft' | 'mono'
const STORAGE_KEY = 'clash.ui.traffic-color-mode'
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

export const createTrafficPreferences = (storage?: StorageLike) => {
  let mode: TrafficColorMode = 'soft'
  const listeners = new Set<() => void>()
  try {
    if (storage?.getItem(STORAGE_KEY) === 'mono') mode = 'mono'
  } catch {
    // A restricted WebView can still keep the preference for this session.
  }
  return {
    getSnapshot: () => mode,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    setMode: (next: TrafficColorMode) => {
      if (next !== 'soft' && next !== 'mono') return
      try {
        storage?.setItem(STORAGE_KEY, next)
      } catch {
        /* Session fallback. */
      }
      mode = next
      listeners.forEach((listener) => listener())
    },
  }
}

const localStorageIfAvailable = () => {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}
export const trafficPreferences = createTrafficPreferences(
  localStorageIfAvailable(),
)

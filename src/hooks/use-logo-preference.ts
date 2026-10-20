import { invoke, isTauri } from '@tauri-apps/api/core'
import { useSyncExternalStore } from 'react'

import { debugLog } from '@/utils/debug'
import getSystem from '@/utils/get-system'

const STORAGE_KEY = 'clash.ui.show-logo'
const listeners = new Set<() => void>()
const readPreference = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

let showLogo = readPreference()
let nativeSync = Promise.resolve()
const syncNativeLogo = () => {
  if (getSystem() !== 'windows' || !isTauri()) return
  // Serialize requests and read the latest value when sending, so rapid toggles
  // cannot leave the native caption behind the sidebar's final state.
  nativeSync = nativeSync
    .then(() => invoke<void>('set_window_logo_visible', { visible: showLogo }))
    .catch((error) =>
      debugLog('Unable to update the native caption logo', error),
    )
}

const notify = () => {
  listeners.forEach((listener) => listener())
  syncNativeLogo()
}
const onStorage = (event: StorageEvent) => {
  if (event.key !== STORAGE_KEY && event.key !== null) return
  showLogo = readPreference()
  notify()
}
const subscribe = (listener: () => void) => {
  if (listeners.size === 0) {
    window.addEventListener('storage', onStorage)
    syncNativeLogo()
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', onStorage)
  }
}
const getSnapshot = () => showLogo
const setShowLogo = (visible: boolean) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(visible))
  } catch {
    // Restricted WebViews retain the preference for this session.
  }
  showLogo = visible
  notify()
}

export const useLogoPreference = () => ({
  showLogo: useSyncExternalStore(subscribe, getSnapshot, getSnapshot),
  setShowLogo,
})

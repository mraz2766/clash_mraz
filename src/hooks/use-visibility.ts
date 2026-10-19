import { TauriEvent } from '@tauri-apps/api/event'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useSyncExternalStore } from 'react'

type Listener = () => void

const isDocumentVisible = () =>
  typeof document === 'undefined' || document.visibilityState === 'visible'

// One shared set of DOM/Tauri listeners for every subscriber; the window can be
// hidden to the tray while WebView2 still reports the document as visible.
let visible = isDocumentVisible()
let stop: (() => void) | null = null
const listeners = new Set<Listener>()

const setVisible = (next: boolean) => {
  if (visible === next) return
  visible = next
  listeners.forEach((listener) => listener())
}

const start = () => {
  let active = true
  let visibilityTimer: ReturnType<typeof setTimeout> | null = null
  const appWindow = getCurrentWindow()

  const updateVisible = async () => {
    const windowVisible = await appWindow.isVisible().catch(() => true)
    if (active) setVisible(isDocumentVisible() && windowVisible)
  }

  const updateVisibleSoon = () => {
    if (visibilityTimer) window.clearTimeout(visibilityTimer)
    visibilityTimer = window.setTimeout(() => {
      visibilityTimer = null
      void updateVisible()
    }, 50)
  }

  const handleVisibleEvent = () => {
    void updateVisible()
  }

  const handlePointerDown = () => setVisible(true)

  document.addEventListener('focus', handleVisibleEvent)
  document.addEventListener('pointerdown', handlePointerDown)
  document.addEventListener('visibilitychange', handleVisibleEvent)
  window.addEventListener('focus', handleVisibleEvent)

  const unlistenFocusChanged = appWindow.onFocusChanged(updateVisibleSoon)
  const unlistenCloseRequested = appWindow.listen(
    TauriEvent.WINDOW_CLOSE_REQUESTED,
    () => {
      setVisible(false)
      updateVisibleSoon()
    },
  )
  void updateVisible()

  return () => {
    active = false
    if (visibilityTimer) {
      window.clearTimeout(visibilityTimer)
      visibilityTimer = null
    }
    document.removeEventListener('focus', handleVisibleEvent)
    document.removeEventListener('pointerdown', handlePointerDown)
    document.removeEventListener('visibilitychange', handleVisibleEvent)
    window.removeEventListener('focus', handleVisibleEvent)
    void unlistenFocusChanged.then((unlisten) => unlisten())
    void unlistenCloseRequested.then((unlisten) => unlisten())
  }
}

const subscribe = (listener: Listener) => {
  listeners.add(listener)
  stop ??= start()
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      stop?.()
      stop = null
    }
  }
}

const getSnapshot = () => visible

/** Current window visibility, for non-React callers such as query polling. */
export const isWindowVisible = () =>
  listeners.size > 0 ? visible : isDocumentVisible()

export const useVisibility = () => useSyncExternalStore(subscribe, getSnapshot)

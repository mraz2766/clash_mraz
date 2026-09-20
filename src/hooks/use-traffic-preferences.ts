import { useSyncExternalStore } from 'react'

import { trafficPreferences } from '@/services/traffic-preferences'

export const useTrafficPreferences = () => ({
  colorMode: useSyncExternalStore(
    trafficPreferences.subscribe,
    trafficPreferences.getSnapshot,
    trafficPreferences.getSnapshot,
  ),
  setColorMode: trafficPreferences.setMode,
})

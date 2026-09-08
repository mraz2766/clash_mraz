import { useTheme } from '@mui/material'
import { useMemo } from 'react'

import { useVerge } from './use-verge'

export const useTrafficColors = () => {
  const { palette } = useTheme()
  const { verge } = useVerge()
  const colorful = verge?.traffic_graph_colorful ?? true
  return useMemo(
    () =>
      colorful
        ? palette.mode === 'dark'
          ? { up: '#8FB9AA', down: '#91AACF' }
          : { up: '#679D8D', down: '#758DC0' }
        : { up: palette.text.secondary, down: palette.text.primary },
    [colorful, palette.mode, palette.text.secondary, palette.text.primary],
  )
}

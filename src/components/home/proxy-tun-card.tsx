import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

import ProxyControlSwitches from '@/components/shared/proxy-control-switches'
import { showNotice } from '@/services/notice-service'

// Both connection controls stay visible; their shared component owns state,
// permissions, optimistic updates and rollback on failure.
export const ProxyTunCard = () => {
  const { t } = useTranslation()
  return (
    <Box className="home-connection-switches">
      <ProxyControlSwitches
        noRightPadding
        onError={(error) => showNotice.error(error)}
      />
      <ProxyControlSwitches
        label={t('settings.sections.system.toggles.tunMode')}
        noRightPadding
        onError={(error) => showNotice.error(error)}
      />
    </Box>
  )
}

import {
  ExpandMoreRounded,
  HistoryEduOutlined,
  SpeedOutlined,
} from '@mui/icons-material'
import { Box, Button, Grid, IconButton, Skeleton, Tooltip } from '@mui/material'
import { AnimatePresence, m } from 'motion/react'
import { Suspense, lazy, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BasePage } from '@/components/base'
import { Reveal } from '@/components/base/reveal'
import { ClashModeCard } from '@/components/home/clash-mode-card'
import { CurrentProxyCard } from '@/components/home/current-proxy-card'
import { EnhancedCard } from '@/components/home/enhanced-card'
import { EnhancedTrafficStats } from '@/components/home/enhanced-traffic-stats'
import {
  DEFAULT_HOME_CARDS,
  type HomeCardsSettings,
} from '@/components/home/home-card-settings'
import { HomeProfileCard } from '@/components/home/home-profile-card'
import { ProxyTunCard } from '@/components/home/proxy-tun-card'
import { useProfiles } from '@/hooks/use-profiles'
import { useVerge } from '@/hooks/use-verge'
import { entry_lightweight_mode } from '@/services/cmds'

const preloadTestCard = () =>
  import('@/components/home/test-card').then((module) => ({
    default: module.TestCard,
  }))
const preloadIpInfoCard = () =>
  import('@/components/home/ip-info-card').then((module) => ({
    default: module.IpInfoCard,
  }))
const preloadClashInfoCard = () =>
  import('@/components/home/clash-info-card').then((module) => ({
    default: module.ClashInfoCard,
  }))
const preloadSystemInfoCard = () =>
  import('@/components/home/system-info-card').then((module) => ({
    default: module.SystemInfoCard,
  }))

const LazyTestCard = lazy(preloadTestCard)
const LazyIpInfoCard = lazy(preloadIpInfoCard)
const LazyClashInfoCard = lazy(preloadClashInfoCard)
const LazySystemInfoCard = lazy(preloadSystemInfoCard)

const HomePage = () => {
  const { t } = useTranslation()
  const { verge } = useVerge()
  const { current, mutateProfiles } = useProfiles()

  // 卡片显示状态
  const homeCards =
    (verge?.home_cards as HomeCardsSettings | undefined) ?? DEFAULT_HOME_CARDS

  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false)
  const hasDiagnostics =
    homeCards.test ||
    homeCards.ip ||
    homeCards.clashinfo ||
    homeCards.systeminfo

  return (
    <BasePage
      title={t('home.page.title')}
      header={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={t('home.page.tooltips.lightweightMode')} arrow>
            <IconButton
              onClick={async () => await entry_lightweight_mode()}
              size="small"
              color="inherit"
            >
              <HistoryEduOutlined />
            </IconButton>
          </Tooltip>
        </Box>
      }
    >
      {(homeCards.network || homeCards.mode) && (
        <Reveal index={0}>
          <Box
            className="workspace-control-deck"
            sx={
              !(homeCards.network && homeCards.mode)
                ? { gridTemplateColumns: '1fr !important' }
                : undefined
            }
          >
            {homeCards.network && (
              <section>
                <h2>{t('home.page.cards.networkSettings')}</h2>
                <ProxyTunCard />
              </section>
            )}
            {homeCards.mode && (
              <section>
                <h2>{t('home.page.cards.proxyMode')}</h2>
                <ClashModeCard />
              </section>
            )}
          </Box>
        </Reveal>
      )}
      {homeCards.traffic && (
        <Reveal index={1}>
          <section className="home-metrics">
            <EnhancedTrafficStats view="summary" />
          </section>
        </Reveal>
      )}
      <Reveal index={2}>
        <Box
          className="workspace-home-workspace"
          sx={
            !(
              homeCards.traffic &&
              (verge?.traffic_graph ?? true) &&
              homeCards.proxy
            )
              ? { gridTemplateColumns: '1fr !important' }
              : undefined
          }
        >
          {homeCards.traffic && (verge?.traffic_graph ?? true) && (
            <section className="home-traffic">
              <EnhancedCard
                title={t('home.page.cards.trafficStats')}
                icon={<SpeedOutlined />}
              >
                <EnhancedTrafficStats view="detail" />
              </EnhancedCard>
            </section>
          )}
          {homeCards.proxy && (
            <section className="home-node">
              <CurrentProxyCard />
            </section>
          )}
        </Box>
      </Reveal>
      {homeCards.profile && (
        <Reveal index={3}>
          <section className="home-subscription">
            <HomeProfileCard
              current={current}
              onProfileUpdated={mutateProfiles}
            />
          </section>
        </Reveal>
      )}
      {hasDiagnostics && (
        <section className="home-diagnostics">
          <Button
            className="diagnostics-toggle"
            fullWidth
            aria-expanded={diagnosticsOpen}
            aria-controls="home-diagnostics-panel"
            onClick={() => setDiagnosticsOpen(!diagnosticsOpen)}
            endIcon={
              <ExpandMoreRounded
                sx={{
                  transform: diagnosticsOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform var(--md-motion)',
                }}
              />
            }
          >
            {t('home.components.tests.title')} ·{' '}
            {t('home.components.ipInfo.title')} ·{' '}
            {t('home.components.systemInfo.title')}
          </Button>
          {/* Height eases open and closed instead of popping. */}
          <AnimatePresence initial={false}>
            {diagnosticsOpen && (
              <m.div
                key="diagnostics"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <Grid
                  id="home-diagnostics-panel"
                  container
                  spacing={2}
                  columns={12}
                  className="workspace-home-grid"
                >
                  {homeCards.test && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Suspense fallback={<Skeleton height={160} />}>
                        <LazyTestCard />
                      </Suspense>
                    </Grid>
                  )}
                  {homeCards.ip && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Suspense fallback={<Skeleton height={160} />}>
                        <LazyIpInfoCard />
                      </Suspense>
                    </Grid>
                  )}
                  {homeCards.clashinfo && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Suspense fallback={<Skeleton height={160} />}>
                        <LazyClashInfoCard />
                      </Suspense>
                    </Grid>
                  )}
                  {homeCards.systeminfo && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Suspense fallback={<Skeleton height={160} />}>
                        <LazySystemInfoCard />
                      </Suspense>
                    </Grid>
                  )}
                </Grid>
              </m.div>
            )}
          </AnimatePresence>
        </section>
      )}
    </BasePage>
  )
}

export default HomePage

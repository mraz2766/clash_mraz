import { lazy } from 'react'

import { pageLoaders } from './_page-loaders'

export const ProxyPage = lazy(pageLoaders.proxies)
export const ProfilePage = lazy(pageLoaders.profiles)
export const ConnectionsPage = lazy(pageLoaders.connections)
export const RulesPage = lazy(pageLoaders.rules)
export const LogsPage = lazy(pageLoaders.logs)
export const UnlockPage = lazy(pageLoaders.unlock)
export const SettingPage = lazy(pageLoaders.settings)

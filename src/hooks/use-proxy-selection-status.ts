import { useSyncExternalStore } from 'react'

type Selection = { groupName: string; proxyName: string } | null
let pending: Selection = null
const listeners = new Set<() => void>()
export const setProxySelectionStatus = (value: Selection) => {
  pending = value
  listeners.forEach((listener) => listener())
}
export const beginProxySelection = (groupName: string, proxyName: string) => {
  const request = { groupName, proxyName }
  setProxySelectionStatus(request)
  return () => {
    if (pending === request) setProxySelectionStatus(null)
  }
}
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
const snapshot = () => pending
export const useProxySelectionStatus = () =>
  useSyncExternalStore(subscribe, snapshot, snapshot)

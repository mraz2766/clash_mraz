import { classifyDelay, DEFAULT_DELAY_TIMEOUT } from '@/utils/delay'

// Presentation only; keep measurement, timeout classification and sorting unchanged.
export function proxyStatusColor(
  delay: number,
  timeout = DEFAULT_DELAY_TIMEOUT,
) {
  const status = classifyDelay(delay, timeout)
  if (status === 'error') return 'var(--md-error)'
  if (status !== 'measured') return 'var(--md-text-muted)'
  if (delay >= 400) return 'var(--md-error)'
  if (delay >= 250) return 'var(--md-warning)'
  return 'var(--md-success)'
}

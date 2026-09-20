export function normalizeHost(input: string): string | null {
  const value = input.trim()
  if (!value) return null
  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`)
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      !url.hostname.includes('.')
    )
      return null
    return url.hostname.toLowerCase().replace(/\.$/, '')
  } catch {
    return null
  }
}
export const matchesHost = (actual: string, host: string) => {
  const value = actual.toLowerCase().replace(/\.$/, '')
  return value === host || value.endsWith(`.${host}`)
}

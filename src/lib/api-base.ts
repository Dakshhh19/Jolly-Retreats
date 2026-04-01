const DEFAULT_API_PORT = '5000'

const isLocalHostname = (hostname: string) => (
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '::1' ||
  hostname === '[::1]'
)

export const getApiBaseUrl = (path = '/api') => {
  const envBase = import.meta.env.VITE_API_BASE_URL
  if (envBase) {
    return `${String(envBase).replace(/\/$/, '')}${path}`
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location
    if (isLocalHostname(hostname)) {
      return `${protocol}//${hostname}:${DEFAULT_API_PORT}${path}`
    }
  }

  return `http://localhost:${DEFAULT_API_PORT}${path}`
}


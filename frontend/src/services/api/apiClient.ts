import axios, { AxiosError, type AxiosInstance } from 'axios'
import { queryClient } from '../../utils/queryClient'

const DEV = import.meta.env.DEV

let accessToken: string | null = null
let refreshToken: string | null = null

export function setAuthTokens(tokens: { access: string; refresh?: string | null }) {
  accessToken = tokens.access
  if (tokens.refresh !== undefined) refreshToken = tokens.refresh
}

export function clearAuthTokens() {
  accessToken = null
  refreshToken = null
}

// Expose current in-memory refresh token for service layer helpers
export function getRefreshToken(): string | null {
  return refreshToken
}

interface TokenRefreshResponse { access: string; refresh?: string }

// Resolve the effective API base URL according to environment:
// 1. If VITE_API_BASE is provided, normalize and append /api/ (unless already ends with /api)
// 2. If missing and in development, return '' so that the Vite dev proxy can handle paths.
//    A request interceptor below will auto-prefix /api/ for relative (non-leading-slash) paths.
// 3. If missing and in production, default to current origin + /api/ ("full backend URL").
const RAW_BASE: string | undefined = (import.meta as any).env?.VITE_API_BASE?.trim()

function resolveApiBase(): string {
  if (RAW_BASE) {
    let b = RAW_BASE.replace(/\/+$/, '')
    if (/\/api$/i.test(b)) return b + '/'
    return b + '/api/'
  }
  if (DEV) {
    return '' // rely on dev proxy; we'll inject /api/ prefix for relative endpoints
  }
  // Production fallback: same-origin backend (adjust if deploying frontend separately)
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '') + '/api/'
  }
  // Conservative fallback (no window): just use /api/
  return '/api/'
}

const apiBaseURL = resolveApiBase()

export const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Accept': 'application/json' }
})

apiClient.interceptors.request.use(cfg => {
  // When using empty base (dev proxy mode) and the caller supplied a relative path
  // without a leading slash, automatically prefix /api/ so existing service code
  // that was written assuming a '/api/' base continues to work.
  if (apiBaseURL === '' && cfg.url) {
    if (cfg.url.startsWith('/')) {
      // Absolute root path: ensure it is routed via /api proxy
      if (!cfg.url.startsWith('/api/')) {
        cfg.url = '/api' + cfg.url
      }
    } else {
      // Relative path: prefix /api/
      cfg.url = '/api/' + cfg.url.replace(/^\/+/, '')
    }
  }
  if (accessToken) {
    cfg.headers = cfg.headers || {}
    cfg.headers['Authorization'] = `Bearer ${accessToken}`
  }
  return cfg
})

let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

function enqueueRefresh(cb: (token: string | null) => void) {
  refreshQueue.push(cb)
}
function resolveQueue(newToken: string | null) {
  refreshQueue.forEach(cb => cb(newToken))
  refreshQueue = []
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshToken) return null
  try {
    // Use apiClient so request interceptor can adapt path in dev proxy mode
    const { data } = await apiClient.post<TokenRefreshResponse>('auth/refresh/', { refresh: refreshToken })
    setAuthTokens({ access: data.access, refresh: data.refresh })
    // If user originally opted for persistence (presence of auth_refresh), update stored tokens after rotation
    try {
      if (localStorage.getItem('auth_refresh')) {
        localStorage.setItem('auth_access', data.access)
        if (data.refresh) localStorage.setItem('auth_refresh', data.refresh)
      }
    } catch { /* ignore storage errors */ }
    return data.access
  } catch (e) {
    clearAuthTokens()
    return null
  }
}

apiClient.interceptors.response.use(r => {
  if (DEV) {
    // Lightweight success logging (can be silenced per domain later)
    console.debug('[API]', r.status, r.config.method?.toUpperCase(), r.config.url)
  }
  return r
}, async (error: AxiosError) => {
  if (DEV) {
    console.warn('[API ERROR]', error.response?.status, error.config?.url, error.message)
  }
  const original = error.config as any
  if (error.response?.status === 401 && !original?._retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        enqueueRefresh(token => {
          if (!token) return reject(error)
          original.headers['Authorization'] = `Bearer ${token}`
          resolve(apiClient(original))
        })
      })
    }
    original._retry = true
    isRefreshing = true
    const newToken = await refreshAccessToken()
    isRefreshing = false
    resolveQueue(newToken)
    if (!newToken) return Promise.reject(error)
    original.headers = original.headers || {}
    original.headers['Authorization'] = `Bearer ${newToken}`
    return apiClient(original)
  }
  // Non-auth error propagation
  return Promise.reject(error)
})

// Global development request logger
if (DEV) {
  apiClient.interceptors.request.use(cfg => {
    console.debug('[API REQ]', cfg.method?.toUpperCase(), cfg.url, cfg.params || '', cfg.data || '')
    return cfg
  })
}

// Global error translation helper
export function extractErrorMessage(err: any): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as any)?.message || err.message || 'Request failed'
  }
  return err?.message || 'Unknown error'
}

// Provide a helper to invalidate typical entity keys centrally
export const invalidateEntities = (entities: string[]) => {
  entities.forEach(key => queryClient.invalidateQueries({ queryKey: [key] }))
}

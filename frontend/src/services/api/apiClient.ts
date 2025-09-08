import axios, { AxiosError, type AxiosInstance } from 'axios'
import { queryClient } from '../../utils/queryClient'

const DEV = import.meta.env.DEV

// Basic token storage abstraction (can later be swapped for more secure storage)
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

interface TokenRefreshResponse { access: string; refresh?: string }

// Determine base URL: allow environment override (e.g., VITE_API_BASE) while ensuring trailing /api/
const RAW_BASE = (import.meta as any).env?.VITE_API_BASE || ''
function ensureApiBase(base: string) {
  if (!base) return '/api/'
  // strip trailing slashes then append / if missing
  let b = base.replace(/\/+$/, '')
  // if base already ends with /api or /api/, keep single /api/
  if (/\/api$/i.test(b)) return b + '/'
  return b + '/api/'
}
const apiBaseURL = ensureApiBase(RAW_BASE)

export const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Accept': 'application/json' }
})

apiClient.interceptors.request.use(cfg => {
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
  const { data } = await axios.post<TokenRefreshResponse>(`${apiBaseURL}auth/refresh/`, { refresh: refreshToken })
    setAuthTokens({ access: data.access, refresh: data.refresh })
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

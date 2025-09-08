import { extractErrorMessage } from '../services/api/apiClient'

export function safe<T>(p: Promise<T>): Promise<[T | null, string | null]> {
  return p
    .then((d): [T, null] => [d, null])
    .catch((e): [null, string] => [null, extractErrorMessage(e)])
}

export function buildQuery(params: Record<string, any>) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k,v]) => {
    if (v === undefined || v === null || v === '') return
    q.append(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

// Simple reusable validators (can be composed in forms)

export type Validator = (value: any) => string | null

export const required = (label = 'Field'): Validator => v => (v === undefined || v === null || v === '' ? `${label} is required` : null)
export const minLength = (n: number, label = 'Field'): Validator => v => (v && v.length < n ? `${label} must be at least ${n} characters` : null)
export const maxLength = (n: number, label = 'Field'): Validator => v => (v && v.length > n ? `${label} must be at most ${n} characters` : null)
export const isEmail: Validator = v => (v && !/.+@.+\..+/.test(v) ? 'Invalid email' : null)
export const isPositiveNumber: Validator = v => (v != null && Number(v) <= 0 ? 'Must be positive' : null)

export function validate(value: any, validators: Validator[]): string | null {
  for (const v of validators) {
    const r = v(value)
    if (r) return r
  }
  return null
}

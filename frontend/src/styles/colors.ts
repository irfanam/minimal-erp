// Design system color tokens inspired by ERPNext modern UI
// NOTE: These are approximations; adjust with actual brand hex values as needed.
export const colors = {
  primary: {
    50: '#eef7ff',
    100: '#d9eeff',
    200: '#b3ddff',
    300: '#85c8ff',
    400: '#4faeff',
    500: '#2490ef',
    600: '#0d74d1',
    700: '#085da7',
    800: '#084c86',
    900: '#0b3f6d',
  },
  neutral: {
    25: '#fcfcfd',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  sidebar: {
    background: '#0f172a',
    activeBg: '#1e293b',
    activeText: '#ffffff',
    text: '#cbd5e1',
    border: '#1e293b',
  },
  surface: {
    canvas: '#f8fafc',
    sunken: '#f1f5f9',
    raised: '#ffffff',
    border: '#e2e8f0',
  },
  status: {
    successBg: '#16a34a',
    successFg: '#ffffff',
    warningBg: '#d97706',
    warningFg: '#ffffff',
    dangerBg: '#dc2626',
    dangerFg: '#ffffff',
    infoBg: '#0d74d1',
    infoFg: '#ffffff',
  },
  overlay: 'rgba(15,23,42,0.55)',
  focus: 'rgba(36,144,239,0.35)',
  gradients: {
    primary: 'linear-gradient(90deg,#2490ef,#4faeff)',
  },
}
export type ColorToken = typeof colors

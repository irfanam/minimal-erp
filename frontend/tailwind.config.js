/**
 * Tailwind configuration that derives design tokens from the central TS token modules
 * to avoid duplication. Because this file runs in Node (ESM) and the tokens are TS,
 * we import the compiled JS via dynamic import with synchronous top-level await.
 */
import forms from '@tailwindcss/forms'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Helper to load a TS module (relies on ts-node transpile when dev or the TS loader Vite provides).
// Fallback: if direct import fails (e.g., during CI without ts-node), we silently continue with empty objects.
function loadTokensSync() {
  const base = path.resolve(__dirname, 'src/styles')
  const req = createRequire(import.meta.url)
  const nullReturn = { colors: {}, spacing: {}, typography: {} }
  try {
    // Try loading the transpiled JS (if ts-node/register or ts-node auto is present). If not, this will fail gracefully.
    const colors = req(path.join(base, 'colors.ts'))?.colors || nullReturn.colors
    const spacing = req(path.join(base, 'spacing.ts'))?.spacing || nullReturn.spacing
    const typography = req(path.join(base, 'typography.ts')) || nullReturn.typography
    return { colors, spacing, typography }
  } catch (e1) {
    try {
      // Fallback: attempt .js (in case a pre-build step transpiled them)
      const colors = req(path.join(base, 'colors.js'))?.colors || nullReturn.colors
      const spacing = req(path.join(base, 'spacing.js'))?.spacing || nullReturn.spacing
      const typography = req(path.join(base, 'typography.js')) || nullReturn.typography
      return { colors, spacing, typography }
    } catch (e2) {
      console.warn('[tailwind-config] Token sync import failed, using inline defaults.')
      return nullReturn
    }
  }
}

const { colors: dsColors, spacing: dsSpacing, typography: dsType } = loadTokensSync()

// Map typography tokens to Tailwind theme extensions
const fontFamily = dsType?.fontFamilies ? {
  sans: dsType.fontFamilies.sans.split(',').map(s => s.trim()),
  mono: dsType.fontFamilies.mono.split(',').map(s => s.trim()),
} : {
  sans: ['Inter','system-ui','Avenir','Helvetica','Arial','sans-serif'],
  mono: ['ui-monospace','SFMono-Regular','Menlo','monospace'],
}

// Extract core semantic color groups expected by utilities (primary, neutral, plus status sets)
const primary = dsColors?.primary && Object.keys(dsColors.primary).length ? dsColors.primary : {
  50: '#eef7ff',100:'#d9eeff',200:'#b3ddff',300:'#85c8ff',400:'#4faeff',500:'#2490ef',600:'#0d74d1',700:'#085da7',800:'#084c86',900:'#0b3f6d'
}
const neutral = dsColors?.neutral && Object.keys(dsColors.neutral).length ? dsColors.neutral : {
  25:'#fcfcfd',50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1',400:'#94a3b8',500:'#64748b',600:'#475569',700:'#334155',800:'#1e293b',900:'#0f172a'
}

// Provide lightweight status colors from status tokens if available
const success = dsColors?.status ? { 500: dsColors.status.successBg } : { 500: '#16a34a' }
const warning = dsColors?.status ? { 500: dsColors.status.warningBg } : { 500: '#d97706' }
const danger = dsColors?.status ? { 500: dsColors.status.dangerBg } : { 500: '#dc2626' }

// Spacing scale merging Tailwind defaults (via extend) with design tokens.
// Tailwind core spacing is preserved; we just add custom keys not present by default.
const customSpacing = {}
if (dsSpacing) {
  for (const [k,v] of Object.entries(dsSpacing)) {
    // Skip default Tailwind numeric keys to avoid overriding (Tailwind handles these internally)
    if (['0','0.5','1','1.5','2','2.5','3','3.5','4','5','6','7','8','9','10','11','12','14','16','20','24','28','32','36','40','48','56','64','72','80','96'].includes(String(k))) continue
    customSpacing[k] = v
  }
}

// ERPNext-inspired design system configuration (dynamic)
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.25rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
      },
    },
    screens: {
      xs: '480px',
      sm: '640px',
      md: '820px', // wider mid breakpoint for business tables
      lg: '1100px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1800px', // ultra-wide dashboards
    },
    extend: {
      colors: { primary, neutral, success, warning, danger },
      fontFamily,
      boxShadow: {
        card: '0 1px 2px 0 rgba(0,0,0,0.05), 0 1px 3px 1px rgba(0,0,0,0.05)',
        focus: '0 0 0 3px ' + (dsColors?.focus || 'rgba(36,144,239,0.35)'),
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
      },
      spacing: {
        ...customSpacing,
        120: '30rem',
      },
      transitionTimingFunction: {
        'in-out-soft': 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      },
    },
  },
  plugins: [forms],
}


// Typography scale inspired by ERPNext modern UI
export const fontFamilies = {
  sans: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
}

export const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
}

export const lineHeights = {
  tight: 1.2,
  snug: 1.3,
  normal: 1.45,
  relaxed: 1.6,
}

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}

export const headings = {
  h1: { fontSize: fontSizes['3xl'], fontWeight: fontWeights.semibold, lineHeight: lineHeights.snug, letterSpacing: '-0.025em' },
  h2: { fontSize: fontSizes['2xl'], fontWeight: fontWeights.semibold, lineHeight: lineHeights.snug, letterSpacing: '-0.025em' },
  h3: { fontSize: fontSizes.xl, fontWeight: fontWeights.semibold, lineHeight: lineHeights.normal },
  h4: { fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, lineHeight: lineHeights.normal },
  h5: { fontSize: fontSizes.base, fontWeight: fontWeights.semibold, lineHeight: lineHeights.normal },
  h6: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, lineHeight: lineHeights.normal, textTransform: 'uppercase' },
}

export const textStyles = {
  body: { fontSize: fontSizes.base, lineHeight: lineHeights.relaxed },
  bodySm: { fontSize: fontSizes.sm, lineHeight: lineHeights.normal },
  bodyXs: { fontSize: fontSizes.xs, lineHeight: lineHeights.normal },
  caption: { fontSize: fontSizes.xs, lineHeight: lineHeights.normal, fontWeight: fontWeights.medium },
  code: { fontFamily: fontFamilies.mono, fontSize: fontSizes.sm, lineHeight: lineHeights.normal },
}

export type TypographyScale = {
  fontFamilies: typeof fontFamilies,
  fontSizes: typeof fontSizes,
  lineHeights: typeof lineHeights,
  fontWeights: typeof fontWeights,
  headings: typeof headings,
  textStyles: typeof textStyles,
}

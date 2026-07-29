// Tokens sampled directly from the reference design.
// Mirrored in tailwind.config.js for className use; this file is for props
// that don't take a className (SVG fills, gradient stops, icon colors…).
export const colors = {
  // Surfaces
  white: '#FFFFFF',
  card: '#F4F5F9', // shipment card background
  chip: '#F4F5F6', // quick-action circle background
  bell: '#F3F5F8', // notification button background
  line: '#EAECEF',

  // Text
  ink: '#0E1216', // headings, codes, dates
  muted: '#61666C', // "Delivery date", "See all", location
  mutedSoft: '#8A9098',

  // Featured (dark) card
  dark: '#131C21',
  darkGlow: '#1B3A2E',
  darkMuted: 'rgba(255,255,255,0.48)',
  darkTrack: 'rgba(255,255,255,0.10)',

  // Accents
  brand: '#4FB962', // in-transit ship knob (green) + delivered pill
  brandPill: '#5DC96C',
  brandTrack: '#4EBE68',
  amber: '#F5B54F', // in-transit pill
  amberTrack: '#F2AE3F',
  alert: '#F4562D', // notification dot

  // Chips / segmented controls
  chipActive: '#1F293B',

  // Promo + banner accents
  orange: '#ED6847',
  mint: '#EFFDF4', // pale green badge / selected tile fill

  // Tab bar
  tabActive: '#1F2A39',
  tabInactive: '#9AA0A6',
  tabAccent: '#3CB566',

  // Legacy splash tokens
  splash: '#151C26',
  wordmark: '#5BC47F',
  brandDark: '#1B8049',
} as const;

/** Screen gutter — the design keeps 16pt on both sides. */
export const GUTTER = 16;

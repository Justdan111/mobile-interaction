/**
 * The palette, in TS form, for the places NativeWind classes can't reach:
 * SVG fills and strokes, LinearGradient stops, status bar, navigation
 * background. Values are sampled from the comps in
 * `.screenshots/2026-08-07-racket-shop/`. Keep in sync with tailwind.config.js.
 */
export const colors = {
  ground: '#F1F1F1',
  surface: '#FFFFFF',
  inset: '#EAEAEA',

  // The banner and the drawer are the same teal, falling off toward `tealDeep`
  // down the panel — flat teal reads noticeably deader than the comps.
  teal: '#2B5561',
  tealDeep: '#1E3D45',
  tealTint: '#E8EFF1',

  ember: '#E8442C',
  ink: '#1A1A1A',
  muted: '#A0A0A0',
  dot: '#D4D4D4',
  star: '#F5C518',

  /** Inactive drawer rows. White at reduced opacity, not a mixed grey. */
  drawerIdle: 'rgba(255, 255, 255, 0.55)',
} as const;

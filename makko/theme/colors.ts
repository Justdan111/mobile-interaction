/** Hex mirror of the CSS variables in global.css, for SVG, icons and animated styles. */
export const C = {
  page: '#FFFFFF',
  card: '#F5F5F5',
  line: '#ECECEC',
  ink: '#1C1C1C',
  muted: '#8E8E8E',
  faint: '#C4C4C4',
  brand: '#E36135',
  blue: '#3872F4',
  mist: '#E4ECFD',
  peach: '#F7DACE',
  black: '#000000',
  white: '#FFFFFF',
} as const;

/** Pastel grounds behind topic art, in the order the topic list uses them. */
export const TINTS = {
  mint: '#DFF7DA',
  lilac: '#DCD5FB',
  sky: '#D7EDFC',
  blush: '#F8DCE7',
  butter: '#FDF3D0',
  periwinkle: '#DCE3F8',
  rose: '#F9DEE5',
} as const;

export type Tint = keyof typeof TINTS;

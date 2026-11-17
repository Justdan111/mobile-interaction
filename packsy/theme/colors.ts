/**
 * The palette as hex, for places a className cannot reach: SVG fills,
 * Reanimated styles, icon props. Mirrors the CSS variables in global.css —
 * change both together. Every value was sampled from `.design/comps/`.
 */
export const C = {
  page: '#1C1C1C',
  card: '#2B2B2B',
  raised: '#3A3A3A',
  bar: '#111111',
  ink: '#FFFFFF',
  muted: '#7A7A7A',
  faint: '#5C5C5C',
  pill: '#D0D0D0',
  sun: '#F2CF73',
  iris: '#8082F7',
  coral: '#E56E5C',
  go: '#5EB869',
  /** The Received pill: the green deepened so dark text still reads on it. */
  goDeep: '#50965C',
  /** Near-black used for glyphs and text drawn on light surfaces. */
  night: '#111111',
  /** The un-travelled half of a route track. */
  track: '#474747',
  node: '#757575',
  /** Hairline round the outlined header buttons. */
  ring: '#4A4A4A',
} as const;

export type Tone = 'sun' | 'iris' | 'coral';

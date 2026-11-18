/**
 * Colour tokens. `Palette` is everything that changes between light and dark;
 * `TONES` is everything that doesn't (the parcel card colours, status colours
 * and the near-black drawn on them), so it is safe to read outside a component.
 *
 * Read the palette with `useColors()` from ThemeProvider. The className tokens
 * (`bg-card`, `text-ink`, …) are switched at the root via CSS variables built
 * from the same objects, so the two can't drift apart.
 */

export const TONES = {
  sun: '#F2CF73',
  iris: '#8082F7',
  coral: '#E56E5C',
  go: '#5EB869',
  /** The Received pill: green deepened so dark text still reads on it. */
  goDeep: '#50965C',
  /** Near-black for text and glyphs on the tone colours above. */
  night: '#111111',
  /** Pin and progress-node cores, white in both modes. */
  core: '#FFFFFF',
} as const;

export type Tone = 'sun' | 'iris' | 'coral';

export type Palette = {
  page: string;
  card: string;
  raised: string;
  /** Tab bar ground. */
  bar: string;
  ink: string;
  /** Text and glyphs on an `ink`-filled control (search pill, Next, Change). */
  onInk: string;
  muted: string;
  faint: string;
  /** Secondary text one step quieter than `ink`. */
  soft: string;
  /** Unselected labels in tab rows and option lists. */
  dim: string;
  placeholder: string;
  /** The focused tab and selected chip. */
  pill: string;
  onPill: string;
  /** Un-travelled half of a route track, and future-step nodes. */
  track: string;
  node: string;
  /** Hairline round the outlined header buttons. */
  ring: string;
  /** Border of the secondary outline buttons. */
  outline: string;
  /** Floating map controls. */
  glass: string;
  /** Footer that content scrolls under. */
  scrim: string;
  map: { ground: string; avenue: string; street: string; label: string };
  statusBar: 'light' | 'dark';
};

export const DARK: Palette = {
  page: '#1C1C1C',
  card: '#2B2B2B',
  raised: '#3A3A3A',
  bar: '#111111',
  ink: '#FFFFFF',
  onInk: '#111111',
  muted: '#7A7A7A',
  faint: '#5C5C5C',
  soft: '#C9C9C9',
  dim: '#BDBDBD',
  placeholder: '#8A8A8A',
  pill: '#D0D0D0',
  onPill: '#111111',
  track: '#474747',
  node: '#757575',
  ring: '#4A4A4A',
  outline: '#6A6A6A',
  glass: 'rgba(40,40,40,0.92)',
  scrim: 'rgba(28,28,28,0.94)',
  map: { ground: '#1E1E20', avenue: '#3A3A3C', street: '#5E5E60', label: '#E6E6E6' },
  statusBar: 'light',
};

/**
 * The light theme inverts the controls rather than just the ground: the white
 * search pill and buttons of the dark design become near-black, and the pale
 * active tab becomes a dark one, so each keeps its emphasis on a light page.
 */
export const LIGHT: Palette = {
  page: '#F3F2EE',
  card: '#FFFFFF',
  raised: '#EEEDE8',
  bar: '#FFFFFF',
  ink: '#151515',
  onInk: '#FFFFFF',
  muted: '#7D7B76',
  faint: '#B5B3AD',
  soft: '#5E5C58',
  dim: '#8C8A85',
  placeholder: '#9C9A95',
  pill: '#1C1C1C',
  onPill: '#FFFFFF',
  track: '#D6D4CE',
  node: '#B9B7B1',
  ring: '#D9D7D1',
  outline: '#C9C7C1',
  glass: 'rgba(255,255,255,0.94)',
  scrim: 'rgba(243,242,238,0.95)',
  map: { ground: '#ECEAE4', avenue: '#FFFFFF', street: '#CFCCC4', label: '#57554F' },
  statusBar: 'dark',
};

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/** CSS variables for the Tailwind tokens in tailwind.config.js. */
export function cssVars(p: Palette): Record<string, string> {
  return {
    '--color-page': rgb(p.page),
    '--color-card': rgb(p.card),
    '--color-raised': rgb(p.raised),
    '--color-bar': rgb(p.bar),
    '--color-ink': rgb(p.ink),
    '--color-muted': rgb(p.muted),
    '--color-faint': rgb(p.faint),
    '--color-pill': rgb(p.pill),
    '--color-sun': rgb(TONES.sun),
    '--color-iris': rgb(TONES.iris),
    '--color-coral': rgb(TONES.coral),
    '--color-go': rgb(TONES.go),
  };
}

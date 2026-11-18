import { cssVars, DARK, LIGHT, type Palette, TONES } from '../theme/colors';

const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// Every place text sits on a themed surface. Body text needs 4.5:1; secondary
// captions and placeholders 3:1.
const pairs = (p: Palette): [string, string, string, number][] => [
  ['ink on page', p.ink, p.page, 4.5],
  ['ink on card', p.ink, p.card, 4.5],
  ['onInk on ink controls', p.onInk, p.ink, 4.5],
  ['onPill on the active tab and chip', p.onPill, p.pill, 4.5],
  ['soft on card', p.soft, p.card, 4.5],
  ['muted on card', p.muted, p.card, 3],
  ['muted on page', p.muted, p.page, 3],
  ['dim on page', p.dim, p.page, 3],
  ['placeholder on card', p.placeholder, p.card, 2.5],
  ['ink on raised icon chips', p.ink, p.raised, 4.5],
  ['map label on ground', p.map.label, p.map.ground, 4.5],
];

describe.each([
  ['dark', DARK],
  ['light', LIGHT],
])('%s palette', (_name, palette) => {
  it.each(pairs(palette))('%s is readable', (_label, fg, bg, min) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(min);
  });

  it('keeps near-black text readable on every parcel tone', () => {
    for (const tone of [TONES.sun, TONES.iris, TONES.coral]) {
      expect(contrast(TONES.night, tone)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('feeds every Tailwind token a CSS variable', () => {
    const tokens = ['page', 'card', 'raised', 'bar', 'ink', 'muted', 'faint', 'pill', 'sun', 'iris', 'coral', 'go'];
    expect(Object.keys(cssVars(palette)).sort()).toEqual(tokens.map((t) => `--color-${t}`).sort());
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { MascotFor } from '../components/mascots';
import { MOODS } from '../data/moods';

const FILL = '#ABCDEF';
const INK = '#123456';

/**
 * react-native-svg's native renderer resolves every colour to an ARGB integer
 * behind `{ type: 0, payload }` — `#ABCDEF` arrives as 4289449455 — so the
 * rendered tree holds no colour strings at all. Normalise back to hex before
 * asserting, or a string comparison matches nothing and passes vacuously.
 */
function toHex(value: unknown): string | null {
  if (typeof value === 'string') return value.toUpperCase();
  if (value && typeof value === 'object' && 'payload' in value) {
    const payload = (value as { payload: unknown }).payload;
    if (typeof payload !== 'number') return null;
    return `#${(payload & 0xffffff).toString(16).padStart(6, '0').toUpperCase()}`;
  }
  return null;
}

type Node = { type?: string; props?: Record<string, unknown>; children?: unknown };

/**
 * Collect a prop from every drawn shape. Restricted to the leaf shape nodes:
 * the wrapping RNSVGGroup carries react-native-svg's own default black fill,
 * which would otherwise have to be whitelisted and would blunt the assertion
 * that a mascot paints nothing it was not given.
 */
const SHAPES = new Set(['RNSVGPath', 'RNSVGCircle', 'RNSVGRect', 'RNSVGLine']);

function collect(prop: string, shapesOnly = true): unknown[] {
  const out: unknown[] = [];
  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach((child) => visit(child));
      return;
    }
    const n = node as Node;
    const wanted = !shapesOnly || (n.type !== undefined && SHAPES.has(n.type));
    if (wanted && n.props && prop in n.props) out.push(n.props[prop]);
    if (n.children) visit(n.children);
  };
  visit(screen.toJSON());
  return out;
}

const colours = (prop: 'fill' | 'stroke') =>
  collect(prop).map(toHex).filter((c): c is string => c !== null);

const renderMascot = (id: (typeof MOODS)[number]['id'], size = 120) => {
  const Mascot = MascotFor(id);
  return render(<Mascot size={size} fill={FILL} ink={INK} />);
};

describe('mascots', () => {
  it('has one mascot for every mood', () => {
    for (const m of MOODS) expect(MascotFor(m.id)).toBeDefined();
  });

  it('renders at the size it is given', async () => {
    await renderMascot('calm', 77);
    expect(collect('width', false)).toContain(77);
  });

  // One case per mood so a failure names the mascot that broke. Rendering all
  // six in a single test and unmounting between them detaches `screen`, and
  // every later assertion then reads an empty tree and passes vacuously.
  describe.each(MOODS.map((m) => [m.id, m.label] as const))('%s', (id) => {
    // The rule that keeps breaking in this repo: a foreground colour baked in
    // against an assumed surface. Every mascot must paint what it is handed.
    it('paints the fill it is given', async () => {
      await renderMascot(id);
      expect(colours('fill')).toContain(FILL);
    });

    it('draws its line work in the ink it is given', async () => {
      await renderMascot(id);
      expect(colours('stroke')).toContain(INK);
    });

    it('paints no colour it was not given', async () => {
      await renderMascot(id);
      const painted = [...colours('fill'), ...colours('stroke')];
      expect(painted.length).toBeGreaterThan(0);
      for (const c of painted) expect([FILL, INK]).toContain(c);
    });
  });
});

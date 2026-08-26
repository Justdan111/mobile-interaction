import React from 'react';
import { render } from '@testing-library/react-native';
import { OrbitingHalftone, ORBIT_DURATION_MS } from '../../components/halftone/OrbitingHalftone';
import { Halftone } from '../../components/halftone/Halftone';
import { ThemeProvider } from '../../lib/theme';

/**
 * Reanimated is mocked here, so the rotation itself is not observable — it is
 * verified on device by diffing two captures taken seconds apart. What is
 * testable is that wrapping the field in a rotation did not change the field:
 * the whole point is that the same seed still draws the same dots.
 */

// Collects every circle's centre from a rendered tree — i.e. the dot field.
function dotPositions(node: any, out: string[] = []): string[] {
  if (node == null) return out;
  if (Array.isArray(node)) {
    node.forEach((n) => dotPositions(n, out));
    return out;
  }
  if (node.type === 'RNSVGCircle') {
    out.push(`${node.props?.cx},${node.props?.cy},${node.props?.r}`);
  }
  (node.children ?? []).forEach((c: any) => dotPositions(c, out));
  return out;
}

const ART = { variant: 'sphere' as const, size: 200, seed: 'onboard-1', density: 30, dotColor: '#6C63E8' };

describe('OrbitingHalftone', () => {
  it('draws exactly the field the plain Halftone would', async () => {
    const orbiting = await render(<ThemeProvider><OrbitingHalftone {...ART} /></ThemeProvider>);
    const plain = await render(<ThemeProvider><Halftone {...ART} /></ThemeProvider>);

    const a = dotPositions(orbiting.toJSON());
    expect(a.length).toBeGreaterThan(0);
    expect(a).toEqual(dotPositions(plain.toJSON()));
  });

  it('still draws the same field on a re-render, so the art does not churn', async () => {
    const a = dotPositions((await render(<ThemeProvider><OrbitingHalftone {...ART} /></ThemeProvider>)).toJSON());
    const b = dotPositions((await render(<ThemeProvider><OrbitingHalftone {...ART} /></ThemeProvider>)).toJSON());
    expect(a).toEqual(b);
  });

  it('keeps different seeds drawing different fields', async () => {
    const a = dotPositions((await render(<ThemeProvider><OrbitingHalftone {...ART} /></ThemeProvider>)).toJSON());
    const b = dotPositions(
      (await render(<ThemeProvider><OrbitingHalftone {...ART} seed="onboard-2" /></ThemeProvider>)).toJSON()
    );
    expect(a).not.toEqual(b);
  });

  // A turn fast enough to notice reads as a spinner, not as orbiting art.
  it('turns slowly enough to read as drift', () => {
    expect(ORBIT_DURATION_MS).toBeGreaterThanOrEqual(12000);
  });
});

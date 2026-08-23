import { generateDots, FIELD_NAMES } from '../../components/halftone/fields';

const opts = { size: 300, density: 40, seed: 'test' };

describe('generateDots', () => {
  it('is deterministic for the same seed', () => {
    expect(generateDots('sphere', opts)).toEqual(generateDots('sphere', opts));
  });

  it('changes with the seed', () => {
    const a = generateDots('sphere', { ...opts, seed: 'a' });
    const b = generateDots('sphere', { ...opts, seed: 'b' });
    expect(a).not.toEqual(b);
  });

  it('produces visibly different art per variant', () => {
    const results = FIELD_NAMES.map((n) => JSON.stringify(generateDots(n, opts)));
    expect(new Set(results).size).toBe(FIELD_NAMES.length);
  });

  it('keeps every dot inside the canvas', () => {
    for (const name of FIELD_NAMES) {
      for (const d of generateDots(name, opts)) {
        expect(d.x).toBeGreaterThanOrEqual(0);
        expect(d.x).toBeLessThanOrEqual(opts.size);
        expect(d.y).toBeGreaterThanOrEqual(0);
        expect(d.y).toBeLessThanOrEqual(opts.size);
      }
    }
  });

  it('clamps radius to (0, maxRadius]', () => {
    const maxRadius = 4;
    for (const name of FIELD_NAMES) {
      for (const d of generateDots(name, { ...opts, maxRadius })) {
        expect(d.r).toBeGreaterThan(0);
        expect(d.r).toBeLessThanOrEqual(maxRadius);
      }
    }
  });

  it('drops sub-visible dots rather than emitting them', () => {
    const dots = generateDots('sphere', opts);
    expect(dots.length).toBeLessThan(opts.density * opts.density);
    expect(dots.length).toBeGreaterThan(100);
  });

  it('scales dot count with density', () => {
    const sparse = generateDots('sphere', { ...opts, density: 20 });
    const dense = generateDots('sphere', { ...opts, density: 60 });
    expect(dense.length).toBeGreaterThan(sparse.length);
  });
});

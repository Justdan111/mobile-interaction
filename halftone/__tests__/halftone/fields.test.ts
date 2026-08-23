import { generateDots, FIELD_NAMES, intensity, clamp } from '../../components/halftone/fields';

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

  it('field intensity functions are distinct across variant pairs', () => {
    // Sample each field intensity over a normalized [-1, 1] grid to measure
    // pure intensity differences, isolated from grain noise. Grain is per-variant
    // (seeded on field name), which masks intensity differences at the dot level.
    const gridSize = 40;
    const getIntensityArray = (name: typeof FIELD_NAMES[number]): number[] => {
      const values: number[] = [];
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const nx = (col / gridSize) * 2 - 1;
          const ny = (row / gridSize) * 2 - 1;
          values.push(intensity(name, nx, ny));
        }
      }
      return values;
    };

    const meanAbsoluteDifference = (a: number[], b: number[]): number => {
      let sum = 0;
      for (let i = 0; i < a.length; i++) {
        sum += Math.abs(a[i] - b[i]);
      }
      return sum / a.length;
    };

    const arrays = FIELD_NAMES.map(getIntensityArray);
    // Threshold is set well below the observed minimum pair difference (blob vs orbit: 0.1751)
    // to guard against future intensity function regressions.
    const threshold = 0.10;

    // All six variant pairs must have mean absolute difference > threshold
    for (let i = 0; i < FIELD_NAMES.length; i++) {
      for (let j = i + 1; j < FIELD_NAMES.length; j++) {
        const diff = meanAbsoluteDifference(arrays[i], arrays[j]);
        expect(diff).toBeGreaterThan(threshold);
      }
    }
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

  it('clamp guards radius lower and upper bounds', () => {
    // Test the exported clamp guard used in radius calculation.
    // This ensures negative values (from future field regressions) clamp to 0.
    const testCases = [
      { input: -1, lo: 0, hi: 4, expected: 0 },
      { input: 0, lo: 0, hi: 4, expected: 0 },
      { input: 0.5, lo: 0, hi: 4, expected: 0.5 },
      { input: 4, lo: 0, hi: 4, expected: 4 },
      { input: 5, lo: 0, hi: 4, expected: 4 },
    ];
    for (const tc of testCases) {
      const result = clamp(tc.input, tc.lo, tc.hi);
      expect(result).toBe(tc.expected);
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

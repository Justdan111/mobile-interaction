import { hashSeed, makeRandom } from '../../lib/seed';

describe('hashSeed', () => {
  it('is stable for the same input', () => {
    expect(hashSeed('sphere')).toBe(hashSeed('sphere'));
  });

  it('differs for different inputs', () => {
    expect(hashSeed('sphere')).not.toBe(hashSeed('wave'));
  });

  it('returns a non-negative integer', () => {
    const h = hashSeed('alice');
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
  });
});

describe('makeRandom', () => {
  it('produces the same sequence for the same seed', () => {
    const a = makeRandom(42);
    const b = makeRandom(42);
    const seqA = [a(), a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('produces a different sequence for a different seed', () => {
    const a = makeRandom(1);
    const b = makeRandom(2);
    expect([a(), a(), a()]).not.toEqual([b(), b(), b()]);
  });

  it('stays within [0, 1)', () => {
    const r = makeRandom(7);
    for (let i = 0; i < 500; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

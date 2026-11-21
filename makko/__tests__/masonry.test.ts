import { masonry } from '../lib/masonry';

describe('masonry', () => {
  it('fills the shorter column, ties going left', () => {
    const { placed, height } = masonry([100, 50, 30, 80, 20], (h) => h, 10);
    // Right column stays shorter (60, then 100) until the 80 lands in it.
    expect(placed.map((p) => p.column)).toEqual([0, 1, 1, 1, 0]);
    expect(placed.map((p) => p.top)).toEqual([0, 0, 60, 100, 110]);
    expect(height).toBe(180);
  });

  it('is empty for no items', () => {
    expect(masonry([], () => 1, 10)).toEqual({ placed: [], height: 0 });
  });
});

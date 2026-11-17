import { PATTERN_TABLE, START_B, STOP, symbols, widths } from '../lib/code128';

const modules = (text: string) => widths(text).map((w, i) => (i % 2 === 0 ? '1' : '0').repeat(w)).join('');

describe('code128', () => {
  it('has 107 patterns that each span 11 modules (13 for stop)', () => {
    expect(PATTERN_TABLE).toHaveLength(107);
    PATTERN_TABLE.forEach((p, i) => {
      const sum = [...p].reduce((a, c) => a + Number(c), 0);
      expect(sum).toBe(i === STOP ? 13 : 11);
    });
  });

  it('frames the message with start B, a checksum and stop', () => {
    const s = symbols('F523HI487');
    expect(s[0]).toBe(START_B);
    expect(s[s.length - 1]).toBe(STOP);
    expect(s).toHaveLength('F523HI487'.length + 3);
  });

  // Reference produced by python-barcode for the same input. A decorative
  // stripe pattern would pass every other test here and still scan as nothing.
  it('matches an independent encoder bar for bar', () => {
    expect(modules('F523HI487')).toBe('11010010000100011000101101110010011001110010110010111001100010100011000100010110010011101110100110011101101110101001100001100011101011');
  });

  it('rejects characters outside subset B', () => {
    expect(() => symbols('é')).toThrow();
  });
});

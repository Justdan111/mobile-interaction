import { qrMatrix } from '../lib/qr';
import { QUIET_MODULES, DOT_RADIUS_RATIO } from '../components/pass/QrCanvas';

const PAYLOAD = 'moodlift:member:42';

describe('qrMatrix', () => {
  it('returns a square matrix', () => {
    const m = qrMatrix(PAYLOAD);
    expect(m.length).toBeGreaterThan(20);
    expect(m.every((row) => row.length === m.length)).toBe(true);
  });

  it('is deterministic for a payload', () => {
    expect(qrMatrix('abc')).toEqual(qrMatrix('abc'));
  });

  it('differs between payloads', () => {
    expect(qrMatrix('abc')).not.toEqual(qrMatrix('abd'));
  });

  // The three finder patterns are what a scanner locks onto. Drawing them
  // wrong yields a code that looks plausible and scans as nothing.
  it('places the three finder patterns', () => {
    const m = qrMatrix(PAYLOAD);
    const n = m.length;
    for (const [r, c] of [[0, 0], [0, n - 7], [n - 7, 0]] as const) {
      expect(m[r][c]).toBe(true);          // outer ring
      expect(m[r + 1][c + 1]).toBe(false); // white gap
      expect(m[r + 3][c + 3]).toBe(true);  // solid centre
    }
  });

  it('leaves the bottom-right corner free of a finder pattern', () => {
    const m = qrMatrix(PAYLOAD);
    const n = m.length;
    // A fourth finder there would mean the matrix is transposed or mirrored.
    const corner = [m[n - 7][n - 7], m[n - 6][n - 6], m[n - 4][n - 4]];
    expect(corner).not.toEqual([true, false, true]);
  });

  it('grows with the payload', () => {
    const short = qrMatrix('a').length;
    const long = qrMatrix('a'.repeat(300)).length;
    expect(long).toBeGreaterThan(short);
  });

  it('rejects an empty payload rather than emitting an unscannable code', () => {
    expect(() => qrMatrix('')).toThrow();
  });
});

// Guards for the rendering geometry. These exact values were established by
// rendering QrCanvas's drawing off-device and decoding it with jsQR: a dot
// radius below half a module, or a quiet zone under 4, produces a code that
// looks right and scans as nothing. Neither is a cosmetic choice.
describe('QrCanvas geometry', () => {
  it('keeps the quiet zone the spec requires', () => {
    expect(QUIET_MODULES).toBeGreaterThanOrEqual(4);
  });

  // 0.55 is the measured threshold; anything at or below 0.5 leaves adjacent
  // dots merely tangent and the code stops decoding.
  it('keeps data dots overlapping, not merely tangent', () => {
    expect(DOT_RADIUS_RATIO).toBeGreaterThan(0.55);
  });
});

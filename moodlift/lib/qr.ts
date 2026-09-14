import qrcode from 'qrcode-generator';

/**
 * Encode a payload as a QR module matrix — `true` is a dark module.
 *
 * A real encoding rather than a decorative grid: the comp's pass is meant to
 * be scanned at a gym door, and a pattern that merely looks like a QR code
 * would be a prop, not a feature.
 *
 * Type 0 asks the library to pick the smallest version that fits, and error
 * correction M leaves enough redundancy for the logo badge drawn over the
 * centre.
 */
export function qrMatrix(payload: string): boolean[][] {
  if (!payload) throw new Error('qrMatrix needs a payload to encode');

  const qr = qrcode(0, 'M');
  qr.addData(payload);
  qr.make();

  const count = qr.getModuleCount();
  return Array.from({ length: count }, (_, row) =>
    Array.from({ length: count }, (_, col) => qr.isDark(row, col))
  );
}

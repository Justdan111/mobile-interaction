import React, { useMemo } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { qrMatrix } from '../../lib/qr';

const FINDER_SIZE = 7;

/**
 * Geometry a scanner actually tolerates, established by rasterising this
 * component's exact drawing off-device and decoding it with jsQR. None of
 * these three values is cosmetic:
 *
 *   dot radius  0.42 -> unreadable   0.50 -> unreadable
 *               0.55 -> decodes      0.60 -> decodes (used, for margin)
 *
 * At exactly 0.5 adjacent dots are only tangent, so the white between four
 * diagonal neighbours survives binarisation and modules flip to light. They
 * have to genuinely overlap.
 *
 * The quiet zone is 4 modules because the spec requires it. And the finder
 * patterns are three nested FILLED rects on exact module boundaries: drawing
 * them as a stroked rect straddles the 7x7 edge by half a module and shifts
 * the one pattern a scanner locks onto.
 */
export const QUIET_MODULES = 4;
export const DOT_RADIUS_RATIO = 0.6;

/** Is (row, col) inside one of the three finder patterns? */
function inFinder(row: number, col: number, n: number): boolean {
  const near = (r: number, c: number) =>
    row >= r && row < r + FINDER_SIZE && col >= c && col < c + FINDER_SIZE;
  return near(0, 0) || near(0, n - FINDER_SIZE) || near(n - FINDER_SIZE, 0);
}

/**
 * The pass code — `.design/comps/pass-qr.png`.
 *
 * Data modules are dots and the three finder patterns are redrawn in the accent
 * colour, which is what gives the comp's code its look. Finder modules are
 * skipped in the data pass rather than overpainted, so rounded corners aren't
 * fighting square modules underneath.
 */
export function QrCanvas({
  payload,
  size,
  moduleColor,
  finderColor,
  background,
  logoColor,
}: {
  payload: string;
  size: number;
  moduleColor: string;
  finderColor: string;
  background: string;
  logoColor: string;
}) {
  const matrix = useMemo(() => qrMatrix(payload), [payload]);
  const n = matrix.length;

  const unit = size / (n + QUIET_MODULES * 2);
  const at = (i: number) => (i + QUIET_MODULES) * unit;

  const dots: React.ReactNode[] = [];
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (!matrix[row][col] || inFinder(row, col, n)) continue;
      dots.push(
        <Circle
          key={`${row}-${col}`}
          cx={at(col) + unit / 2}
          cy={at(row) + unit / 2}
          r={unit * DOT_RADIUS_RATIO}
          fill={moduleColor}
        />
      );
    }
  }

  /**
   * Three nested rounded rects at exactly the spec's module boundaries: 7x7
   * solid, 5x5 in the background colour, 3x3 solid. Filled rather than
   * stroked, so nothing straddles a module edge.
   */
  const finder = (row: number, col: number) => {
    const x = at(col);
    const y = at(row);
    return (
      <React.Fragment key={`f-${row}-${col}`}>
        <Rect
          x={x}
          y={y}
          width={FINDER_SIZE * unit}
          height={FINDER_SIZE * unit}
          rx={unit * 1.9}
          fill={finderColor}
        />
        <Rect
          x={x + unit}
          y={y + unit}
          width={unit * 5}
          height={unit * 5}
          rx={unit * 1.3}
          fill={background}
        />
        <Rect
          x={x + unit * 2}
          y={y + unit * 2}
          width={unit * 3}
          height={unit * 3}
          rx={unit * 0.8}
          fill={finderColor}
        />
      </React.Fragment>
    );
  };

  const centre = size / 2;
  const badge = unit * 6;

  return (
    <Svg width={size} height={size}>
      <Rect x={0} y={0} width={size} height={size} rx={size * 0.09} fill={background} />
      {dots}
      {finder(0, 0)}
      {finder(0, n - FINDER_SIZE)}
      {finder(n - FINDER_SIZE, 0)}

      {/* The centre badge. Error correction M tolerates this much occlusion —
          confirmed by decoding a render with the badge in place. */}
      <Rect
        x={centre - badge / 2}
        y={centre - badge / 2}
        width={badge}
        height={badge}
        rx={badge * 0.28}
        fill={background}
      />
      <Path
        d={`M${centre - badge * 0.2} ${centre + badge * 0.16}
            v${-badge * 0.2}a${badge * 0.2} ${badge * 0.2} 0 0 1 ${badge * 0.4} 0
            v${badge * 0.2}
            M${centre} ${centre + badge * 0.16}
            v${-badge * 0.2}a${badge * 0.2} ${badge * 0.2} 0 0 1 ${badge * 0.4} 0
            v${badge * 0.2}`}
        stroke={logoColor}
        strokeWidth={badge * 0.13}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

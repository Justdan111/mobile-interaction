import React, { useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';

/**
 * The hand-drawn ring the comps loop around the selected mood.
 *
 * Not an `<Ellipse>`: the character comes from the stroke overshooting where it
 * started and crossing itself, and from the radius wobbling slightly as it goes
 * round. Both are generated from a fixed sequence rather than Math.random, so
 * the ring is identical on every render — a ring that reshaped itself on each
 * frame would read as a glitch.
 */
export function HandDrawnEllipse({
  width,
  height,
  color,
  strokeWidth = 2,
}: {
  width: number;
  height: number;
  color: string;
  strokeWidth?: number;
}) {
  const d = useMemo(() => {
    const START = -2.7; // radians, so the gap and the crossing sit lower-left
    const OVERSHOOT = 0.75; // how far past a full turn the stroke carries on
    const STEPS = 72;

    // The wobble has to vary SLOWLY with the angle. Indexing a fixed array per
    // step instead makes the radius jump between neighbouring points, and the
    // ring comes out serrated rather than hand-drawn.
    const wobbleAt = (t: number) =>
      1 + 0.02 * Math.sin(t * 2 + 0.7) + 0.013 * Math.sin(t * 3 - 1.1);

    const rx = width / 2 - strokeWidth;
    const ry = height / 2 - strokeWidth;
    const cx = width / 2;
    const cy = height / 2;

    const points: string[] = [];
    for (let i = 0; i <= STEPS; i++) {
      const t = START + ((Math.PI * 2 + OVERSHOOT) * i) / STEPS;
      const w = wobbleAt(t);
      // A slight drift, as if drawn in one quick motion by a right hand.
      const x = cx + rx * w * Math.cos(t) + Math.sin(t) * 1.6;
      const y = cy + ry * w * Math.sin(t) - Math.cos(t) * 1.1;
      points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    return points.join('');
  }, [width, height, strokeWidth]);

  return (
    <Svg width={width} height={height} pointerEvents="none">
      <Path d={d} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

import React from 'react';
import { Path, Circle } from 'react-native-svg';

/**
 * The mascots in the comps are drawn with two distinct weights: limbs and
 * faces in a thin outline, and legs in a heavy solid stroke with a blob foot.
 * Both take `ink` from the caller — nothing here knows what it sits on.
 */

export const THIN = 2.4;
export const THICK = 9;

export function Thin({ d, ink, width = THIN }: { d: string; ink: string; width?: number }) {
  return (
    <Path
      d={d}
      stroke={ink}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}

export function Thick({ d, ink, width = THICK }: { d: string; ink: string; width?: number }) {
  return (
    <Path
      d={d}
      stroke={ink}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}

/** A solid dot eye. */
export function EyeDot({ cx, cy, ink, r = 5 }: { cx: number; cy: number; ink: string; r?: number }) {
  return <Circle cx={cx} cy={cy} r={r} fill={ink} />;
}

/** A closed eye — the downward lash arc used by Calm and Balanced. */
export function EyeClosed({ cx, cy, ink, w = 17 }: { cx: number; cy: number; ink: string; w?: number }) {
  return <Thin d={`M${cx - w / 2} ${cy}q${w / 2} ${w * 0.5} ${w} 0`} ink={ink} />;
}

/** A tired eye — the same arc inverted, drooping at the outer corner. */
export function EyeTired({ cx, cy, ink, w = 17 }: { cx: number; cy: number; ink: string; w?: number }) {
  return <Thin d={`M${cx - w / 2} ${cy}q${w / 2} ${-w * 0.42} ${w} ${w * 0.12}`} ink={ink} />;
}

/** A shoe: a short, very heavy stroke that reads as a solid blob. */
export function Foot({ d, ink }: { d: string; ink: string }) {
  return <Thick d={d} ink={ink} width={15} />;
}

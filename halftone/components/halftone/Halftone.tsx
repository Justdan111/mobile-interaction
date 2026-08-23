import React, { useMemo } from 'react';
import Svg, { Circle, Rect } from 'react-native-svg';
import { generateDots, type FieldName } from './fields';

type Props = {
  variant: FieldName;
  size: number;
  seed: string;
  density?: number;
  /** No default: callers must pass a theme-aware colour (e.g. `useTheme().t.ink`). */
  dotColor: string;
  /** Omit for a transparent plate. */
  background?: string;
  opacity?: number;
};

export function Halftone({
  variant,
  size,
  seed,
  density = 46,
  dotColor,
  background,
  opacity = 1,
}: Props) {
  const dots = useMemo(
    () => generateDots(variant, { size, density, seed }),
    [variant, size, density, seed]
  );

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} opacity={opacity}>
      {background ? <Rect x={0} y={0} width={size} height={size} fill={background} /> : null}
      {dots.map((d, i) => (
        <Circle key={i} cx={d.x} cy={d.y} r={d.r} fill={dotColor} />
      ))}
    </Svg>
  );
}

import React from 'react';
import Svg, { Circle } from 'react-native-svg';

/**
 * An arc gauge. Used at three very different sizes — the small Home stat
 * dials, the large Calories ring, and the goal rings — so nothing about the
 * geometry is hardcoded and both colours are required props.
 */
export function Ring({
  ratio,
  size,
  strokeWidth,
  track,
  fill,
  /** Where the arc starts, in degrees clockwise from 12 o'clock. */
  startAngle = 0,
  children,
}: {
  ratio: number;
  size: number;
  strokeWidth: number;
  track: string;
  fill: string;
  startAngle?: number;
  children?: React.ReactNode;
}) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(ratio, 0), 1);

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={track}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={fill}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${circumference * clamped} ${circumference}`}
        // SVG arcs start at 3 o'clock; -90 puts the start at the top.
        transform={`rotate(${startAngle - 90} ${size / 2} ${size / 2})`}
      />
      {children}
    </Svg>
  );
}

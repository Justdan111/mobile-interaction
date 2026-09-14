import React from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import type { DayMetrics } from '../../lib/activity';

/**
 * The small filled area chart beside Calories — `journey-activity.png`.
 *
 * Shows the same day's hourly series as the steps matrix, so the two cards
 * describe one day rather than two unrelated ones.
 */
export function WorkoutChart({
  metrics,
  color,
  width,
  height = 90,
}: {
  metrics: DayMetrics;
  color: string;
  width: number;
  height?: number;
}) {
  // The waking hours; overnight is flat and would waste half the width.
  const series = metrics.hourly.slice(6, 22);
  const peak = Math.max(...series, 1);
  const step = width / (series.length - 1);

  const points = series.map((value, i) => {
    const x = i * step;
    const y = height - (value / peak) * (height - 8) - 4;
    return [x, y] as [number, number];
  });

  const line = points.reduce((d, p, i) => {
    if (i === 0) return `M${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
    const prev = points[i - 1];
    const midX = (prev[0] + p[0]) / 2;
    return `${d}C${midX.toFixed(1)} ${prev[1].toFixed(1)},${midX.toFixed(1)} ${p[1].toFixed(1)},${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  }, '');

  const area = `${line}L${width} ${height}L0 ${height}Z`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="workoutFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.85} />
          <Stop offset="1" stopColor={color} stopOpacity={0.15} />
        </LinearGradient>
      </Defs>
      <Path d={area} fill="url(#workoutFill)" />
      <Path d={line} stroke={color} strokeWidth={1.5} fill="none" />
    </Svg>
  );
}

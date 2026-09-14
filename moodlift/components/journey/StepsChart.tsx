import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import type { DayMetrics } from '../../lib/activity';

const COLUMNS = 12;
const ROWS = 4;

/**
 * The dot-matrix steps chart from `.design/comps/journey-activity.png`.
 *
 * Each column is a two-hour block of the day; the number of lit dots is that
 * block's share of the busiest block, so the matrix reads as a shape rather
 * than a gauge. A smoothed curve runs through the column tops.
 */
export function StepsChart({
  metrics,
  litColor,
  dimColor,
  lineColor,
  axisColor,
  width,
  height = 150,
}: {
  metrics: DayMetrics;
  litColor: string;
  dimColor: string;
  lineColor: string;
  axisColor: string;
  width: number;
  height?: number;
}) {
  // Fold 24 hourly buckets into 12 two-hour columns.
  const columns = Array.from({ length: COLUMNS }, (_, i) =>
    metrics.hourly[i * 2] + metrics.hourly[i * 2 + 1]
  );
  const peak = Math.max(...columns, 1);

  // Round the top of the scale up to a clean step so the axis reads 1k / 2k
  // rather than 697 / 1,394. The dots still scale against the true peak.
  const niceMax = (() => {
    const magnitude = 10 ** Math.floor(Math.log10(peak));
    return Math.ceil(peak / (magnitude / 2)) * (magnitude / 2);
  })();

  const axisWidth = 28;
  const plotWidth = width - axisWidth;
  const colStep = plotWidth / COLUMNS;
  const rowStep = height / ROWS;
  const dotR = Math.min(colStep, rowStep) * 0.3;

  const dots: React.ReactNode[] = [];
  const tops: [number, number][] = [];

  columns.forEach((value, col) => {
    const lit = Math.round((value / peak) * ROWS);
    const cx = axisWidth + colStep * (col + 0.5);

    for (let row = 0; row < ROWS; row++) {
      // Row 0 is the bottom of the chart, so higher rows sit further up.
      const cy = height - rowStep * (row + 0.5);
      dots.push(
        <Circle
          key={`${col}-${row}`}
          cx={cx}
          cy={cy}
          r={dotR}
          fill={row < lit ? litColor : dimColor}
        />
      );
    }
    tops.push([cx, height - Math.max(lit, 0.5) * rowStep]);
  });

  // Catmull-Rom overshoots on a sharp rise, which sent the curve out of the
  // card entirely. Clamp every control point into the plot.
  const clampY = (y: number) => Math.min(Math.max(y, dotR), height - dotR);
  const clampX = (x: number) => Math.min(Math.max(x, axisWidth), width);

  // A Catmull-Rom curve through the column tops, as a cubic path.
  const curve = tops.reduce((d, point, i) => {
    if (i === 0) return `M${point[0].toFixed(1)} ${point[1].toFixed(1)}`;
    const p0 = tops[i - 2] ?? tops[i - 1];
    const p1 = tops[i - 1];
    const p2 = point;
    const p3 = tops[i + 1] ?? point;
    const c1 = [clampX(p1[0] + (p2[0] - p0[0]) / 6), clampY(p1[1] + (p2[1] - p0[1]) / 6)];
    const c2 = [clampX(p2[0] - (p3[0] - p1[0]) / 6), clampY(p2[1] - (p3[1] - p1[1]) / 6)];
    return `${d}C${c1[0].toFixed(1)} ${c1[1].toFixed(1)},${c2[0].toFixed(1)} ${c2[1].toFixed(1)},${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }, '');

  // Axis labels are derived from the peak column, not typed in, so they stay
  // truthful whichever day is shown.
  const labels = [3, 2, 1, 0].map((i) => Math.round((niceMax * i) / 3));

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Path d={curve} stroke={lineColor} strokeWidth={1.5} fill="none" />
        {dots}
      </Svg>

      <View className="absolute left-0 top-0" style={{ height }}>
        {labels.map((value, i) => (
          <Text
            key={value + '-' + i}
            className="font-body text-[10px]"
            style={{
              color: axisColor,
              position: 'absolute',
              top: (height / ROWS) * i + rowStep / 2 - 7,
            }}
          >
            {value >= 1000 ? `${Math.round(value / 100) / 10}k` : value}
          </Text>
        ))}
      </View>
    </View>
  );
}

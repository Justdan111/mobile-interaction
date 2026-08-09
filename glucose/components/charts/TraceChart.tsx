import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import { colors } from '@/theme/colors';
import { clockLabel, formatValue, type Unit } from '@/lib/glucose';
import type { Reading } from '@/data/readings';
import { smoothArea, smoothLine, type Point } from './path';

/**
 * The day's trace: a filled violet ridge that dissolves into the black as it
 * falls. The stroke is only a shade brighter than the fill's crest, so the
 * shape reads as a mass of light rather than a plotted line.
 *
 * Touch anywhere on it to scrub: a crosshair locks to the nearest sample and
 * the reading at that moment is called out above it.
 */
export function TraceChart({
  readings,
  projection = [],
  unit,
  width,
  height = 112,
}: {
  readings: Reading[];
  /** Optional forecast, drawn dashed beyond the last real sample. */
  projection?: Reading[];
  unit: Unit;
  width: number;
  height?: number;
}) {
  const [scrub, setScrub] = useState<number | null>(null);

  const { points, projectedPoints, axis, series } = useMemo(() => {
    const series = [...readings, ...projection];
    if (!series.length) {
      return { points: [], projectedPoints: [], axis: [], series };
    }

    // Scale to the data, with a little headroom, so a logged spike never clips.
    const values = series.map((r) => r.mgdl);
    const lo = Math.min(...values);
    const hi = Math.max(...values);
    const span = Math.max(hi - lo, 1);
    const pad = span * 0.12;
    const min = lo - pad;
    const max = hi + pad;

    const toPoint = (r: Reading, i: number): Point => ({
      x: (i / Math.max(series.length - 1, 1)) * width,
      y: height - ((r.mgdl - min) / (max - min)) * (height - 2) - 1,
    });

    const all = series.map(toPoint);

    // The projection re-uses the real trace's last point so the two paths meet.
    const cut = readings.length;
    const lastIndex = Math.max(series.length - 1, 1);

    // Ticks land on whole even hours at their true position, rather than being
    // spread evenly and quietly lying about when each sample was taken.
    const nowFraction = (readings.length - 1) / lastIndex;
    const axisTicks: { label: string; fraction: number }[] = [];
    readings.forEach((r, i) => {
      if (r.minute % 120 !== 0) return;
      const fraction = i / lastIndex;
      if (fraction > nowFraction - 0.1) return;
      axisTicks.push({ label: String(Math.floor(r.minute / 60)), fraction });
    });
    axisTicks.push({ label: 'now', fraction: nowFraction });
    if (projection.length) axisTicks.push({ label: '+1h', fraction: 1 });

    return {
      points: all.slice(0, cut),
      projectedPoints: projection.length ? all.slice(cut - 1) : [],
      axis: axisTicks,
      series,
    };
  }, [readings, projection, width, height]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        // Claim the touch only once it travels horizontally, so a vertical drag
        // that starts on the chart still scrolls the screen. onBegin fires on
        // touch-down regardless, which is what makes a plain tap scrub.
        .activeOffsetX([-6, 6])
        .failOffsetY([-14, 14])
        .onBegin((e) => {
          'worklet';
          const i = Math.round((e.x / width) * Math.max(series.length - 1, 1));
          runOnJS(setScrub)(Math.min(Math.max(i, 0), series.length - 1));
        })
        .onUpdate((e) => {
          'worklet';
          const i = Math.round((e.x / width) * Math.max(series.length - 1, 1));
          runOnJS(setScrub)(Math.min(Math.max(i, 0), series.length - 1));
        })
        .onFinalize(() => {
          'worklet';
          runOnJS(setScrub)(null);
        }),
    [width, series.length],
  );

  if (!points.length) return <View style={{ width, height }} />;

  const allPoints = [...points, ...projectedPoints.slice(1)];
  const active = scrub === null ? null : allPoints[scrub];
  const activeReading = scrub === null ? null : series[scrub];
  const isProjected = scrub !== null && scrub >= readings.length;

  return (
    <View>
      {/* Reserve the callout's height always, so scrubbing cannot shift the
          layout of everything below the chart. */}
      <View className="h-[30px] justify-end" style={{ width }}>
        {activeReading ? (
          <View
            className="absolute flex-row items-baseline"
            style={{
              left: Math.min(Math.max((active?.x ?? 0) - 34, 0), width - 92),
            }}
          >
            <Text className="font-inter-bold text-[19px] text-chalk">
              {formatValue(activeReading.mgdl, unit)}
            </Text>
            <Text className="ml-1 font-inter text-[11px] text-mist">{unit}</Text>
            <Text className="ml-2 font-inter text-[11px] text-smoke">
              {isProjected ? '~' : ''}
              {clockLabel(activeReading.minute)}
            </Text>
          </View>
        ) : null}
      </View>

      <GestureDetector gesture={pan}>
        {/* collapsable={false} keeps the touch target alive on Android. */}
        <View collapsable={false}>
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id="traceFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.violetCrest} />
                <Stop offset="0.5" stopColor={colors.violetMid} />
                <Stop offset="1" stopColor="#030308" />
              </LinearGradient>
            </Defs>

            <Path d={smoothArea(points, height)} fill="url(#traceFill)" />
            <Path
              d={smoothLine(points)}
              stroke="#B69AE8"
              strokeWidth={1}
              strokeOpacity={0.5}
              fill="none"
            />

            {projectedPoints.length > 1 ? (
              <Path
                d={smoothLine(projectedPoints)}
                stroke={colors.badge}
                strokeWidth={1.6}
                strokeOpacity={0.85}
                strokeDasharray="3 4"
                strokeLinecap="round"
                fill="none"
              />
            ) : null}

            {active ? (
              <>
                <Line
                  x1={active.x}
                  y1={0}
                  x2={active.x}
                  y2={height}
                  stroke={colors.chalk}
                  strokeWidth={1}
                  strokeOpacity={0.45}
                />
                <Circle
                  cx={active.x}
                  cy={active.y}
                  r={5.5}
                  fill={colors.void}
                  stroke={colors.chalk}
                  strokeWidth={2}
                />
              </>
            ) : null}
          </Svg>
        </View>
      </GestureDetector>

      {/* Absolute so each label sits over the moment it names. */}
      <View className="mt-[3px] h-[13px]" style={{ width }}>
        {axis.map((tick) => (
          <Text
            key={`${tick.label}-${tick.fraction}`}
            className="absolute font-inter text-[10px] leading-[13px] text-smoke"
            style={{
              width: 34,
              textAlign:
                tick.fraction === 0
                  ? 'left'
                  : tick.fraction >= 0.999
                    ? 'right'
                    : 'center',
              left: Math.min(
                Math.max(tick.fraction * width - 17, 0),
                width - 34,
              ),
            }}
          >
            {tick.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

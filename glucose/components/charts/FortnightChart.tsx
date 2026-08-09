import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Defs, Line, LinearGradient, Rect, Stop } from 'react-native-svg';
import { LinearGradient as Gradient } from 'expo-linear-gradient';
import { colors } from '@/theme/colors';
import { median as medianOf } from '@/lib/glucose';
import type { DaySummary } from '@/data/readings';

const PAD_X = 18;
const GAP = 8;
const PLOT_HEIGHT = 250;

/**
 * Daily time-in-range inside a glass panel. The dotted rule is the period
 * median and sits above the bars so it stays legible over the tall ones.
 *
 * Each bar is its own hit target: tapping one holds it lit and names the day.
 */
export function FortnightChart({
  days,
  selected,
  onSelect,
  width,
}: {
  days: DaySummary[];
  selected: number | null;
  onSelect: (index: number | null) => void;
  width: number;
}) {
  const plotWidth = width - PAD_X * 2;
  const values = days.map((d) => d.tir);
  const barWidth = (plotWidth - GAP * (values.length - 1)) / values.length;
  const median = medianOf(values);
  const medianY = PLOT_HEIGHT - median * PLOT_HEIGHT;

  // Ticks read off the real dates rather than a fixed list, so switching the
  // range relabels the axis instead of lying about it.
  const tickEvery = values.length > 10 ? 2 : 1;
  const active = selected === null ? null : days[selected];

  return (
    <Gradient
      colors={[colors.panelTop, colors.panelMid, colors.panelEnd]}
      locations={[0, 0.55, 1]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      className="overflow-hidden border border-panel-edge"
      style={{ width, borderRadius: 26 }}
    >
      <View style={{ paddingHorizontal: PAD_X, paddingTop: 17 }}>
        {/* Fixed height so selecting a bar never reflows the panel. */}
        <View className="h-[22px] justify-center">
          {active ? (
            <Text className="font-inter-medium text-[12px] text-chalk">
              {active.label} · {Math.round(active.tir * 100)}% in target ·{' '}
              {active.average} mg/dL avg
            </Text>
          ) : (
            <Text className="font-inter text-[12px] text-smoke">
              Median {Math.round(median * 100)}% · tap a day
            </Text>
          )}
        </View>

        <View style={{ width: plotWidth, height: PLOT_HEIGHT }}>
          <Svg width={plotWidth} height={PLOT_HEIGHT}>
            <Defs>
              <LinearGradient id="dayBar" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.violetCap} />
                <Stop offset="0.3" stopColor="#6F5998" />
                <Stop offset="0.65" stopColor="#3D3354" />
                <Stop offset="1" stopColor="#1B1920" />
              </LinearGradient>
              <LinearGradient id="dayBarLit" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.badge} />
                <Stop offset="0.4" stopColor={colors.violetCrest} />
                <Stop offset="1" stopColor="#3B2F55" />
              </LinearGradient>
            </Defs>

            {values.map((v, i) => {
              const barHeight = Math.max(v * PLOT_HEIGHT, barWidth);
              const dimmed = selected !== null && selected !== i;
              return (
                <Rect
                  key={i}
                  x={i * (barWidth + GAP)}
                  y={PLOT_HEIGHT - barHeight}
                  width={barWidth}
                  // Overrun the frame so only the top cap is rounded.
                  height={barHeight + barWidth}
                  rx={barWidth / 2}
                  fill={selected === i ? 'url(#dayBarLit)' : 'url(#dayBar)'}
                  opacity={dimmed ? 0.45 : 1}
                />
              );
            })}

            <Line
              x1={0}
              y1={medianY}
              x2={plotWidth}
              y2={medianY}
              stroke={colors.smoke}
              strokeWidth={1.4}
              strokeOpacity={0.8}
              strokeDasharray="1.5 7"
              strokeLinecap="round"
            />
          </Svg>

          {/* Transparent columns over the SVG carry the touches — full height,
              so a short bar is no harder to hit than a tall one. */}
          <View className="absolute inset-0 flex-row" style={{ gap: GAP }}>
            {values.map((_, i) => (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={`${days[i].label}, ${Math.round(values[i] * 100)} percent in target`}
                accessibilityState={{ selected: selected === i }}
                onPress={() => {
                  Haptics.selectionAsync();
                  onSelect(selected === i ? null : i);
                }}
                style={{ width: barWidth }}
              />
            ))}
          </View>
        </View>

        <View className="mt-[18px] flex-row pb-[10px]" style={{ gap: GAP }}>
          {days.map((day, i) => (
            <View key={day.date} style={{ width: barWidth }}>
              {i % tickEvery === 0 ? (
                <Text
                  className={`font-inter text-[10px] leading-[13px] ${
                    selected === i ? 'text-chalk' : 'text-smoke'
                  }`}
                >
                  {day.label.split(' ')[1]}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      </View>
    </Gradient>
  );
}

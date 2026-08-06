import { Text, View } from 'react-native';
import Svg, { Defs, Line, LinearGradient, Rect, Stop } from 'react-native-svg';
import { LinearGradient as Gradient } from 'expo-linear-gradient';
import { colors } from '@/theme/colors';

const PAD_X = 18;
const GAP = 8;
const PLOT_HEIGHT = 250;

/**
 * Thirteen days of time-in-range inside a glass panel. The dotted rule is the
 * period median and sits above the bars so it stays legible over the tall ones.
 */
export function FortnightChart({
  values,
  axis,
  median,
  width,
}: {
  values: number[];
  axis: string[];
  median: number;
  width: number;
}) {
  const plotWidth = width - PAD_X * 2;
  const barWidth = (plotWidth - GAP * (values.length - 1)) / values.length;
  const medianY = PLOT_HEIGHT - median * PLOT_HEIGHT;

  return (
    <Gradient
      colors={[colors.panelTop, colors.panelMid, colors.panelEnd]}
      locations={[0, 0.55, 1]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      className="overflow-hidden rounded-[26px] border border-panel-edge"
      style={{ width }}
    >
      <View style={{ paddingHorizontal: PAD_X, paddingTop: 17 }}>
        <Svg width={plotWidth} height={PLOT_HEIGHT}>
          <Defs>
            <LinearGradient id="dayBar" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.violetCap} />
              <Stop offset="0.3" stopColor="#6F5998" />
              <Stop offset="0.65" stopColor="#3D3354" />
              <Stop offset="1" stopColor="#1B1920" />
            </LinearGradient>
          </Defs>

          {values.map((v, i) => {
            const barHeight = Math.max(v * PLOT_HEIGHT, barWidth);
            return (
              <Rect
                key={i}
                x={i * (barWidth + GAP)}
                y={PLOT_HEIGHT - barHeight}
                width={barWidth}
                // Overrun the frame so only the top cap is rounded.
                height={barHeight + barWidth}
                rx={barWidth / 2}
                fill="url(#dayBar)"
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

        <View className="mt-[18px] flex-row justify-between pb-[10px]">
          {axis.map((tick) => (
            <Text
              key={tick}
              className="font-inter text-[10px] leading-[13px] text-smoke"
            >
              {tick}
            </Text>
          ))}
        </View>
      </View>
    </Gradient>
  );
}

import { Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { smoothArea, smoothLine, type Point } from './path';

/**
 * The day's trace: a filled violet ridge that dissolves into the black as it
 * falls. The stroke is only a shade brighter than the fill's crest, so the
 * shape reads as a mass of light rather than a plotted line.
 */
export function TraceChart({
  values,
  axis,
  width,
  height = 112,
}: {
  values: number[];
  axis: string[];
  width: number;
  height?: number;
}) {
  const points: Point[] = values.map((v, i) => ({
    x: (i / (values.length - 1)) * width,
    // Leave a sliver of headroom so the tallest peak never clips the frame.
    y: height - v * (height - 2) - 1,
  }));

  return (
    <View>
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
      </Svg>

      <View className="mt-[3px] flex-row justify-between" style={{ width }}>
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
  );
}

import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '@/theme/colors';

export type Tone = 'violet' | 'clay' | 'amber';

/**
 * Every tone fades through the same violet ink at the base, which is what ties
 * the three range cards together even though their crests differ.
 */
const TONES: Record<Tone, [string, string]> = {
  violet: [colors.violetCap, '#725C9E'],
  clay: [colors.clayCap, colors.clayMid],
  amber: [colors.amberCap, colors.amberMid],
};

export const BAR_WIDTH = 18;
export const BAR_GAP = 6.4;

/** How much of the card's height the tallest bar is allowed to take. */
const FILL = 0.85;

/**
 * The bar cluster tucked into the right of each range card. Values are scaled
 * against the series' own maximum, not an absolute one: a card showing 8-14%
 * below range would otherwise render as a row of stubs. The cluster is there to
 * show the shape of the last six days, and the figure beside it carries the
 * magnitude.
 */
export function MiniBars({
  values,
  tone,
  height,
}: {
  values: number[];
  tone: Tone;
  height: number;
}) {
  const [crest, mid] = TONES[tone];
  const width = values.length * BAR_WIDTH + (values.length - 1) * BAR_GAP;
  const peak = Math.max(...values, 0.0001);
  const scaled = values.map((v) => (v / peak) * FILL);

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={`mini-${tone}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={crest} />
          <Stop offset="0.45" stopColor={mid} />
          <Stop offset="1" stopColor="#50406C" />
        </LinearGradient>
      </Defs>

      {scaled.map((v, i) => {
        const barHeight = Math.max(v * height, BAR_WIDTH);
        return (
          <Rect
            key={i}
            x={i * (BAR_WIDTH + BAR_GAP)}
            y={height - barHeight}
            width={BAR_WIDTH}
            // Overrun the frame so only the top cap is rounded — the foot of
            // each bar is cut square by the card edge, as in the comp.
            height={barHeight + BAR_WIDTH}
            rx={BAR_WIDTH / 2}
            fill={`url(#mini-${tone})`}
          />
        );
      })}
    </Svg>
  );
}

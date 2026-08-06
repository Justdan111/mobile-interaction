import Svg, { Circle, Line, Path, Polygon } from 'react-native-svg';
import { colors } from '@/theme/colors';

type IconProps = { size?: number; color?: string };

/** Three even rules — the header button on every screen. */
export function MenuIcon({ size = 18, color = colors.chalk }: IconProps) {
  return (
    <Svg width={size} height={size * (12 / 18)} viewBox="0 0 18 12">
      <Line
        x1={0}
        y1={1}
        x2={18}
        y2={1}
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Line
        x1={0}
        y1={6}
        x2={18}
        y2={6}
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Line
        x1={0}
        y1={11}
        x2={18}
        y2={11}
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function InfoIcon({ size = 19, color = colors.mist }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Circle cx={10} cy={10} r={9} stroke={color} strokeWidth={1.3} />
      <Circle cx={10} cy={5.9} r={1} fill={color} />
      <Line
        x1={10}
        y1={8.8}
        x2={10}
        y2={14.4}
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function PencilIcon({ size = 20, color = colors.chalk }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Path
        d="M13.6 2.6a1.9 1.9 0 0 1 2.7 2.7l-8.5 8.5-3.5.8.8-3.5 8.5-8.5Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinejoin="round"
        fill="none"
      />
      <Line
        x1={12.2}
        y1={4.1}
        x2={14.9}
        y2={6.8}
        stroke={color}
        strokeWidth={1.4}
      />
      <Line
        x1={3.2}
        y1={17.4}
        x2={16.4}
        y2={17.4}
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function PlusIcon({ size = 14, color = colors.chalk }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Line
        x1={7}
        y1={0.8}
        x2={7}
        y2={13.2}
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Line
        x1={0.8}
        y1={7}
        x2={13.2}
        y2={7}
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * The trend marker beside the reading. A solid triangle, flipped for a fall
 * and squashed to a bar when the trace is flat.
 */
export function TrendTriangle({
  direction = 'up',
  size = 31,
  color = colors.badge,
}: {
  direction?: 'up' | 'down' | 'flat';
  size?: number;
  color?: string;
}) {
  const height = size * (16 / 31);
  if (direction === 'flat') {
    return (
      <Svg width={size} height={height} viewBox="0 0 31 16">
        <Path d="M1 6h29v4H1z" fill={color} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={height} viewBox="0 0 31 16">
      <Polygon
        points={direction === 'up' ? '15.5,1 30,15 1,15' : '15.5,15 30,1 1,1'}
        fill={color}
      />
    </Svg>
  );
}

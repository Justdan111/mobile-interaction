import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';
import type { TrackingIcon } from '@/data/shipments';

type Props = { color: string; size?: number };

const stroke = (color: string, w = 1.8) => ({
  fill: 'none' as const,
  stroke: color,
  strokeWidth: w,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

function Package({ color, size = 18 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <Polyline points="3.3 6.96 12 12.01 20.7 6.96" />
      <Path d="M12 12v10" />
    </Svg>
  );
}

function Truck({ color, size = 18 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <Path d="M3 7h10v9H3z" />
      <Path d="M13 10h4l3 3.2V16h-7z" />
      <Circle cx={7.5} cy={18.5} r={1.9} />
      <Circle cx={16.5} cy={18.5} r={1.9} />
      <Path d="M1.5 10h4M1.5 13h3" />
    </Svg>
  );
}

function Ferry({ color, size = 18 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <Path d="M4 15h16l-2.2 4.2H6.2z" />
      <Path d="M7 15V9.5h10V15" />
      <Path d="M10 9.5V6.5h4v3" />
      <Path d="M3 21c1.5 0 1.5-1.2 3-1.2S7.5 21 9 21s1.5-1.2 3-1.2S13.5 21 15 21s1.5-1.2 3-1.2S19.5 21 21 21" />
    </Svg>
  );
}

function Warehouse({ color, size = 18 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <Path d="M3 20V9.2l9-5 9 5V20" />
      <Rect x="8.5" y="12.5" width="7" height="7.5" rx="1" />
      <Path d="M8.5 16h7" />
    </Svg>
  );
}

function Clipboard({ color, size = 18 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <Path d="M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      <Rect x="9" y="2.5" width="6" height="4" rx="1.4" />
      <Path d="M9 13l2 2 4-4.5" />
    </Svg>
  );
}

const MAP = { package: Package, truck: Truck, ferry: Ferry, warehouse: Warehouse, clipboard: Clipboard };

export function StepIcon({ name, ...rest }: Props & { name: TrackingIcon }) {
  const C = MAP[name];
  return <C {...rest} />;
}

/** Outline clock used in the ETA banner. */
export function ClockIcon({ color, size = 22 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 1.7)}>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 6.8V12l3.4 2.2" />
    </Svg>
  );
}

/** Crosshair used in the map waypoint pill. */
export function TargetIcon({ color, size = 18 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 1.8)}>
      <Circle cx={12} cy={12} r={7} />
      <Circle cx={12} cy={12} r={2.6} fill={color} stroke="none" />
      <Path d="M12 1.8v3.4M12 18.8v3.4M1.8 12h3.4M18.8 12h3.4" />
    </Svg>
  );
}

/** Handset for the Contact button. */
export function PhoneIcon({ color, size = 19 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 1.9)}>
      <Path d="M21.5 16.9v2.8a1.9 1.9 0 0 1-2.1 1.9 18.8 18.8 0 0 1-8.2-2.9 18.5 18.5 0 0 1-5.7-5.7A18.8 18.8 0 0 1 2.6 4.7 1.9 1.9 0 0 1 4.5 2.6h2.8a1.9 1.9 0 0 1 1.9 1.6c.12.9.35 1.79.68 2.63a1.9 1.9 0 0 1-.43 2L8.3 10a15.2 15.2 0 0 0 5.7 5.7l1.16-1.16a1.9 1.9 0 0 1 2-.43c.84.33 1.73.56 2.63.68a1.9 1.9 0 0 1 1.6 1.94z" />
    </Svg>
  );
}

/** The shield + star badge inside the origin pin. */
export function OriginBadge({ size = 17 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2.2 20 5.4v6.2c0 5-3.4 9-8 10.2-4.6-1.2-8-5.2-8-10.2V5.4z"
        fill="#FFFFFF"
      />
      <Path
        d="M12 7.4l1.42 2.88 3.18.46-2.3 2.24.54 3.16L12 14.66l-2.84 1.48.54-3.16-2.3-2.24 3.18-.46z"
        fill="#3CB566"
      />
    </Svg>
  );
}

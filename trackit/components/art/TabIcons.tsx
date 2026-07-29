import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';
import { colors } from '@/theme/colors';

export type TabIconProps = { color: string; size?: number; focused?: boolean };

const S = 24;

/** Home — a solid house with the brand green slotted into the doorway. */
export function HomeIcon({ color, size = 25 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${S} ${S}`}>
      <Path
        d="M10.45 2.95a2.35 2.35 0 0 1 3.1 0l7.15 6.16c.55.47.85 1.16.85 1.89v8.4A2.6 2.6 0 0 1 18.95 22H5.05a2.6 2.6 0 0 1-2.6-2.6v-8.4c0-.73.3-1.42.85-1.89z"
        fill={color}
      />
      <Rect x={11.15} y={13.2} width={1.7} height={5.6} rx={0.85} fill={colors.tabAccent} />
    </Svg>
  );
}

/** Track — a folded paper map. */
export function TrackIcon({ color, size = 25 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${S} ${S}`}>
      <Path
        d="M1.6 6.4 8.4 3.4 15.6 6.4 22.4 3.4 22.4 17.6 15.6 20.6 8.4 17.6 1.6 20.6z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
        fill="none"
      />
      <Path d="M8.4 3.4V17.6M15.6 6.4v14.2" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
    </Svg>
  );
}

/** History — a parcel seen in three-quarter view. */
export function HistoryIcon({ color, size = 25 }: TabIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${S} ${S}`}
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <Polyline points="3.3 6.96 12 12.01 20.7 6.96" />
      <Path d="M12 12v10" />
      <Path d="M16.5 9.4 7.5 4.21" />
    </Svg>
  );
}

/** Promos — a scalloped seal wrapped around a percent mark. */
const LOBES = 12;
const SEAL_R = 8.55;
const seal = () => {
  const cx = 12;
  const cy = 12;
  const step = (Math.PI * 2) / LOBES;
  const inner = Array.from({ length: LOBES }, (_, i) => {
    const a = -Math.PI / 2 + (i + 0.5) * step;
    return { x: cx + SEAL_R * Math.cos(a), y: cy + SEAL_R * Math.sin(a) };
  });
  const bump = SEAL_R * Math.sin(Math.PI / LOBES); // radius of each semicircular bump
  let d = `M${inner[0].x.toFixed(2)} ${inner[0].y.toFixed(2)}`;
  for (let i = 1; i <= LOBES; i += 1) {
    const p = inner[i % LOBES];
    d += ` A${bump.toFixed(2)} ${bump.toFixed(2)} 0 0 1 ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  }
  return `${d}Z`;
};
const SEAL_PATH = seal();

export function PromosIcon({ color, size = 25 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${S} ${S}`}>
      <Path d={SEAL_PATH} stroke={color} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
      <Path
        d="M14.9 9.1 9.1 14.9"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={9.7} cy={9.7} r={1.15} stroke={color} strokeWidth={1.35} fill="none" />
      <Circle cx={14.3} cy={14.3} r={1.15} stroke={color} strokeWidth={1.35} fill="none" />
    </Svg>
  );
}

/** Bell used by the header notification button. */
export function BellIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M18.4 15.6c-.9-1-1.4-1.9-1.4-3.4V10a5 5 0 0 0-10 0v2.2c0 1.5-.5 2.4-1.4 3.4-.6.6-.2 1.7.7 1.7h11.4c.9 0 1.3-1.1.7-1.7z" />
      <Path d="M10.1 20.4a2.2 2.2 0 0 0 3.8 0" />
    </Svg>
  );
}

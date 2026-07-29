import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import type { PackageShape } from '@/data/shipments';

/* ─────────────────────── hero: weight on a stack of cash ───────────────── */

export function CostHero({ size = 100 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 0.92} viewBox="0 0 120 110">
      <Defs>
        <LinearGradient id="chWeight" x1="0" y1="0" x2="0.45" y2="1">
          <Stop offset="0" stopColor="#6D757D" />
          <Stop offset="0.45" stopColor="#4A5158" />
          <Stop offset="1" stopColor="#2B3036" />
        </LinearGradient>
        <LinearGradient id="chNoteTop" x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor="#8CF0A5" />
          <Stop offset="1" stopColor="#4FD470" />
        </LinearGradient>
        <LinearGradient id="chNoteSide" x1="0" y1="0" x2="0.3" y2="1">
          <Stop offset="0" stopColor="#54D473" />
          <Stop offset="1" stopColor="#2FAF51" />
        </LinearGradient>
        <LinearGradient id="chCoin" x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#8DF0A8" />
          <Stop offset="0.5" stopColor="#4ED271" />
          <Stop offset="1" stopColor="#2AA84C" />
        </LinearGradient>
      </Defs>

      <Ellipse cx={60} cy={102} rx={34} ry={5} fill="#2E7A3E" opacity={0.12} />

      {/* handle */}
      <Path
        d="M52 22 a8.5 8.5 0 0 1 16 0"
        stroke="#9AA1A8"
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M53.5 22 a7 7 0 0 1 13 0"
        stroke="#5B636B"
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />

      {/* weight body */}
      <Path d="M46 24 h28 l12 38 H34 Z" fill="url(#chWeight)" />
      <Path d="M46 24 h28 l1.6 5 H44.4 Z" fill="#FFFFFF" opacity={0.14} />
      <SvgText
        x={60}
        y={52}
        fill="#FFFFFF"
        fontSize={13}
        fontWeight="700"
        textAnchor="middle"
        letterSpacing={0.6}
      >
        COST
      </SvgText>

      {/* banded cash — a rolled stack seen slightly from above */}
      <Path d="M18 62 h84 v18 a10 10 0 0 1 -10 10 H28 a10 10 0 0 1 -10 -10 Z" fill="url(#chNoteSide)" />
      <Ellipse cx={60} cy={62} rx={42} ry={11} fill="url(#chNoteTop)" />
      <Path d="M18 70 h84" stroke="#2C9F4A" strokeWidth={1.6} opacity={0.55} />
      <Path d="M18 78 h84" stroke="#2C9F4A" strokeWidth={1.6} opacity={0.4} />
      {/* the two rolls poking out at the sides */}
      <Ellipse cx={22} cy={72} rx={9} ry={14} fill="#43C063" />
      <Ellipse cx={98} cy={72} rx={9} ry={14} fill="#43C063" />

      {/* coin */}
      <Circle cx={60} cy={78} r={19} fill="url(#chCoin)" />
      <Circle cx={60} cy={78} r={14.5} stroke="#EAFFF0" strokeWidth={2.4} fill="none" opacity={0.85} />
      <SvgText x={60} y={86} fill="#E8FFF0" fontSize={21} fontWeight="700" textAnchor="middle">
        $
      </SvgText>
    </Svg>
  );
}

/* ───────────────────────── package shape thumbnails ────────────────────── */

const BOX_DEFS = (
  <Defs>
    <LinearGradient id="psTop" x1="0" y1="0" x2="0.7" y2="1">
      <Stop offset="0" stopColor="#E4BE90" />
      <Stop offset="1" stopColor="#C79C68" />
    </LinearGradient>
    <LinearGradient id="psLeft" x1="0" y1="0" x2="0.25" y2="1">
      <Stop offset="0" stopColor="#C0966A" />
      <Stop offset="1" stopColor="#9C7449" />
    </LinearGradient>
    <LinearGradient id="psRight" x1="0.1" y1="0" x2="1" y2="1">
      <Stop offset="0" stopColor="#A67B4C" />
      <Stop offset="1" stopColor="#805631" />
    </LinearGradient>
    <LinearGradient id="psTape" x1="0" y1="0" x2="1" y2="1">
      <Stop offset="0" stopColor="#E8CFA6" />
      <Stop offset="1" stopColor="#D2B183" />
    </LinearGradient>
  </Defs>
);

export function PackageShapeArt({ shape, size = 52 }: { shape: PackageShape; size?: number }) {
  if (shape === 'tall') {
    return (
      <Svg width={size} height={size} viewBox="0 0 80 80">
        {BOX_DEFS}
        <Polygon points="40,4 68,18 40,32 12,18" fill="url(#psTop)" />
        <Polygon points="12,18 40,32 40,78 12,64" fill="url(#psLeft)" />
        <Polygon points="68,18 40,32 40,78 68,64" fill="url(#psRight)" />
        <Path d="M40 32 L40 78" stroke="#8A5F36" strokeWidth={1.1} opacity={0.35} />
        {/* the flaps tucked into each front face */}
        <Polygon points="40,32 50,27 50,40 40,45" fill="#8A5F36" opacity={0.3} />
        <Polygon points="30,27 40,32 40,45 30,40" fill="#8A5F36" opacity={0.22} />
        <Polygon points="12,52 22,57 22,66 12,61" fill="#8A5F36" opacity={0.2} />
      </Svg>
    );
  }

  if (shape === 'flat') {
    return (
      <Svg width={size} height={size} viewBox="0 0 80 80">
        {BOX_DEFS}
        <Polygon points="30,20 74,26 44,44 6,34" fill="url(#psTop)" />
        <Polygon points="6,34 44,44 44,62 6,52" fill="url(#psLeft)" />
        <Polygon points="44,44 74,26 74,44 44,62" fill="url(#psRight)" />
        <Path d="M6 34 L44 44" stroke="#8A5F36" strokeWidth={1.1} opacity={0.3} />
        <Polygon points="44,44 54,38 54,50 44,56" fill="#8A5F36" opacity={0.18} />
      </Svg>
    );
  }

  // cube — the default carton, taped across the lid
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      {BOX_DEFS}
      <Polygon points="40,10 70,27 40,44 10,27" fill="url(#psTop)" />
      <Polygon points="10,27 40,44 40,72 10,55" fill="url(#psLeft)" />
      <Polygon points="70,27 40,44 40,72 70,55" fill="url(#psRight)" />
      {/* tape over the lid + the flap folded down the right face */}
      <Polygon points="26,18.5 56,35.5 48,40 18,23" fill="url(#psTape)" />
      <Polygon points="56,35.5 48,40 48,52 56,48" fill="#C6A374" />
      <Path d="M40 44 L40 72" stroke="#8A5F36" strokeWidth={1} opacity={0.35} />
      <G opacity={0.5} stroke="#6B4A2A" strokeWidth={1.3} fill="none" strokeLinecap="round">
        <Path d="M18 55 v-6 M23 57 v-6" />
        <Path d="M29 51 v7 M26.5 60 h5" />
      </G>
    </Svg>
  );
}

/* ──────────────────────────── field glyphs ─────────────────────────────── */

const line = (color: string, w = 1.9) => ({
  fill: 'none' as const,
  stroke: color,
  strokeWidth: w,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

/** Cube with an arrow — pointing in for pick-up, out for drop-off. */
export function RouteCube({
  direction,
  color,
  size = 24,
}: {
  direction: 'in' | 'out';
  color: string;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...line(color, 1.7)}>
      <Path d="M20 13.4V7.6a1.7 1.7 0 0 0-.85-1.47l-5.3-3.05a1.7 1.7 0 0 0-1.7 0L6.85 6.13A1.7 1.7 0 0 0 6 7.6v5.8a1.7 1.7 0 0 0 .85 1.47l5.3 3.05a1.7 1.7 0 0 0 1.7 0l5.3-3.05A1.7 1.7 0 0 0 20 13.4z" />
      <Path d="M6.3 6.9 13 10.76l6.7-3.86" />
      <Path d="M13 10.8v7.6" />
      {direction === 'in' ? (
        <Path d="M8.4 20.4H3.6M5.9 17.9 3.4 20.4l2.5 2.5" />
      ) : (
        <Path d="M15.6 20.4h4.8M18.1 17.9l2.5 2.5-2.5 2.5" />
      )}
    </Svg>
  );
}

/** Kettlebell-ish weight used by the kg field. */
export function WeightGlyph({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...line(color, 1.9)}>
      <Path d="M9.4 7.6a2.6 2.6 0 1 1 5.2 0" />
      <Path d="M8.4 7.6h7.2l3 12.4a1 1 0 0 1-1 1.2H6.4a1 1 0 0 1-1-1.2z" />
    </Svg>
  );
}

/** Ruler used by the dimensions field. */
export function RulerGlyph({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...line(color, 1.8)}>
      <Path d="M4.4 16.9 16.9 4.4a2 2 0 0 1 2.8 0l1.9 1.9a2 2 0 0 1 0 2.8L9.1 21.6a2 2 0 0 1-2.8 0l-1.9-1.9a2 2 0 0 1 0-2.8z" />
      <Path d="M9 12.3l1.8 1.8M12 9.3l1.2 1.2M15 6.3l1.8 1.8" />
    </Svg>
  );
}

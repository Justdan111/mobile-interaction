import Svg, {
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Stop,
} from 'react-native-svg';

/**
 * The taped cardboard parcel used on every shipment card: an isometric box
 * with a red tape strip that runs over the lid and folds down the right face,
 * plus the printed "this way up" / "fragile" handling marks on the left face.
 */

const VB_W = 116;
const VB_H = 134;

type P = { x: number; y: number };

// Lid rhombus.
const T: P = { x: 58, y: 4 }; // back corner
const R: P = { x: 114, y: 36 }; // right corner
const B: P = { x: 58, y: 68 }; // front corner (nearest the viewer)
const L: P = { x: 2, y: 36 }; // left corner
const DROP = 56; // how far the vertical faces fall

const pts = (...v: P[]) => v.map((q) => `${q.x.toFixed(2)},${q.y.toFixed(2)}`).join(' ');
const line = (...v: P[]) => v.map((q, i) => `${i ? 'L' : 'M'}${q.x} ${q.y}`).join(' ');
const down = (v: P, d = DROP): P => ({ x: v.x, y: v.y + d });
const mix = (a: P, b: P, k: number): P => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });

// Tape strip: runs parallel to the T→R edge, entering across the T→L edge.
const SHIFT = { x: R.x - T.x, y: R.y - T.y };
const shift = (v: P): P => ({ x: v.x + SHIFT.x, y: v.y + SHIFT.y });
const TAPE_A = mix(T, L, 0.3);
const TAPE_B = mix(T, L, 0.58);
const TAPE_A2 = shift(TAPE_A);
const TAPE_B2 = shift(TAPE_B);

export function BoxArt({ width = 105, height = 121 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${VB_W} ${VB_H}`}>
      <Defs>
        <LinearGradient id="bTop" x1="0" y1="0" x2="0.7" y2="1">
          <Stop offset="0" stopColor="#E2BC8D" />
          <Stop offset="0.55" stopColor="#D2A473" />
          <Stop offset="1" stopColor="#BE9461" />
        </LinearGradient>
        <LinearGradient id="bLeft" x1="0" y1="0" x2="0.25" y2="1">
          <Stop offset="0" stopColor="#C0966A" />
          <Stop offset="0.55" stopColor="#B08557" />
          <Stop offset="1" stopColor="#9A7248" />
        </LinearGradient>
        <LinearGradient id="bRight" x1="0.1" y1="0" x2="0.9" y2="1">
          <Stop offset="0" stopColor="#A87C4D" />
          <Stop offset="0.5" stopColor="#96693F" />
          <Stop offset="1" stopColor="#815831" />
        </LinearGradient>
        <LinearGradient id="bTape" x1="0" y1="0" x2="1" y2="0.6">
          <Stop offset="0" stopColor="#E14435" />
          <Stop offset="0.5" stopColor="#CE3428" />
          <Stop offset="1" stopColor="#B72C21" />
        </LinearGradient>
        <RadialGradient id="bShadow" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#5A4227" stopOpacity={0.24} />
          <Stop offset="0.6" stopColor="#5A4227" stopOpacity={0.09} />
          <Stop offset="1" stopColor="#5A4227" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* contact shadow */}
      <Ellipse cx={66} cy={127} rx={44} ry={8} fill="url(#bShadow)" />

      {/* ── faces ───────────────────────────────────────────────────────── */}
      <Polygon points={pts(L, B, down(B), down(L))} fill="url(#bLeft)" />
      <Polygon points={pts(B, R, down(R), down(B))} fill="url(#bRight)" />
      <Polygon points={pts(T, R, B, L)} fill="url(#bTop)" />

      {/* ── tape over the lid, folding down the right face ──────────────── */}
      <Polygon points={pts(TAPE_A, TAPE_A2, TAPE_B2, TAPE_B)} fill="url(#bTape)" />
      <Polygon
        points={pts(
          TAPE_B2,
          TAPE_A2,
          { x: TAPE_A2.x, y: TAPE_A2.y + 22 },
          { x: TAPE_B2.x, y: TAPE_B2.y + 27 }
        )}
        fill="#B8301F"
      />
      <Path d={line(TAPE_B2, TAPE_A2)} stroke="#EE5140" strokeWidth={1.3} opacity={0.55} />

      {/* ── edge definition ─────────────────────────────────────────────── */}
      <Path d={line(L, B, R)} stroke="#7E5A32" strokeWidth={1.2} opacity={0.4} fill="none" />
      <Path d={line(B, down(B))} stroke="#7A5730" strokeWidth={1.1} opacity={0.35} />
      <Path d={line(T, L)} stroke="#F0CFA4" strokeWidth={1} opacity={0.5} fill="none" />

      {/* ── handling marks on the left face ─────────────────────────────── */}
      <G
        transform="translate(8 16) scale(0.7)"
        opacity={0.6}
        fill="none"
        stroke="#6B4A2A"
        strokeWidth={1.9}
        strokeLinecap="round"
      >
        {/* two "this way up" arrows sitting on a baseline */}
        <Path d="M14 84 L14 72 M11 75.5 L14 71.5 L17 75.5" />
        <Path d="M23 87 L23 75 M20 78.5 L23 74.5 L26 78.5" />
        <Path d="M11 88 L18 89.2 M20 91 L27 92.2" />
        {/* fragile glass */}
        <Path d="M34.5 83 L34.5 95.5 M30 98 L39 99.4" />
        <Path d="M29.5 79 L39.5 80.6 L37 88 L33.5 87.4 Z" />
      </G>
    </Svg>
  );
}

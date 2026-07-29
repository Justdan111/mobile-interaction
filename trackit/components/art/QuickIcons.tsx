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

/**
 * The four quick-action marks. They read as small 3D renders in the design, so
 * each is built from flat facets plus a light-to-dark gradient rather than a
 * line icon — the highlight always falls on the top-left.
 */

export type QuickIconProps = { size?: number };

const VB = 40;

const shadow = (cx = 20, cy = 35.5, rx = 12) => (
  <Ellipse cx={cx} cy={cy} rx={rx} ry={2.2} fill="#2E7A3E" opacity={0.1} />
);

/* ─────────────────────────────── Order ─────────────────────────────────── */

export function OrderIcon({ size = 34 }: QuickIconProps) {
  // isometric carton
  const T = '20,4';
  const R = '35,12.5';
  const B = '20,21';
  const L = '5,12.5';
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
      <Defs>
        <LinearGradient id="qoTop" x1="0" y1="0" x2="0.6" y2="1">
          <Stop offset="0" stopColor="#B6F5C6" />
          <Stop offset="1" stopColor="#84E39C" />
        </LinearGradient>
        <LinearGradient id="qoLeft" x1="0" y1="0" x2="0.3" y2="1">
          <Stop offset="0" stopColor="#54C56C" />
          <Stop offset="1" stopColor="#31A04D" />
        </LinearGradient>
        <LinearGradient id="qoRight" x1="0" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#77DE8C" />
          <Stop offset="1" stopColor="#45B85F" />
        </LinearGradient>
      </Defs>
      {shadow(20, 34.5, 11)}
      <Polygon points={`${L} ${B} 20,33 5,24.5`} fill="url(#qoLeft)" />
      <Polygon points={`${B} ${R} 35,24.5 20,33`} fill="url(#qoRight)" />
      <Polygon points={`${T} ${R} ${B} ${L}`} fill="url(#qoTop)" />
      {/* tape band across the lid */}
      <Polygon points="13.4,7.6 28.4,16.1 24.6,18.3 9.6,9.8" fill="#DFFFE8" opacity={0.85} />
      {/* small shipping label on the right face */}
      <Polygon points="29,17.6 33.6,15 33.6,18.4 29,21" fill="#EAFFF0" opacity={0.9} />
      {/* recycle mark */}
      <G opacity={0.85}>
        <Path
          d="M26.4 23.6 L28.5 22.4 L28.5 24.8 Z M29.6 24.2 L31.1 25.7 L29 26.9 Z M27.9 27.4 L27.9 29.2 L25.8 28 Z"
          fill="#1F6B31"
        />
        <Circle cx={27.6} cy={25.7} r={2.6} stroke="#1F6B31" strokeWidth={0.8} fill="none" />
      </G>
      {/* front-left crease */}
      <Path d="M20 21 L20 33" stroke="#2A8C43" strokeWidth={0.7} opacity={0.5} />
    </Svg>
  );
}

/* ───────────────────────────── Shipping cost ───────────────────────────── */

export function ShippingCostIcon({ size = 34 }: QuickIconProps) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
      <Defs>
        <LinearGradient id="qcWeight" x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor="#565E66" />
          <Stop offset="0.5" stopColor="#3B4249" />
          <Stop offset="1" stopColor="#252A30" />
        </LinearGradient>
        <LinearGradient id="qcNote" x1="0" y1="0" x2="0.3" y2="1">
          <Stop offset="0" stopColor="#8AE7A0" />
          <Stop offset="0.5" stopColor="#5ACD74" />
          <Stop offset="1" stopColor="#33A64E" />
        </LinearGradient>
        <LinearGradient id="qcCoin" x1="0" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#A9F0BC" />
          <Stop offset="1" stopColor="#3FB259" />
        </LinearGradient>
      </Defs>
      {shadow(20, 35, 12)}

      {/* weight handle */}
      <Path
        d="M16.6 9.2 A3.6 3.6 0 0 1 23.4 9.2"
        stroke="#3B4249"
        strokeWidth={1.9}
        fill="none"
        strokeLinecap="round"
      />
      {/* weight body */}
      <Path d="M14.6 9.6 L25.4 9.6 L28.6 21.4 L11.4 21.4 Z" fill="url(#qcWeight)" />
      <Path d="M14.6 9.6 L25.4 9.6 L25.9 11.4 L14.1 11.4 Z" fill="#FFFFFF" opacity={0.12} />
      <SvgText
        x={20}
        y={17.6}
        fill="#FFFFFF"
        fontSize={5}
        fontWeight="700"
        textAnchor="middle"
        letterSpacing={0.2}
      >
        COST
      </SvgText>

      {/* banknote stack */}
      <Rect x={6.5} y={22.2} width={27} height={8.4} rx={1.6} fill="#2F9D4A" opacity={0.55} />
      <Rect x={5.4} y={20.4} width={29.2} height={9.2} rx={1.8} fill="url(#qcNote)" />
      <Rect
        x={7.6}
        y={22.2}
        width={24.8}
        height={5.6}
        rx={1}
        stroke="#EAFFF0"
        strokeWidth={0.7}
        opacity={0.5}
        fill="none"
      />

      {/* coin */}
      <Circle cx={20} cy={25.4} r={5.4} fill="url(#qcCoin)" />
      <Circle cx={20} cy={25.4} r={4.2} stroke="#FFFFFF" strokeWidth={0.7} opacity={0.75} fill="none" />
      <SvgText x={20} y={27.7} fill="#FFFFFF" fontSize={6.4} fontWeight="700" textAnchor="middle">
        $
      </SvgText>
    </Svg>
  );
}

/* ────────────────────────────── Call center ────────────────────────────── */

export function CallCenterIcon({ size = 34 }: QuickIconProps) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
      <Defs>
        <LinearGradient id="qhBand" x1="0" y1="0" x2="1" y2="0.6">
          <Stop offset="0" stopColor="#7FE096" />
          <Stop offset="0.5" stopColor="#4CC066" />
          <Stop offset="1" stopColor="#2E9A48" />
        </LinearGradient>
        <LinearGradient id="qhCup" x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor="#8CE9A2" />
          <Stop offset="1" stopColor="#3AAE54" />
        </LinearGradient>
        <LinearGradient id="qhBubble" x1="0" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#6FD988" />
          <Stop offset="1" stopColor="#2E9A4A" />
        </LinearGradient>
      </Defs>
      {shadow(20, 34.8, 11)}

      {/* headband */}
      <Path
        d="M8.4 25 V19.6 A11.6 11.6 0 0 1 31.6 19.6 V25"
        stroke="url(#qhBand)"
        strokeWidth={3.4}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M10.4 20.4 A9.8 9.8 0 0 1 20 11.2"
        stroke="#DFFFE9"
        strokeWidth={1.1}
        fill="none"
        strokeLinecap="round"
        opacity={0.75}
      />

      {/* ear cups */}
      <Rect x={4.6} y={20.4} width={7.4} height={11.4} rx={3.5} fill="url(#qhCup)" />
      <Rect x={28} y={20.4} width={7.4} height={11.4} rx={3.5} fill="url(#qhCup)" />
      <Rect x={6.2} y={22} width={2.4} height={8} rx={1.2} fill="#EAFFF0" opacity={0.45} />

      {/* chat bubble with the mic boom */}
      <Path
        d="M15.4 30.6 Q12.4 31 11.6 33.6 Q13.8 32.2 16.6 32.2"
        stroke="#DFFFE9"
        strokeWidth={1.2}
        fill="none"
        strokeLinecap="round"
        opacity={0.8}
      />
      <Path
        d="M13 21.6 h13.4 a3 3 0 0 1 3 3 v4.6 a3 3 0 0 1 -3 3 h-8.2 l-3.6 3 v-3 h-1.6 a3 3 0 0 1 -3 -3 v-4.6 a3 3 0 0 1 3 -3 z"
        fill="url(#qhBubble)"
      />
      <Circle cx={17.4} cy={26.9} r={1.1} fill="#FFFFFF" />
      <Circle cx={21} cy={26.9} r={1.1} fill="#FFFFFF" />
      <Circle cx={24.6} cy={26.9} r={1.1} fill="#FFFFFF" />
    </Svg>
  );
}

/* ───────────────────────────── Check receipt ───────────────────────────── */

export function CheckReceiptIcon({ size = 34 }: QuickIconProps) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
      <Defs>
        <LinearGradient id="qrDoc" x1="0" y1="0" x2="0.55" y2="1">
          <Stop offset="0" stopColor="#4FC96C" />
          <Stop offset="0.5" stopColor="#33AE52" />
          <Stop offset="1" stopColor="#1E8B3E" />
        </LinearGradient>
        <LinearGradient id="qrBadge" x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor="#8CE9A4" />
          <Stop offset="1" stopColor="#35B255" />
        </LinearGradient>
      </Defs>
      {shadow(20, 35, 11)}

      {/* sheet with a folded top-right corner */}
      <Path
        d="M9 7.4 a2.6 2.6 0 0 1 2.6 -2.6 h12.2 l7.2 6.8 v18.6 a2.6 2.6 0 0 1 -2.6 2.6 h-16.8 a2.6 2.6 0 0 1 -2.6 -2.6 z"
        fill="url(#qrDoc)"
      />
      <Path d="M23.8 4.8 v4.2 a2.6 2.6 0 0 0 2.6 2.6 h4.6 z" fill="#B9F2C7" opacity={0.9} />

      {/* checked line items */}
      {[11.6, 18.2, 24.8].map((y, i) => (
        <G key={y}>
          <Rect x={11.8} y={y} width={5} height={5} rx={1.3} fill="#D6FBE0" opacity={0.92} />
          <Path
            d={`M13 ${y + 2.6} l1.3 1.3 l2.3 -2.6`}
            stroke="#1E8B3E"
            strokeWidth={1.05}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Rect
            x={18.4}
            y={y + 0.8}
            width={i === 0 ? 5.6 : 10.2}
            height={1.35}
            rx={0.67}
            fill="#EAFFF0"
            opacity={0.85}
          />
          <Rect
            x={18.4}
            y={y + 3}
            width={i === 0 ? 4 : 7.4}
            height={1.35}
            rx={0.67}
            fill="#EAFFF0"
            opacity={0.55}
          />
        </G>
      ))}

      {/* approved badge */}
      <Circle cx={29.6} cy={28.4} r={6.4} fill="url(#qrBadge)" />
      <Path
        d="M26.6 28.5 l2.2 2.2 l4 -4.4"
        stroke="#FFFFFF"
        strokeWidth={1.9}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

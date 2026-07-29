import Svg, { Circle, Defs, G, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';

/**
 * The translucent marks that sit on the right of each promo card. They are
 * always drawn in white at low opacity so one component works on every card
 * colour, and both overrun the card so it clips them exactly as in the design.
 */

/** Coupon ticket with a perforated stub and a big percent mark. */
export function TicketMark({ width = 150, height = 150 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 150 150">
      <Defs>
        <LinearGradient id="tkFront" x1="0" y1="0" x2="0.9" y2="0.8">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.42} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0.16} />
        </LinearGradient>
        <LinearGradient id="tkBack" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.26} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0.1} />
        </LinearGradient>
      </Defs>

      {/* ticket tucked in behind, rotated out of the stack */}
      <G transform="rotate(-27 96 34)">
        <Path
          d="M40 12h108a10 10 0 0 1 10 10v46a10 10 0 0 1-10 10H40a10 10 0 0 1-10-10V22a10 10 0 0 1 10-10z"
          fill="url(#tkBack)"
        />
      </G>

      {/* front ticket — runs past the card edges */}
      <Path
        d="M37 46h150v118H37a12 12 0 0 1-12-12V58a12 12 0 0 1 12-12z"
        fill="url(#tkFront)"
      />

      {/* perforation */}
      <Path
        d="M114 46V164"
        stroke="#FFFFFF"
        strokeOpacity={0.85}
        strokeWidth={3.2}
        strokeDasharray="8 7"
        strokeLinecap="round"
      />

      {/* percent mark */}
      <G stroke="#FFFFFF" strokeOpacity={0.9} fill="none" strokeLinecap="round">
        <Circle cx={48} cy={79} r={9} strokeWidth={4.6} />
        <Circle cx={83} cy={100} r={9} strokeWidth={4.6} />
        <Path d="M91 73 44 108" strokeWidth={5.2} />
      </G>
    </Svg>
  );
}

/** Open parcel drawn in silver — used on the dark promo cards. */
export function ParcelMark({ width = 160, height = 160 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 160 160">
      <Defs>
        <LinearGradient id="pmLeft" x1="0" y1="0" x2="0.3" y2="1">
          <Stop offset="0" stopColor="#F4F6F7" />
          <Stop offset="1" stopColor="#9EA4A8" />
        </LinearGradient>
        <LinearGradient id="pmRight" x1="0.2" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#D6DADC" />
          <Stop offset="1" stopColor="#7E8488" />
        </LinearGradient>
        <LinearGradient id="pmFlap" x1="0" y1="0" x2="0.7" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#B6BBBE" />
        </LinearGradient>
        <LinearGradient id="pmFlapDim" x1="0" y1="0" x2="0.7" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.62} />
          <Stop offset="1" stopColor="#9BA1A5" stopOpacity={0.45} />
        </LinearGradient>
      </Defs>

      {/* the two flaps folded away from the viewer, in shadow */}
      <Polygon points="29,68.9 71,45.1 71.8,10.7 29.8,34.5" fill="url(#pmFlapDim)" />
      <Polygon points="89,102.9 131,79.1 130.2,113.5 88.2,137.3" fill="url(#pmFlapDim)" />

      {/* box body — the open rim leaves the card colour showing through */}
      <Polygon points="20,74 80,108 80,154 20,120" fill="url(#pmLeft)" />
      <Polygon points="80,108 140,74 140,120 80,154" fill="url(#pmRight)" />

      {/* the two lit flaps */}
      <Polygon points="29,79.1 71,102.9 71.8,137.3 29.8,113.5" fill="url(#pmFlap)" />
      <Polygon points="89,45.1 131,68.9 130.2,34.5 88.2,10.7" fill="url(#pmFlap)" />

      {/* handle slot punched in the right face */}
      <Rect x={112} y={100} width={13} height={32} rx={6.5} fill="#FFFFFF" opacity={0.9} />
    </Svg>
  );
}

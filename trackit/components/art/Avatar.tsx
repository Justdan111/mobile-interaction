import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

/**
 * Profile portrait for the header. Drawn rather than shipped as a bitmap so it
 * stays sharp at any density and the app has no image dependency.
 */
export function Avatar({ size = 52 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 52 52">
      <Defs>
        <ClipPath id="avClip">
          <Circle cx={26} cy={26} r={26} />
        </ClipPath>
        <LinearGradient id="avBg" x1="0" y1="0" x2="0.6" y2="1">
          <Stop offset="0" stopColor="#E6EBEE" />
          <Stop offset="1" stopColor="#C4CFD5" />
        </LinearGradient>
        <LinearGradient id="avSkin" x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#EBB68F" />
          <Stop offset="1" stopColor="#C88C63" />
        </LinearGradient>
        <LinearGradient id="avShirt" x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor="#2B333C" />
          <Stop offset="1" stopColor="#141A21" />
        </LinearGradient>
      </Defs>

      <G clipPath="url(#avClip)">
        <Rect x={0} y={0} width={52} height={52} fill="url(#avBg)" />

        {/* shoulders */}
        <Path d="M-2 52c2-9.5 9.6-13.6 17-15.4h22c7.4 1.8 15 5.9 17 15.4z" fill="url(#avShirt)" />
        {/* collar */}
        <Path d="M19.6 37.4 26 43.4l6.4-6c-2 1.5-4.1 2.2-6.4 2.2s-4.4-.7-6.4-2.2z" fill="#0E1319" />

        {/* neck */}
        <Path d="M20.6 29h10.8v9.4c0 2.2-2.4 3.6-5.4 3.6s-5.4-1.4-5.4-3.6z" fill="#C0835B" />

        {/* ears */}
        <Ellipse cx={15.4} cy={24.6} rx={2.2} ry={3} fill="#D69A70" />
        <Ellipse cx={36.6} cy={24.6} rx={2.2} ry={3} fill="#D69A70" />

        {/* head */}
        <Path
          d="M26 8.6c6.4 0 10.8 4.4 10.8 11.2 0 8-4.6 14.6-10.8 14.6S15.2 27.8 15.2 19.8C15.2 13 19.6 8.6 26 8.6z"
          fill="url(#avSkin)"
        />

        {/* hair — short, swept to the right */}
        <Path
          d="M26 6.4c7.2 0 11.6 4.4 11.4 11.4-.1 2.2-.5 3.6-.9 4.6-.3-2.5-.6-4.3-1.5-5.6-3 .6-6.6.3-9.6-1.1-1.7 1.9-4.4 3.2-7.4 3.6-.7 1-1 2-1.3 3.1-.6-1.2-1.1-3-1.2-5C15.3 11 18.8 6.4 26 6.4z"
          fill="#241A16"
        />
        <Path
          d="M16.6 18.4c2.8-.6 5.1-1.9 6.6-3.6-1.7 3-4 4.6-6.3 5.3z"
          fill="#3A2A22"
          opacity={0.8}
        />

        {/* brows + eyes — kept soft so the mark reads as a photo thumbnail */}
        <Path
          d="M20.6 22.6c1-.6 2.3-.6 3.3-.1M28.1 22.5c1-.5 2.3-.5 3.3.1"
          stroke="#3B2A20"
          strokeWidth={0.85}
          strokeLinecap="round"
          opacity={0.75}
          fill="none"
        />
        <Ellipse cx={22.2} cy={25} rx={0.95} ry={1.05} fill="#33231A" opacity={0.9} />
        <Ellipse cx={29.8} cy={25} rx={0.95} ry={1.05} fill="#33231A" opacity={0.9} />

        {/* nose + mouth */}
        <Path
          d="M26 26v2.6c0 .4-.3.7-.8.8"
          stroke="#A9714B"
          strokeWidth={0.7}
          strokeLinecap="round"
          opacity={0.65}
          fill="none"
        />
        <Path
          d="M24.2 31.2c1.2.6 2.4.6 3.6 0"
          stroke="#96603E"
          strokeWidth={0.85}
          strokeLinecap="round"
          opacity={0.75}
          fill="none"
        />
      </G>
    </Svg>
  );
}

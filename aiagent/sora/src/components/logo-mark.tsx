import Svg, { Circle, Path } from 'react-native-svg';

/**
 * Circular black badge with a white spiral "G" glyph, matching the
 * app mark in the header.
 */
export function LogoMark({ size = 46 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle cx={24} cy={24} r={23} fill="#0B0906" />
      <Circle cx={24} cy={24} r={22.5} stroke="rgba(255,255,255,0.25)" strokeWidth={1} fill="none" />
      {/* Outer arc of the spiral, open toward the right */}
      <Path
        d="M31.5 11.5 A14.5 14.5 0 1 0 38.5 24"
        stroke="#FFFFFF"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      {/* Inner arc curling into the center */}
      <Path
        d="M27 17.5 A7.5 7.5 0 1 0 31.5 24 L 24.5 24"
        stroke="#FFFFFF"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

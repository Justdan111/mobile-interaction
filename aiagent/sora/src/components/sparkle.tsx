import Svg, { Path } from 'react-native-svg';

const STAR =
  'M12 1 C12.9 7.1 16.9 11.1 23 12 C16.9 12.9 12.9 16.9 12 23 C11.1 16.9 7.1 12.9 1 12 C7.1 11.1 11.1 7.1 12 1 Z';

const SMALL_STAR =
  'M4 0 C4.35 2.4 5.6 3.65 8 4 C5.6 4.35 4.35 5.6 4 8 C3.65 5.6 2.4 4.35 0 4 C2.4 3.65 3.65 2.4 4 0 Z';

/**
 * The AI sparkle: a large four-point star with a small companion star
 * at its upper right, as on the suggestion cards.
 */
export function Sparkle({ size = 26, color = '#FFFFFF' }: { size?: number; color?: string }) {
  const scale = size / 30;
  return (
    <Svg width={30 * scale} height={26 * scale} viewBox="0 0 30 26">
      <Path d={STAR} fill={color} transform="translate(0 2)" />
      <Path d={SMALL_STAR} fill={color} transform="translate(22 0)" />
    </Svg>
  );
}

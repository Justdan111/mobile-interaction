import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

type OrbProps = {
  size?: number;
  /** Renders the soft halo around the sphere (used on the voice screen). */
  glow?: boolean;
};

/**
 * The glowing 3D orange sphere: bright cream highlight off-center at the
 * top deepening to a dark rust rim, with an optional outer halo.
 */
export function Orb({ size = 280, glow = false }: OrbProps) {
  // The sphere occupies the middle 2/3 of the canvas when glowing so the
  // halo has room to fade out.
  const canvas = glow ? size * 1.5 : size;
  const c = canvas / 2;
  const r = size / 2;
  const id = glow ? 'lg' : 'sm';

  return (
    <Svg width={canvas} height={canvas} viewBox={`0 0 ${canvas} ${canvas}`}>
      <Defs>
        <RadialGradient id={`orb-halo-${id}`} cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="60%" stopColor="#FF7A1A" stopOpacity="0.35" />
          <Stop offset="80%" stopColor="#FF7A1A" stopOpacity="0.12" />
          <Stop offset="100%" stopColor="#FF7A1A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={`orb-body-${id}`} cx="42%" cy="34%" rx="72%" ry="72%">
          <Stop offset="0%" stopColor="#FFE9C4" />
          <Stop offset="22%" stopColor="#FFC276" />
          <Stop offset="48%" stopColor="#F08228" />
          <Stop offset="74%" stopColor="#B84A0C" />
          <Stop offset="100%" stopColor="#571C04" />
        </RadialGradient>
        <RadialGradient id={`orb-shade-${id}`} cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="72%" stopColor="#2A0E02" stopOpacity="0" />
          <Stop offset="100%" stopColor="#2A0E02" stopOpacity="0.55" />
        </RadialGradient>
      </Defs>
      {glow ? <Circle cx={c} cy={c} r={canvas / 2} fill={`url(#orb-halo-${id})`} /> : null}
      <Circle cx={c} cy={c} r={r} fill={`url(#orb-body-${id})`} />
      <Circle cx={c} cy={c} r={r} fill={`url(#orb-shade-${id})`} />
    </Svg>
  );
}

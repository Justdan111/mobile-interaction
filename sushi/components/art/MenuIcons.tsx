import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import type { CategoryId } from '@/data/menu';

type IconProps = { size?: number; color: string };

/** Nigiri — a slab of neta draped over a pressed block of rice. */
function NigiriIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3.6 12.2c1.9-2.6 5-4.2 8.4-4.2s6.5 1.6 8.4 4.2c.4.5 0 1.2-.6 1.2H4.2c-.6 0-1-.7-.6-1.2Z"
        fill={color}
      />
      <Path
        d="M4.4 15.1h15.2c.7 0 1.2.6 1.2 1.3v.3c0 .9-.7 1.6-1.6 1.6H4.8c-.9 0-1.6-.7-1.6-1.6v-.3c0-.7.5-1.3 1.2-1.3Z"
        fill={color}
        opacity={0.55}
      />
    </Svg>
  );
}

/** Maki — two cut rolls seen end on. */
function MakiIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="8.4" cy="9.6" r="4.9" fill={color} opacity={0.55} />
      <Circle cx="8.4" cy="9.6" r="1.9" fill={color} />
      <Circle cx="15.2" cy="15.2" r="5.6" fill={color} opacity={0.85} />
      <Circle cx="15.2" cy="15.2" r="2.2" fill={color} />
    </Svg>
  );
}

/** Sashimi — three slices fanned on a board. */
function SashimiIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G fill={color}>
        <Path d="M4.6 8.2h14.8c.6 0 1 .5 1 1.1s-.4 1.1-1 1.1H4.6c-.6 0-1-.5-1-1.1s.4-1.1 1-1.1Z" />
        <Path
          d="M6 11.6h12c.6 0 1 .5 1 1.1s-.4 1.1-1 1.1H6c-.6 0-1-.5-1-1.1s.4-1.1 1-1.1Z"
          opacity={0.7}
        />
      </G>
      <Path
        d="M3.4 16.2h17.2c.6 0 1.1.5 1.1 1.1s-.5 1.1-1.1 1.1H3.4c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1Z"
        fill={color}
        opacity={0.45}
      />
    </Svg>
  );
}

/** Special — a single piece with the chef's flourish over it. */
function SpecialIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3.2 14.4c2.1-3 5.4-4.8 8.8-4.8s6.7 1.8 8.8 4.8c.4.6 0 1.4-.7 1.4H3.9c-.7 0-1.1-.8-.7-1.4Z"
        fill={color}
      />
      <Path
        d="M6.8 7.6c1.4-1.7 3.4-2.6 5.6-2.6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
        opacity={0.7}
      />
      <Circle cx="17.4" cy="6.6" r="1.6" fill={color} opacity={0.8} />
    </Svg>
  );
}

/** Sets — a bento box with a carry handle. */
function SetsIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M9 5.4c0-.7.6-1.3 1.3-1.3h3.4c.7 0 1.3.6 1.3 1.3v1.4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
      <Rect x="3.2" y="7" width="17.6" height="12.4" rx="2.4" fill={color} opacity={0.55} />
      <Path
        d="M12 7v12.4"
        stroke={color}
        strokeWidth={1.4}
        opacity={0.9}
      />
      <Path
        d="M3.2 13.2h17.6"
        stroke={color}
        strokeWidth={1.4}
        opacity={0.9}
      />
    </Svg>
  );
}

const byCategory: Record<CategoryId, (p: IconProps) => React.JSX.Element> = {
  nigiri: NigiriIcon,
  maki: MakiIcon,
  sashimi: SashimiIcon,
  special: SpecialIcon,
  sets: SetsIcon,
};

export function CategoryIcon({
  category,
  size,
  color,
}: { category: CategoryId } & IconProps) {
  const Icon = byCategory[category];
  return <Icon size={size} color={color} />;
}

export function SearchIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle
        cx="10.6"
        cy="10.6"
        r="6.4"
        stroke={color}
        strokeWidth={1.9}
        fill="none"
      />
      <Path
        d="M15.4 15.4 20 20"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ArrowRightIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4.5 12h14M12.8 6l6 6-6 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function ArrowLeftIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M19.5 12h-14M11.2 6l-6 6 6 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function HeartIcon({ size = 22, color, filled = true }: IconProps & { filled?: boolean }) {
  const d =
    'M12 20.4s-7.8-4.6-7.8-9.9A4.7 4.7 0 0 1 12 7.4a4.7 4.7 0 0 1 7.8 3.1c0 5.3-7.8 9.9-7.8 9.9Z';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={d}
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={filled ? 0 : 1.9}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ListIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G stroke={color} strokeWidth={1.9} strokeLinecap="round">
        <Path d="M9 7h11M9 12h11M9 17h11" />
        <Path d="M4.4 7h.02M4.4 12h.02M4.4 17h.02" strokeWidth={2.4} />
      </G>
    </Svg>
  );
}

export function MinusIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5.5 12h13" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

export function PlusIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 5.5v13M5.5 12h13"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

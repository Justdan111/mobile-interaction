import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '@/theme/colors';

export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export type BrandId = 'volara' | 'kestrel' | 'ardent' | 'sable';

/**
 * Every glyph is drawn in a 24x24 box and scaled by `size`, so stroke weights
 * stay visually consistent when icons sit next to each other at different
 * sizes. Outline icons take `strokeWidth`; solid ones ignore it.
 */
const BOX = 24;

function frame(size: number) {
  return { width: size, height: size, viewBox: `0 0 ${BOX} ${BOX}` };
}

export function MenuIcon({ size = 26, color = colors.ink, strokeWidth = 2.4 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="M3 6.5h18M3 12h18M3 17.5h18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** The comp's bell carries an unread dot; `dot` colours it, `null` hides it. */
export function BellIcon({
  size = 26,
  color = colors.ink,
  strokeWidth = 2,
  dot = colors.ember,
}: IconProps & { dot?: string | null }) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="M12 3.2a6 6 0 0 0-6 6v3.1L4.5 15.4a.8.8 0 0 0 .72 1.16h13.56a.8.8 0 0 0 .72-1.16L18 12.3V9.2a6 6 0 0 0-6-6Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M9.7 19.2a2.5 2.5 0 0 0 4.6 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      {dot ? <Circle cx={17.6} cy={6.4} r={3.1} fill={dot} /> : null}
    </Svg>
  );
}

export function SearchIcon({ size = 22, color = colors.muted, strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Circle cx={10.6} cy={10.6} r={6.4} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Path
        d="m15.4 15.4 4.3 4.3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const HEART =
  'M12 20.4S3.6 15.3 3.6 9.6a4.6 4.6 0 0 1 8.4-2.6 4.6 4.6 0 0 1 8.4 2.6c0 5.7-8.4 10.8-8.4 10.8Z';

export function HeartIcon({ size = 22, color = colors.ink, strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path d={HEART} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function HeartFilledIcon({ size = 22, color = colors.ember }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path d={HEART} fill={color} />
    </Svg>
  );
}

export function StarIcon({ size = 16, color = colors.star }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="m12 3.1 2.65 5.37 5.93.86-4.29 4.18 1.01 5.9L12 16.62l-5.3 2.79 1.01-5.9-4.29-4.18 5.93-.86L12 3.1Z"
        fill={color}
      />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 24, color = colors.teal, strokeWidth = 2.4 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="M15 4.5 7.5 12l7.5 7.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function ChevronUpIcon({ size = 20, color = colors.muted, strokeWidth = 2.2 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="m5 15 7-7 7 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function MinusIcon({ size = 18, color = colors.surface, strokeWidth = 2.4 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path d="M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export function PlusIcon({ size = 18, color = colors.surface, strokeWidth = 2.4 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CloseIcon({ size = 24, color = colors.surface, strokeWidth = 2.2 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="M6 6l12 12M18 6L6 18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Solid — the drawer's active row uses the filled house in the comp. */
export function HomeIcon({ size = 24, color = colors.surface, strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="M3.4 10.4 12 3.6l8.6 6.8v8.4a1.6 1.6 0 0 1-1.6 1.6h-3.6v-5.6h-6.8V20.4H5a1.6 1.6 0 0 1-1.6-1.6v-8.4Z"
        fill={color}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CartIcon({ size = 24, color = colors.surface, strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="M3 4.2h2.2l1.1 2m0 0 1.9 7.6h9.2l2.1-7.6H6.2Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx={9.4} cy={18.6} r={1.7} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Circle cx={16.6} cy={18.6} r={1.7} stroke={color} strokeWidth={strokeWidth} fill="none" />
    </Svg>
  );
}

export function MessageIcon({ size = 24, color = colors.surface, strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="M4 6.6a2.4 2.4 0 0 1 2.4-2.4h11.2A2.4 2.4 0 0 1 20 6.6v7.6a2.4 2.4 0 0 1-2.4 2.4H9.6L5.2 20v-3.4H6.4A2.4 2.4 0 0 1 4 14.2V6.6Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M8.4 9.2h7.2M8.4 12.4h4.4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function AccountIcon({ size = 24, color = colors.surface, strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Circle cx={12} cy={8} r={3.8} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Path
        d="M4.8 20.2c0-3.6 3.2-5.8 7.2-5.8s7.2 2.2 7.2 5.8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function SettingIcon({ size = 24, color = colors.surface, strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Circle cx={12} cy={12} r={3.2} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Path
        d="M12 2.8l1.5 2.1 2.5-.6 .6 2.5 2.1 1.5-1.2 2.3 1.2 2.3-2.1 1.5-.6 2.5-2.5-.6L12 21.2l-1.5-2.1-2.5.6-.6-2.5-2.1-1.5 1.2-2.3-1.2-2.3 2.1-1.5.6-2.5 2.5.6L12 2.8Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function SignOutIcon({ size = 24, color = colors.surface, strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg {...frame(size)}>
      <Path
        d="M14.4 4.4H7.2A2.4 2.4 0 0 0 4.8 6.8v10.4a2.4 2.4 0 0 0 2.4 2.4h7.2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M13.6 12h6.4m0 0-2.6-2.6M20 12l-2.6 2.6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/**
 * The marker underline beneath "discount" in the voucher panel. Two strokes,
 * the second shorter and offset — a single clean curve reads as a rule rather
 * than something drawn by hand.
 */
export function SwooshUnderline({
  width = 150,
  color = colors.surface,
}: {
  width?: number;
  color?: string;
}) {
  const height = width * 0.13;
  return (
    <Svg width={width} height={height} viewBox="0 0 150 20">
      <Path
        d="M3 12.5C28 5.5 78 3 147 8"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M12 17.5C38 12.5 76 11 121 14.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.75}
        fill="none"
      />
    </Svg>
  );
}

/**
 * Brand marks for the four invented house brands. Each is a mark only — the
 * wordmark beside it is set in Nunito ExtraBold by `CategoryRail`, which is
 * how these would really be built and avoids fabricating letterform outlines.
 */
export function BrandMark({
  brand,
  size = 28,
  color = colors.ink,
}: {
  brand: BrandId;
  size?: number;
  color?: string;
}) {
  switch (brand) {
    case 'volara':
      // A swept quill — the hero brand's mark, always struck in ember.
      return (
        <Svg {...frame(size)}>
          <Path
            d="M2.6 15.8c5.4-6.2 11.6-9.4 18.8-9.9-1.4 5.6-6.2 9.6-13.4 11.2-2.2.5-4 .3-5.4-1.3Z"
            fill={color}
          />
          <Path d="M6.2 18.6c4.6-3.2 9.4-5.6 15.2-6.9" stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'kestrel':
      // Two chevrons meeting — a bird seen head-on.
      return (
        <Svg {...frame(size)}>
          <Path d="M2 8.5 12 15 22 8.5" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M6 14.5 12 18.4l6-3.9" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'ardent':
      // A heavy apex, cut flat across the crossbar.
      return (
        <Svg {...frame(size)}>
          <Path d="M12 3.4 21.4 20.6h-4.6L12 11.2 7.2 20.6H2.6L12 3.4Z" fill={color} />
          <Path d="M7.6 15.4h8.8" stroke={colors.surface} strokeWidth={2.2} strokeLinecap="round" />
        </Svg>
      );
    case 'sable':
      // A compact S held in a rounded square.
      return (
        <Svg {...frame(size)}>
          <Rect x={2.4} y={2.4} width={19.2} height={19.2} rx={5.6} fill={color} />
          <Path
            d="M15.4 8.6c-1-1-2.2-1.4-3.6-1.4-2 0-3.4 1-3.4 2.4 0 3.2 7.2 1.6 7.2 5.4 0 1.8-1.8 3-4 3-1.6 0-3-.5-4-1.6"
            stroke={colors.surface}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      );
  }
}

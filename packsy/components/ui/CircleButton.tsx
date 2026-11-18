import React from 'react';
import { View } from 'react-native';
import { useColors } from '../../theme/ThemeProvider';
import { Icon, type IconName } from './icons';
import { Press } from './Press';

type Props = {
  icon: IconName;
  label: string;
  onPress?: () => void;
  /** Draws the unread dot on the button's shoulder, as on the bell. */
  dot?: boolean;
  size?: number;
  /** `outline` is the hairline ring in the headers; `solid` is a filled disc. */
  variant?: 'outline' | 'solid';
  /** Fill for `solid`, and the surface the icon's cut-outs use. */
  fill: string;
  glyph: string;
};

export function CircleButton({ icon, label, onPress, dot, size = 50, variant = 'outline', fill, glyph }: Props) {
  const C = useColors();
  return (
    <Press
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: C.ring,
        backgroundColor: variant === 'solid' ? fill : 'transparent',
      }}
    >
      <Icon name={icon} color={glyph} surface={fill} size={size * 0.44} />
      {dot ? (
        <View
          style={{
            position: 'absolute',
            top: size * 0.14,
            right: size * 0.2,
            width: 7,
            height: 7,
            borderRadius: 3.5,
            backgroundColor: C.coral,
          }}
        />
      ) : null}
    </Press>
  );
}

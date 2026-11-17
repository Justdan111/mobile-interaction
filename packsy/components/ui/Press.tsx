import React, { useState } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

/**
 * Pressable with a pressed-state style. NativeWind's css-interop wraps
 * Pressable and silently drops a `style` *function* — the button renders
 * with no style at all (seen on Get Started: no white pill, text left-aligned).
 * So the pressed state is tracked here and a plain style object is passed on.
 */
export function Press({
  style,
  pressedStyle,
  onPressIn,
  onPressOut,
  ...rest
}: Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** Merged over `style` while a finger is down. Defaults to a slight shrink. */
  pressedStyle?: StyleProp<ViewStyle>;
}) {
  const [down, setDown] = useState(false);
  return (
    <Pressable
      {...rest}
      onPressIn={(e) => {
        setDown(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setDown(false);
        onPressOut?.(e);
      }}
      style={[style, down ? (pressedStyle ?? { transform: [{ scale: 0.96 }] }) : null]}
    />
  );
}

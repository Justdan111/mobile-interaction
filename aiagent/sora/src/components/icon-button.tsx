import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

type IconButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
};

/**
 * Circular translucent button used for the bell, menu, and attachment
 * controls.
 */
export function IconButton({ children, onPress, size = 44, style, accessibilityLabel }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="items-center justify-center rounded-full border border-hairline bg-surface-chip active:opacity-70"
      style={[{ width: size, height: size }, style]}>
      {children}
    </Pressable>
  );
}

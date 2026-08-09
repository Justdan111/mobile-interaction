import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MenuIcon } from '@/components/icons';
import { MenuSheet } from '@/components/ui/MenuSheet';

/**
 * Title, date line and the round menu button. Identical on all three screens,
 * down to the full stop after the title. The button owns the settings sheet, so
 * every screen gets it without wiring anything up.
 */
export function ScreenHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <View className="flex-row items-start justify-between px-5 pt-[37px]">
        <View>
          <Text
            className="font-inter-bold text-[30px] leading-[34px] text-chalk"
            style={{ letterSpacing: -0.6 }}
          >
            {title}
          </Text>
          <Text
            className="mt-1 font-inter-medium text-[15px] leading-[19px] text-chalk"
            style={{ letterSpacing: 0.2 }}
          >
            {subtitle}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          hitSlop={10}
          onPress={() => {
            Haptics.selectionAsync();
            setMenuOpen(true);
          }}
          className="mt-[1px] h-[46px] w-[46px] items-center justify-center rounded-full bg-menu active:opacity-70"
        >
          <MenuIcon />
        </Pressable>
      </View>

      <MenuSheet visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

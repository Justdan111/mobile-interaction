import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../halftone/Avatar';
import { Icon } from '../ui/icons';
import { useTheme } from '../../lib/theme';
import {
  PROFILE_PLATE_CHIP_COLOR,
  PROFILE_PLATE_COLOR,
  PROFILE_PLATE_INK,
} from '../../lib/tokens';
import type { Profile } from '../../data/types';

export function ProfileHeader({ profile }: { profile: Profile }) {
  const { t } = useTheme();
  // The plate runs to the top of the screen behind the status bar, as the comp
  // draws it, so the screen cannot inset the top edge for us — the padding has
  // to come from here.
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ backgroundColor: PROFILE_PLATE_COLOR, paddingTop: insets.top + 8 }}
      className="rounded-b-3xl px-5 pb-6"
    >
      <Text className="font-display text-[30px]" style={{ color: PROFILE_PLATE_INK }}>Profile</Text>
      <View className="mt-4 flex-row items-center gap-4">
        <Avatar name={profile.name} size={76} />
        <View className="flex-1">
          <Text className="text-[22px] font-bold" style={{ color: PROFILE_PLATE_INK }}>{profile.name}</Text>
          <Text className="mt-0.5 text-[13px]" style={{ color: PROFILE_PLATE_INK, opacity: 0.7 }}>
            {profile.age} years
          </Text>
          <View
            className="mt-2 flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1"
            style={{ backgroundColor: PROFILE_PLATE_CHIP_COLOR }}
          >
            <Icon name="phone" size={12} color={t.accent} />
            <Text className="text-[12px] font-medium" style={{ color: PROFILE_PLATE_INK }}>{profile.phone}</Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Edit profile" hitSlop={10}>
          <Icon name="edit" size={22} color={PROFILE_PLATE_INK} />
        </Pressable>
      </View>
    </View>
  );
}

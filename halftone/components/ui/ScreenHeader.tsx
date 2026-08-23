import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from './icons';
import { useTheme } from '../../lib/theme';

export function ScreenHeader({ title, back = false }: { title: string; back?: boolean }) {
  const router = useRouter();
  const { t } = useTheme();
  return (
    <View className="flex-row items-center gap-3 px-5 pb-3 pt-2">
      {back ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12} onPress={() => router.back()}>
          <Icon name="chevronLeft" size={26} color={t.ink} />
        </Pressable>
      ) : null}
      <Text className="font-display text-ink text-[30px]" style={{ letterSpacing: 0.5 }}>
        {title}
      </Text>
    </View>
  );
}

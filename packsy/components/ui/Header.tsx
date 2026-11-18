import React from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { useColors } from '../../theme/ThemeProvider';
import { CircleButton } from './CircleButton';
import { Icon } from './icons';
import { Pressable } from 'react-native';

/** Tab screens: large title, bell with unread dot, and a plus that starts a shipment. */
export function TitleHeader({ title }: { title: string }) {
  const C = useColors();
  return (
    <View className="flex-row items-center justify-between" style={{ marginBottom: 22 }}>
      <Text className="font-semibold text-ink" style={{ fontSize: 32, lineHeight: 42 }}>
        {title}
      </Text>
      <View className="flex-row" style={{ gap: 10 }}>
        <CircleButton icon="bell" label="Notifications" dot size={56} fill={C.page} glyph={C.ink} />
        <CircleButton icon="plus" label="New shipment" size={56} fill={C.page} glyph={C.ink} onPress={() => router.push('/shipment/new')} />
      </View>
    </View>
  );
}

/** Pushed screens: back ring, centred title, more. */
export function NavHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  const C = useColors();
  return (
    <View className="flex-row items-center justify-between" style={{ marginBottom: 18 }}>
      <CircleButton
        icon="back"
        label="Back"
        size={54}
        fill={C.page}
        glyph={C.ink}
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/home')))}
      />
      <Text className="font-medium text-ink" style={{ fontSize: 17 }}>
        {title}
      </Text>
      <Pressable accessibilityRole="button" accessibilityLabel="More" style={{ width: 54, alignItems: 'center' }} hitSlop={8}>
        <Icon name="more" color={C.ink} surface={C.page} size={24} />
      </Pressable>
    </View>
  );
}

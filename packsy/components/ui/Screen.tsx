import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Height of the floating tab bar plus breathing room, so content scrolls clear of it. */
export const TAB_BAR_CLEARANCE = 112;

export const GUTTER = 20;

export function Screen({
  children,
  scroll = true,
  clearance = TAB_BAR_CLEARANCE,
  gutter = GUTTER,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  clearance?: number;
  gutter?: number;
}) {
  const insets = useSafeAreaInsets();
  const padding = { paddingTop: insets.top + 12, paddingBottom: clearance + insets.bottom };

  if (!scroll) {
    return (
      <View className="flex-1 bg-page" style={{ ...padding, paddingHorizontal: gutter }}>
        {children}
      </View>
    );
  }
  return (
    <ScrollView
      className="flex-1 bg-page"
      contentContainerStyle={{ ...padding, paddingHorizontal: gutter }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

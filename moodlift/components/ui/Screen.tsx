import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Height of the floating tab bar plus its breathing room, so screen content
 *  can scroll clear of it rather than ending underneath. */
export const TAB_BAR_CLEARANCE = 96;

export function Screen({
  children,
  scroll = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const padding = { paddingTop: insets.top + 8, paddingBottom: TAB_BAR_CLEARANCE };

  if (!scroll) {
    return (
      <View className="flex-1 bg-page px-4" style={padding}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-page"
      contentContainerStyle={{ ...padding, paddingHorizontal: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

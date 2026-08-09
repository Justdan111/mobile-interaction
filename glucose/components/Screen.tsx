import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

/**
 * Every tab is the same shell: black to the edges, content clearing the notch,
 * and a scroll view so the taller screens still reach their last row on small
 * devices without changing the layout on large ones.
 */
export function Screen({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-void">
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 28 }}
        // The trace chart scrubs horizontally; without this the vertical
        // scroll steals the gesture the moment your finger drifts.
        scrollEventThrottle={16}
      >
        {children}
      </ScrollView>
    </View>
  );
}

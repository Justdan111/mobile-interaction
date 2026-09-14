import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Pressable } from 'react-native';
import { Icon } from '../components/ui/icons';

// Placeholder. The Activity / Progress screen lands in its own PR; Home links
// here from "See activity" already, and a missing route would throw.
export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-page px-4" style={{ paddingTop: insets.top + 6 }}>
      <View className="h-11 flex-row items-center justify-center">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          className="absolute left-0 h-10 w-10 items-center justify-center rounded-full bg-card"
        >
          <Icon name="chevron-left" color="#FFFFFF" size={20} />
        </Pressable>
        <Text className="font-display text-lg text-ink">My fitness journey</Text>
      </View>
    </View>
  );
}

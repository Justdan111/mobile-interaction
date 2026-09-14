import { Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { WORKOUTS } from '../../data/workouts';
import { Icon } from '../../components/ui/icons';

// Placeholder. The full detail screen lands with the Workouts PR.
export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = WORKOUTS.find((w) => w.id === id);

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
        <Text className="font-display text-lg text-ink" numberOfLines={1}>
          {workout?.title ?? 'Workout'}
        </Text>
      </View>
    </View>
  );
}

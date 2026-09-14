import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { getMood, type MoodId } from '../data/moods';
import { useMood } from '../lib/mood-context';
import { MoodCard } from '../components/mood/MoodCard';
import { Icon } from '../components/ui/icons';

const USER_FIRST_NAME = 'George';

export default function MoodScreen() {
  const insets = useSafeAreaInsets();
  const { moodId, setMood } = useMood();

  // The picker holds its own draft so scrolling the wheel doesn't re-sort the
  // rest of the app underneath; the choice only commits on the CTA.
  const [draft, setDraft] = useState<MoodId>(moodId ?? 'balanced');
  const mood = getMood(draft);

  const commit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMood(draft);
    router.back();
  };

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
        <Text className="font-display text-lg text-ink">Todays&apos; energy level</Text>
      </View>

      <View className="flex-1 pb-3 pt-4">
        <MoodCard mood={mood} name={USER_FIRST_NAME} onChange={setDraft} />
      </View>

      <Pressable
        onPress={commit}
        accessibilityRole="button"
        accessibilityLabel="Let's find workout"
        className="mb-2 items-center justify-center rounded-full bg-accent py-[18px] active:opacity-90"
        style={{ marginBottom: insets.bottom + 8 }}
      >
        <Text className="font-display text-lg text-ink">Let&apos;s find workout</Text>
      </Pressable>
    </View>
  );
}

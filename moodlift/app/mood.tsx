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

  /**
   * Two pieces of state, not one.
   *
   * `preview` is what you are looking at — it moves as you swipe and drives the
   * card colour, the mascot and the blurb. `selected` is what you have chosen,
   * and stays null until you tap the centred label. Only `selected` draws the
   * ring and activates the CTA.
   *
   * Swiping clears the selection: otherwise the ring would sit on a mood you
   * had already swiped away from, and would stop meaning "this is your choice".
   */
  const [preview, setPreview] = useState<MoodId>(moodId ?? 'balanced');
  const [selected, setSelected] = useState<MoodId | null>(moodId);

  const mood = getMood(preview);

  const handlePreview = (id: MoodId) => {
    setPreview(id);
    setSelected(null);
  };

  const handleSelect = (id: MoodId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
  };

  const commit = () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMood(selected);
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
        <MoodCard
          preview={mood}
          selected={selected}
          name={USER_FIRST_NAME}
          onPreviewChange={handlePreview}
          onSelect={handleSelect}
        />
      </View>

      <Pressable
        onPress={commit}
        disabled={!selected}
        accessibilityRole="button"
        accessibilityLabel="Let's find workout"
        accessibilityState={{ disabled: !selected }}
        accessibilityHint={selected ? undefined : 'Choose a mood first by tapping its name'}
        className="mb-2 items-center justify-center rounded-full bg-accent py-[18px] active:opacity-90"
        style={{ marginBottom: insets.bottom + 8, opacity: selected ? 1 : 0.35 }}
      >
        <Text className="font-display text-lg text-ink">Let&apos;s find workout</Text>
      </Pressable>
    </View>
  );
}

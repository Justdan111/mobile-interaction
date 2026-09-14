import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MOODS, getMood, type Mood } from '../../data/moods';
import { MascotFor } from '../mascots';
import { HandDrawnEllipse } from '../mood/HandDrawnEllipse';

/**
 * The compact mood banner at the top of Workouts — `workouts-browse.png`.
 *
 * A static preview of the wheel rather than a second scrollable one: two wheels
 * in the app that disagree about the selection would be worse than a banner
 * that simply opens the picker.
 */
export function MoodPromptCard({
  mood,
  onPress,
}: {
  mood: Mood | null;
  onPress: () => void;
}) {
  // With no mood chosen the card still has to show something; Energized is the
  // brightest mascot and reads as an invitation.
  const shown = mood ?? getMood('energized');
  const Mascot = MascotFor(shown.id);

  // A window of three centred on the selection, clamped at the ends of the
  // scale so the ringed label always sits in the middle of the row.
  const index = MOODS.findIndex((m) => m.id === shown.id);
  const start = Math.min(Math.max(index - 1, 0), MOODS.length - 3);
  const window = MOODS.slice(start, start + 3);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Change your mood"
      className="mb-7 overflow-hidden rounded-3xl bg-sage px-5 pb-5 pt-6 active:opacity-90"
    >
      <Text className="text-center font-display text-[26px] text-ink">
        <Text className="font-display-italic">How</Text> do you{' '}
        <Text className="font-display-italic">feel</Text> today?
      </Text>

      <View className="items-center py-2">
        <Mascot size={120} fill={shown.mascotFill} ink={shown.mascotInk} />
      </View>

      <View className="flex-row items-center justify-center">
        {window.map((m) => {
          const selected = m.id === shown.id;
          const label = m.label;
          return (
            <View key={m.id} className="mx-2 items-center justify-center">
              {selected && (
                <View className="absolute">
                  <HandDrawnEllipse
                    width={Math.max(label.length * 11 + 34, 96)}
                    height={38}
                    color="#FFFFFF"
                    strokeWidth={1.6}
                  />
                </View>
              )}
              <Text
                className={selected ? 'font-display-italic' : 'font-display'}
                style={{ fontSize: 17, color: selected ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}

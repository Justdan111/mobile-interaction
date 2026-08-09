import { Pressable, ScrollView, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Sheet } from '@/components/ui/Sheet';
import { TrashIcon } from '@/components/icons';
import { useAppState } from '@/state/app-state';
import { classify, clockLabel, formatValue } from '@/lib/glucose';
import { colors } from '@/theme/colors';

const DOT = {
  low: colors.amberCap,
  in: colors.badge,
  high: colors.clayCap,
} as const;

/**
 * Only user-logged readings are listed. The sensor trace underneath is not
 * something you can hand-edit, so it is not offered.
 */
export function EditEntriesSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { loggedReadings, removeReading, unit, target } = useAppState();

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Edit entries."
      subtitle={
        loggedReadings.length
          ? 'Readings you logged by hand. Removing one updates every figure.'
          : undefined
      }
    >
      {loggedReadings.length === 0 ? (
        <View className="items-center pb-4 pt-2">
          <Text className="text-center font-inter text-[14px] leading-[20px] text-mist">
            Nothing logged by hand yet.{'\n'}Use Add information to record a
            reading.
          </Text>
        </View>
      ) : (
        <ScrollView className="max-h-[300px]" showsVerticalScrollIndicator={false}>
          {loggedReadings.map((reading) => (
            <View
              key={reading.minute}
              className="mb-2 flex-row items-center justify-between rounded-2xl border border-chip-edge bg-chip px-4 py-3"
            >
              <View className="flex-row items-center">
                <View
                  className="mr-3 h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: DOT[classify(reading.mgdl, target)],
                  }}
                />
                <Text className="font-inter-medium text-[16px] text-chalk">
                  {formatValue(reading.mgdl, unit)}
                </Text>
                <Text className="ml-1.5 font-inter text-[12px] text-mist">
                  {unit}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Text className="mr-3 font-inter text-[12px] text-smoke">
                  {clockLabel(reading.minute)}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove reading ${formatValue(reading.mgdl, unit)}`}
                  hitSlop={10}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    removeReading(reading.minute);
                  }}
                  className="h-8 w-8 items-center justify-center rounded-full active:opacity-60"
                >
                  <TrashIcon />
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View className="h-1" />
    </Sheet>
  );
}

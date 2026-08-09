import { Text, View } from 'react-native';
import { Sheet } from '@/components/ui/Sheet';
import { useAppState } from '@/state/app-state';
import { formatTarget } from '@/lib/glucose';

/**
 * What the summary figures mean. Written out rather than tooltipped because
 * these are the numbers people are asked about at appointments.
 */
export function InfoSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { unit, target, days } = useAppState();

  const entries = [
    {
      term: 'Average',
      body: `The mean of every sample logged today. Read it next to CV — the same average can come from a steady day or a volatile one.`,
    },
    {
      term: 'HbA1c',
      body: `Estimated from your mean glucose over the last ${days.length} days using the ADAG relation. A lab HbA1c reflects about 90 days, so treat this as a direction of travel, not a diagnosis.`,
    },
    {
      term: 'CV',
      body: `Coefficient of variation — how much your glucose swings relative to its own average. At or below 36% is generally considered stable.`,
    },
    {
      term: 'Time in target',
      body: `The share of samples inside ${formatTarget(target, unit)}. Change the band in Settings and every figure here recalculates.`,
    },
  ];

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Your numbers."
      subtitle="How each figure on this screen is worked out."
    >
      {entries.map(({ term, body }) => (
        <View key={term} className="mb-4">
          <Text className="font-inter-semibold text-[15px] text-chalk">
            {term}
          </Text>
          <Text className="mt-1 font-inter text-[13px] leading-[19px] text-mist">
            {body}
          </Text>
        </View>
      ))}

      <Text className="mb-1 font-inter text-[11px] leading-[16px] text-smoke">
        Sample data for demonstration. Not for medical use.
      </Text>
    </Sheet>
  );
}

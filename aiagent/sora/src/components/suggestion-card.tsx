import { Pressable, Text } from 'react-native';

import { Sparkle } from '@/components/sparkle';

type SuggestionCardProps = {
  label: string;
  onPress: (label: string) => void;
};

/**
 * Dark translucent quick-prompt card: sparkle at the top, label pinned
 * to the bottom.
 */
export function SuggestionCard({ label, onPress }: SuggestionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => onPress(label)}
      className="h-[140px] w-[172px] justify-between rounded-[24px] border border-hairline bg-surface-card px-3.5 py-4 active:opacity-80">
      <Sparkle size={22} />
      <Text className="font-inter-medium text-[15px] leading-[20px] tracking-[-0.3px] text-content-primary">
        {label}
      </Text>
    </Pressable>
  );
}

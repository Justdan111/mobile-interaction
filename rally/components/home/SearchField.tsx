import { TextInput, View } from 'react-native';
import { SearchIcon } from '@/components/icons';
import { colors } from '@/theme/colors';

/**
 * Holds text and nothing more — filtering is out of scope, and a search box
 * that silently half-works is worse than one that plainly does nothing yet.
 */
export function SearchField({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (next: string) => void;
}) {
  return (
    <View className="h-14 flex-row items-center rounded-2xl bg-surface px-4">
      <SearchIcon size={22} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search your rackets"
        placeholderTextColor={colors.muted}
        className="ml-3 flex-1 font-nunito text-[16px] text-ink"
        returnKeyType="search"
      />
    </View>
  );
}

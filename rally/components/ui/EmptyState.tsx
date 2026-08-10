import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeftIcon } from '@/components/icons';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';

/**
 * Shared body for the four drawer destinations that have no comp. They exist
 * so navigation never dead-ends, and they say so plainly rather than
 * pretending to be a designed screen.
 */
export function EmptyState({ title, message }: { title: string; message: string }) {
  const router = useRouter();
  return (
    <Screen>
      <View className="flex-row items-center px-5 py-3">
        <IconButton onPress={() => router.back()} accessibilityLabel="Go back">
          <ChevronLeftIcon />
        </IconButton>
        <Text className="flex-1 pr-6 text-center font-nunito-extrabold text-[20px] text-ink">
          {title}
        </Text>
      </View>
      <View className="flex-1 items-center justify-center px-10">
        <Text className="text-center font-nunito text-[15px] leading-6 text-muted">
          {message}
        </Text>
      </View>
    </Screen>
  );
}

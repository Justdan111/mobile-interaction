import { Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MinusIcon, PlusIcon } from '@/components/icons';
import { IconButton } from '@/components/ui/IconButton';

export function Stepper({
  value,
  onChange,
  min = 1,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
}) {
  const atMin = value <= min;

  function step(delta: number) {
    const next = Math.max(min, value + delta);
    if (next === value) return;
    Haptics.selectionAsync().catch(() => {});
    onChange(next);
  }

  return (
    <View className="flex-row items-center overflow-hidden rounded-[10px]">
      <IconButton
        onPress={() => step(-1)}
        accessibilityLabel="Decrease quantity"
        className="h-9 w-9 rounded-[10px] bg-teal"
        style={{ opacity: atMin ? 0.4 : 1 }}
      >
        <MinusIcon />
      </IconButton>
      <Text className="w-10 text-center font-nunito-bold text-[17px] text-ink">
        {value}
      </Text>
      <IconButton
        onPress={() => step(1)}
        accessibilityLabel="Increase quantity"
        className="h-9 w-9 rounded-[10px] bg-teal"
      >
        <PlusIcon />
      </IconButton>
    </View>
  );
}

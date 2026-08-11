import { Text, View } from 'react-native';
import { StarIcon } from '@/components/icons';
import { Stepper } from '@/components/ui/Stepper';

export function MetaRow({
  rating,
  sold,
  qty,
  onQtyChange,
}: {
  rating: number;
  sold: string;
  qty: number;
  onQtyChange: (next: number) => void;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-2">
        <Text className="font-nunito-bold text-[15px] text-ink">{rating}</Text>
        <StarIcon size={16} />
        <View className="mx-2 h-4 w-px bg-dot" />
        <Text className="font-nunito text-[15px] text-ink">{sold} sold</Text>
      </View>
      <Stepper value={qty} onChange={onQtyChange} />
    </View>
  );
}

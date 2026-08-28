import { Text, View } from 'react-native';

/** Whole dollars only: `$120`, never `$120.00`, on cards. */
export function PricePill({ price }: { price: number }) {
  return (
    <View className="rounded-[10px] bg-ink px-3 py-1.5">
      <Text className="font-nunito-bold text-[15px] text-surface">${price}</Text>
    </View>
  );
}

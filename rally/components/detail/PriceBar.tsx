import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function PriceBar({ total, onBuy }: { total: number; onBuy: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row items-center justify-between bg-ground px-5 pt-3"
      // The bar owns the bottom inset — `Screen` deliberately skips it — so
      // the fill runs into the home indicator instead of stopping short.
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      <View>
        <Text className="font-nunito text-[14px] text-muted">Total Price</Text>
        <Text className="font-nunito-extrabold text-[26px] text-ink">
          $ {total.toFixed(2)}
        </Text>
      </View>
      <Pressable
        onPress={onBuy}
        accessibilityRole="button"
        accessibilityLabel="Buy now"
        className="rounded-2xl bg-teal px-10 py-4"
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <Text className="font-nunito-bold text-[18px] text-surface">Buy Now</Text>
      </Pressable>
    </View>
  );
}

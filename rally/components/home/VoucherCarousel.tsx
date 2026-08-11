import { useState } from 'react';
import {
  FlatList,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { VoucherCard } from '@/components/home/VoucherCard';
import { vouchers } from '@/data/vouchers';

const PAGE_PADDING = 20;

export function VoucherCarousel() {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  function onMomentumEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  }

  return (
    <View>
      <FlatList
        data={vouchers}
        keyExtractor={(v) => v.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        // Each row is a full screen width with the card inset inside it, so
        // `pagingEnabled` lands cleanly without snap offsets to maintain.
        renderItem={({ item }) => (
          <View style={{ width, paddingHorizontal: PAGE_PADDING }}>
            <View style={{ aspectRatio: 2.05 }}>
              <VoucherCard voucher={item} />
            </View>
          </View>
        )}
      />

      <View className="mt-4 flex-row items-center justify-center gap-2">
        {vouchers.map((v, i) => (
          <View
            key={v.id}
            className={
              i === index ? 'h-2 w-2 rounded-full bg-teal' : 'h-2 w-2 rounded-full bg-dot'
            }
          />
        ))}
      </View>
    </View>
  );
}

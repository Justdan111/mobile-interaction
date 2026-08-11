import { useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ChevronLeftIcon } from '@/components/icons';
import { HeroGallery } from '@/components/detail/HeroGallery';
import { MetaRow } from '@/components/detail/MetaRow';
import { PriceBar } from '@/components/detail/PriceBar';
import { productById } from '@/data/products';
import { EmptyState } from '@/components/ui/EmptyState';
import { HeartButton } from '@/components/ui/HeartButton';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { useStore } from '@/state/store';
import { colors } from '@/theme/colors';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isFavourite, toggleFavourite, addToCart } = useStore();
  const [imageIndex, setImageIndex] = useState(0);
  const [qty, setQty] = useState(1);

  const product = productById(id);
  if (!product) {
    return (
      <EmptyState
        title="Not found"
        message="That product isn't in the catalogue. Head back and pick another."
      />
    );
  }

  return (
    <Screen>
      <View className="flex-row items-center px-5 py-2">
        <IconButton onPress={() => router.back()} accessibilityLabel="Go back">
          <ChevronLeftIcon />
        </IconButton>
        <Text className="flex-1 pr-6 text-center font-nunito-extrabold text-[20px] text-ink">
          Detail Product
        </Text>
      </View>

      <View className="mt-4">
        <HeroGallery
          imageKeys={product.images}
          index={imageIndex}
          onSelect={setImageIndex}
        />
      </View>

      <View className="mt-6 flex-1 px-5">
        <Text className="font-nunito-bold text-[15px] text-ink">{product.category}</Text>

        <View className="mt-1 flex-row items-center">
          <Text className="flex-1 font-nunito-extrabold text-[28px] leading-9 text-ink">
            {product.name}
          </Text>
          <HeartButton
            active={isFavourite(product.id)}
            onPress={() => toggleFavourite(product.id)}
            size={56}
          />
        </View>

        <View className="mt-4">
          <MetaRow
            rating={product.rating}
            sold={product.sold}
            qty={qty}
            onQtyChange={setQty}
          />
        </View>

        {/* The description dissolves rather than clipping — the fade is the
            design, so the text is fixed height with a scrim over its tail. */}
        <View className="mt-5 h-[86px] overflow-hidden">
          <Text className="font-nunito text-[15px] leading-[26px] text-muted">
            {product.description}
          </Text>
          <LinearGradient
            colors={['rgba(241,241,241,0)', colors.ground]}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 46 }}
            pointerEvents="none"
          />
        </View>
      </View>

      <PriceBar
        total={product.price * qty}
        onBuy={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
            () => {},
          );
          addToCart(product.id, qty);
        }}
      />
    </Screen>
  );
}

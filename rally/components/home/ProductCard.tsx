import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { images } from '@/data/images';
import type { Product } from '@/data/products';
import { HeartButton } from '@/components/ui/HeartButton';
import { PricePill } from '@/components/ui/PricePill';
import { useStore } from '@/state/store';

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { isFavourite, toggleFavourite } = useStore();

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      accessibilityRole="button"
      accessibilityLabel={product.name}
      className="flex-1 overflow-hidden rounded-2xl bg-surface"
    >
      <View className="aspect-square bg-inset">
        <Image
          source={images[product.images[0]]}
          contentFit="contain"
          // A failed decode leaves the inset well visible rather than
          // collapsing the card's height.
          style={{ flex: 1, margin: 12 }}
          transition={150}
        />
        <View className="absolute right-3 top-3">
          <PricePill price={product.price} />
        </View>
        <View className="absolute bottom-3 right-3">
          <HeartButton
            active={isFavourite(product.id)}
            onPress={() => toggleFavourite(product.id)}
            size={34}
          />
        </View>
      </View>

      <View className="gap-1 px-3.5 py-3">
        <Text numberOfLines={1} className="font-nunito-bold text-[15px] text-ink">
          {product.name}
        </Text>
        <Text className="font-nunito text-[13px] text-muted">{product.category}</Text>
      </View>
    </Pressable>
  );
}

import { View } from 'react-native';
import { ProductCard } from '@/components/home/ProductCard';
import type { Product } from '@/data/products';

/**
 * A plain wrapping row rather than a FlatList: the grid lives inside Home's
 * ScrollView, and nesting a vertical FlatList in a vertical ScrollView
 * disables virtualisation anyway while adding a warning.
 */
export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <View className="flex-row flex-wrap gap-3 px-5">
      {products.map((product) => (
        <View key={product.id} className="w-[47.5%] grow">
          <ProductCard product={product} />
        </View>
      ))}
    </View>
  );
}

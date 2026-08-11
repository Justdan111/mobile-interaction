import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { BellIcon, MenuIcon, type BrandId } from '@/components/icons';
import { useDrawer } from '@/components/drawer/DrawerHost';
import { CategoryRail } from '@/components/home/CategoryRail';
import { ProductGrid } from '@/components/home/ProductGrid';
import { SearchField } from '@/components/home/SearchField';
import { VoucherCarousel } from '@/components/home/VoucherCarousel';
import { products } from '@/data/products';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function Home() {
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState<BrandId>('volara');
  const drawer = useDrawer();

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">
        <View className="flex-row items-center justify-between px-5 pb-6 pt-4">
          <IconButton onPress={drawer.open} accessibilityLabel="Open menu">
            <MenuIcon />
          </IconButton>
          <IconButton onPress={() => {}} accessibilityLabel="Notifications">
            <BellIcon />
          </IconButton>
        </View>

        <View className="px-5">
          <SearchField value={query} onChangeText={setQuery} />
        </View>

        <View className="mt-6">
          <VoucherCarousel />
        </View>

        <View className="mt-7 px-5">
          <SectionHeader title="Categories" />
        </View>
        <View className="mt-4">
          <CategoryRail selected={brand} onSelect={setBrand} />
        </View>

        <View className="mt-7 px-5">
          <SectionHeader title="Popular Product" actionLabel="See more" />
        </View>
        <View className="mt-4">
          <ProductGrid products={products} />
        </View>
      </ScrollView>
    </Screen>
  );
}

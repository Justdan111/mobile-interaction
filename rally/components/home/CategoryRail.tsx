import { Pressable, ScrollView, Text } from 'react-native';
import { BrandMark, type BrandId } from '@/components/icons';
import { brands } from '@/data/brands';
import { colors } from '@/theme/colors';

/**
 * Selection is a visual affordance only — it reorders nothing. The comp shows
 * one tile filled teal, so the state exists to reproduce that.
 */
export function CategoryRail({
  selected,
  onSelect,
}: {
  selected: BrandId;
  onSelect: (id: BrandId) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // Bleeds to the right edge so the next tile is partly visible.
      contentContainerClassName="gap-3 px-5"
    >
      {brands.map((brand) => {
        const active = brand.id === selected;
        const ink = active ? colors.surface : colors.ink;
        return (
          <Pressable
            key={brand.id}
            onPress={() => onSelect(brand.id)}
            accessibilityRole="button"
            accessibilityLabel={brand.name}
            // Sized off the comp: four tiles plus a sliver of the fifth fit
            // across the screen, which is what makes the row read as a rail
            // rather than three buttons.
            className={`h-[72px] w-[92px] items-center justify-center gap-1.5 rounded-2xl ${
              active ? 'bg-teal' : 'bg-surface'
            }`}
          >
            <BrandMark
              brand={brand.id}
              size={22}
              color={brand.id === 'volara' && !active ? colors.ember : ink}
              // The tile colour behind the mark. Omit it on the teal tile and
              // Ardent's crossbar and Sable's letterform render white-on-white
              // and vanish.
              cut={active ? colors.teal : colors.surface}
            />
            <Text
              className="font-nunito-extrabold text-[11px]"
              style={{ color: ink, letterSpacing: 0.5 }}
            >
              {brand.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

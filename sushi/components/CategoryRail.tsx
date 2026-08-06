import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { CategoryIcon } from '@/components/art/MenuIcons';
import { PressableScale } from '@/components/motion';
import { categories, type CategoryId } from '@/data/menu';
import { colors, hairline } from '@/theme/colors';
import { font } from '@/theme/type';

const CHIP_W = 55;
const CHIP_H = 73;

/**
 * The category selector. The active entry is a filled tile that wraps both the
 * icon and its label; the rest are bare rings with the label sitting under
 * them, which is why the two states are laid out separately rather than
 * styling one shape two ways.
 */
export function CategoryRail({
  active,
  onChange,
}: {
  active: CategoryId;
  onChange: (id: CategoryId) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 18, gap: 18, alignItems: 'flex-start' }}
    >
      {categories.map((category) => {
        const isActive = category.id === active;

        return (
          <PressableScale
            key={category.id}
            to={0.93}
            accessibilityLabel={category.label}
            onPress={() => {
              if (!isActive) {
                Haptics.selectionAsync().catch(() => {});
                onChange(category.id);
              }
            }}
            style={{ width: CHIP_W, alignItems: 'center' }}
          >
            {isActive ? (
              <LinearGradient
                colors={['#6B3C24', '#41281C']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={{
                  width: CHIP_W,
                  height: CHIP_H,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.16)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                }}
              >
                <CategoryIcon category={category.id} size={25} color={colors.white} />
                <Text
                  style={{
                    fontFamily: font.medium,
                    fontSize: 11.5,
                    color: colors.white,
                  }}
                >
                  {category.label}
                </Text>
              </LinearGradient>
            ) : (
              <>
                <View
                  style={{
                    width: 47,
                    height: 47,
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: hairline.onNight,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CategoryIcon
                    category={category.id}
                    size={23}
                    color="rgba(255,255,255,0.82)"
                  />
                </View>
                <Text
                  style={{
                    marginTop: 9,
                    fontFamily: font.regular,
                    fontSize: 11.5,
                    color: colors.nightMuted,
                  }}
                >
                  {category.label}
                </Text>
              </>
            )}
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

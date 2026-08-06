import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';
import { PressableScale } from '@/components/motion';
import { money, photoOf, type Dish } from '@/data/menu';
import { colors } from '@/theme/colors';
import { font } from '@/theme/type';

const RADIUS = 20;

/**
 * The tall card that opens a category: the photograph fills the whole tile and
 * the copy sits over a wash that keeps it legible without dimming the food.
 */
export function FeaturedDishCard({ dish, onPress }: { dish: Dish; onPress: () => void }) {
  return (
    <PressableScale
      to={0.985}
      accessibilityLabel={`${dish.name}, ${money(dish.price)}`}
      onPress={onPress}
      style={{
        height: 198,
        borderRadius: RADIUS,
        overflow: 'hidden',
        backgroundColor: colors.nightCard,
      }}
    >
      <Image
        source={photoOf(dish)}
        contentFit="cover"
        transition={280}
        style={{ position: 'absolute', inset: 0 }}
      />
      <LinearGradient
        colors={['rgba(6,7,5,0.94)', 'rgba(6,7,5,0.62)', 'rgba(6,7,5,0.05)']}
        start={{ x: 0, y: 0.3 }}
        end={{ x: 1, y: 0.7 }}
        style={{ position: 'absolute', inset: 0 }}
      />

      <View style={{ padding: 16, paddingRight: '56%' }}>
        <Text
          style={{
            fontFamily: font.bold,
            fontSize: 19.5,
            letterSpacing: -0.3,
            color: colors.white,
          }}
        >
          {dish.name}
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontFamily: font.regular,
            fontSize: 13,
            lineHeight: 19.5,
            color: 'rgba(233,229,219,0.82)',
          }}
        >
          {dish.blurb}
        </Text>
      </View>
    </PressableScale>
  );
}

/**
 * The standard row: copy on the left, photograph bleeding off the right edge
 * and dissolving into the card so the two halves read as one surface.
 */
export function DishCard({ dish, onPress }: { dish: Dish; onPress: () => void }) {
  return (
    <PressableScale
      to={0.985}
      accessibilityLabel={`${dish.name}, ${money(dish.price)}`}
      onPress={onPress}
      style={{
        height: 142,
        borderRadius: RADIUS,
        overflow: 'hidden',
        backgroundColor: colors.nightCard,
      }}
    >
      <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '58%' }}>
        <Image
          source={photoOf(dish)}
          contentFit="cover"
          transition={280}
          style={{ position: 'absolute', inset: 0 }}
        />
        <LinearGradient
          colors={[colors.nightCard, 'rgba(19,20,16,0.55)', 'rgba(19,20,16,0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.72, y: 0.5 }}
          style={{ position: 'absolute', inset: 0 }}
        />
      </View>

      <View style={{ flex: 1, padding: 15, paddingRight: '47%' }}>
        <Text
          style={{
            fontFamily: font.bold,
            fontSize: 19.5,
            letterSpacing: -0.3,
            color: colors.white,
          }}
        >
          {dish.name}
        </Text>
        <Text
          style={{
            marginTop: 7,
            fontFamily: font.regular,
            fontSize: 13,
            lineHeight: 19.5,
            color: 'rgba(233,229,219,0.7)',
          }}
        >
          {dish.blurb}
        </Text>
        <View style={{ flex: 1 }} />
        <Text
          style={{
            fontFamily: font.bold,
            fontSize: 15,
            color: colors.white,
          }}
        >
          {money(dish.price)}
        </Text>
      </View>
    </PressableScale>
  );
}

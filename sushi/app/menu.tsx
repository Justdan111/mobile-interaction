import { useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryRail } from '@/components/CategoryRail';
import { DishCard, FeaturedDishCard } from '@/components/DishCard';
import { VerticalText } from '@/components/VerticalText';
import { SearchIcon } from '@/components/art/MenuIcons';
import { PressableScale, Rise, Slide } from '@/components/motion';
import { categories, dishesIn, type CategoryId } from '@/data/menu';
import { colors, hairline } from '@/theme/colors';
import { font } from '@/theme/type';

const inkWash = require('../assets/img/ink-wash.png');
const stamp = require('../assets/img/ink-stamp.png');

const CARD_PAD = 14;

/**
 * The header opens outwards: the stamp and title arrive from the left, and the
 * search button answers from the right a beat later. The rail and the cards
 * keep rising from below underneath them.
 */
const ENTER = {
  headline: { delay: 0, distance: 28, duration: 560 },
  search: { delay: 140, distance: 36, duration: 560 },
};

export default function Menu() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();
  const [active, setActive] = useState<CategoryId>('nigiri');

  const list = dishesIn(active);
  const stampText = categories.find((c) => c.id === active)?.jp ?? 'お品書き';

  return (
    <View className="flex-1" style={{ backgroundColor: colors.night }}>
      <StatusBar style="light" />

      {/* A single wash of ink bleeding out of the top-left corner, so the
          black isn't a flat field behind the header. */}
      <Image
        source={inkWash}
        contentFit="contain"
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: -W * 0.34,
          top: -W * 0.2,
          width: W * 1.25,
          height: W * 1.25,
          opacity: 0.5,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 28,
        }}
      >
        {/* ---------------------------------------------------- header ---- */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingLeft: 14,
            paddingRight: 22,
          }}
        >
          {/* Stamp and title travel together — the stamp is the title's
              seal, so they read as one mark on the page. */}
          <Slide
            from="left"
            distance={ENTER.headline.distance}
            delay={ENTER.headline.delay}
            duration={ENTER.headline.duration}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}
          >
            <View style={{ width: 32, height: 104, marginTop: 4 }}>
              <Image
                source={stamp}
                contentFit="fill"
                style={{ position: 'absolute', inset: 0 }}
              />
              <VerticalText
                color={colors.white}
                size={11}
                spacing={5}
                style={{ paddingTop: 12 }}
              >
                {stampText}
              </VerticalText>
            </View>

            <Text
              style={{
                flex: 1,
                marginLeft: 12,
                fontFamily: font.black,
                fontSize: 30,
                lineHeight: 40,
                letterSpacing: -0.6,
                color: '#F7F6ED',
              }}
            >
              Explore{'\n'}Our Menu
            </Text>
          </Slide>

          <Slide
            from="right"
            distance={ENTER.search.distance}
            delay={ENTER.search.delay}
            duration={ENTER.search.duration}
          >
            <PressableScale
              to={0.92}
              accessibilityLabel="Search the menu"
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                borderWidth: 1,
                borderColor: hairline.onNight,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 8,
              }}
            >
              <SearchIcon size={23} color="rgba(255,255,255,0.9)" />
            </PressableScale>
          </Slide>
        </View>

        {/* ------------------------------------------------ categories ---- */}
        <Rise delay={70} style={{ marginTop: 28 }}>
          <CategoryRail active={active} onChange={setActive} />
        </Rise>

        {/* ----------------------------------------------------- dishes ---- */}
        <View style={{ marginTop: 22, paddingHorizontal: CARD_PAD, gap: 14 }}>
          {list.map((dish, i) => (
            <Rise key={dish.id} delay={130 + i * 70}>
              {dish.featured ? (
                <FeaturedDishCard
                  dish={dish}
                  onPress={() => router.push(`/dish/${dish.id}`)}
                />
              ) : (
                <DishCard dish={dish} onPress={() => router.push(`/dish/${dish.id}`)} />
              )}
            </Rise>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

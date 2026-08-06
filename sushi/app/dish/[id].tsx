import { useState } from 'react';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Paper } from '@/components/Paper';
import { Stepper } from '@/components/Stepper';
import { VerticalText } from '@/components/VerticalText';
import { ArrowLeftIcon, HeartIcon, ListIcon } from '@/components/art/MenuIcons';
import { PressableScale, Rise } from '@/components/motion';
import { cutoutOf, dishById, money, titleLines } from '@/data/menu';
import { colors, hairline } from '@/theme/colors';
import { font } from '@/theme/type';

const brushWide = require('../../assets/img/ink-brush-wide.png');
const underline = require('../../assets/img/ink-underline.png');

const PAD = 26;

export default function DishDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();

  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(true);

  const dish = dishById(id);
  if (!dish) return <Redirect href="/menu" />;

  const total = dish.price * quantity;

  return (
    <View className="flex-1">
      <Paper />
      <StatusBar style="dark" />

      {/* The ink sweep sits under everything but the paper, and is deliberately
          wider than the screen so its dry tail runs off the right edge. */}
      <Image
        source={brushWide}
        contentFit="contain"
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: -W * 0.06,
          top: W * 0.62,
          width: W * 1.55,
          height: W * 0.8,
          opacity: 0.9,
          transform: [{ rotate: '-24deg' }],
        }}
      />

      <View style={{ flex: 1, paddingTop: insets.top + 8 }}>
        {/* -------------------------------------------------- top bar ---- */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: PAD,
          }}
        >
          <PressableScale
            to={0.9}
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={{
              width: 47,
              height: 47,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: hairline.onPaper,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeftIcon size={21} color={colors.ink} />
          </PressableScale>

          <PressableScale
            to={0.9}
            accessibilityLabel={saved ? 'Remove from favourites' : 'Save to favourites'}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setSaved((s) => !s);
            }}
            style={{
              width: 47,
              height: 47,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: saved ? 'transparent' : hairline.onPaper,
              backgroundColor: saved ? 'rgba(168,80,46,0.10)' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HeartIcon size={25} color={colors.ember} filled={saved} />
          </PressableScale>
        </View>

        {/* ---------------------------------------------------- the dish ---- */}
        <Rise delay={60} style={{ paddingHorizontal: PAD, paddingTop: 14 }}>
          <Text
            style={{
              maxWidth: W * 0.7,
              fontFamily: font.black,
              fontSize: 33,
              lineHeight: 41,
              letterSpacing: -0.8,
              color: colors.ink,
            }}
          >
            {titleLines(dish.name)}
          </Text>

          <Image
            source={underline}
            contentFit="fill"
            style={{ width: 112, height: 7, marginTop: 9, marginLeft: 2 }}
          />

          <Text
            style={{
              marginTop: 12,
              fontFamily: font.black,
              fontSize: 28,
              letterSpacing: -0.5,
              color: colors.ember,
            }}
          >
            {money(dish.price)}
          </Text>

          {/* Three lines is the block the comp allows for. Anything longer
              would run down into the hero — the rest lives behind
              "View Details". */}
          <Text
            numberOfLines={3}
            style={{
              marginTop: 12,
              maxWidth: W * 0.47,
              fontFamily: font.regular,
              fontSize: 14.5,
              lineHeight: 23,
              color: colors.inkSoft,
            }}
          >
            {dish.description}
          </Text>
        </Rise>

        {/* Kana run down the right margin, as on the printed menu. */}
        <View
          pointerEvents="none"
          style={{ position: 'absolute', right: 20, top: insets.top + 78 }}
        >
          <VerticalText color={colors.ink} size={24} spacing={8} weight="500">
            {dish.kana}
          </VerticalText>
        </View>

        {/* -------------------------------------------------- the hero ---- */}
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Rise delay={140} from={22} duration={720} style={StyleSheet.absoluteFill}>
            {/* Always the feathered cut, never the raw photograph — every
                dish has one, generated by tools/make-art.py. */}
            <Image
              source={cutoutOf(dish)}
              contentFit="contain"
              transition={320}
              style={{
                position: 'absolute',
                left: -W * 0.1,
                right: -W * 0.1,
                top: -14,
                bottom: 40,
              }}
            />
          </Rise>

          <View style={{ alignItems: 'center' }}>
            <Stepper value={quantity} onChange={setQuantity} />
          </View>
        </View>

        {/* ------------------------------------------------- the actions ---- */}
        <Rise
          delay={220}
          style={{
            paddingHorizontal: PAD + 4,
            paddingTop: 14,
            paddingBottom: Math.max(insets.bottom, 20) + 12,
            gap: 12,
          }}
        >
          <PressableScale
            to={0.98}
            accessibilityLabel={`Add ${quantity} to cart, ${money(total)}`}
            onPress={() => Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            ).catch(() => {})}
            style={{
              height: 58,
              borderRadius: 29,
              backgroundColor: colors.terracotta,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 30,
            }}
          >
            <Text style={{ fontFamily: font.bold, fontSize: 16.5, color: colors.white }}>
              Add to Cart
            </Text>
            <Text style={{ fontFamily: font.bold, fontSize: 16.5, color: colors.white }}>
              {money(total)}
            </Text>
          </PressableScale>

          <PressableScale
            to={0.98}
            accessibilityLabel="View details"
            style={{
              height: 54,
              borderRadius: 27,
              borderWidth: 1,
              borderColor: hairline.onPaper,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 30,
            }}
          >
            <Text style={{ fontFamily: font.bold, fontSize: 16.5, color: colors.ink }}>
              View Details
            </Text>
            <ListIcon size={22} color={colors.ink} />
          </PressableScale>
        </Rise>
      </View>
    </View>
  );
}

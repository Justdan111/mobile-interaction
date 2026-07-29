import { useState } from 'react';
import { View, Text } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Rect, Stop, Path } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { font } from '@/theme/type';
import type { Promo } from '@/data/shipments';
import { ParcelMark, TicketMark } from './art/PromoArt';
import { PressableScale } from './motion';

const RADIUS = 20;
const HEIGHT = 144;

/** Two overlapping sheets — the "copy code" affordance. */
function CopyGlyph({ color }: { color: string }) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Rect x="8.5" y="8.5" width="12" height="12" rx="2.6" />
      <Path d="M15.5 4.5H6a2.5 2.5 0 0 0-2.5 2.5v9.5" />
    </Svg>
  );
}

/** Flat base colour plus the soft light bloom every promo card carries. */
function Backdrop({ color, glow }: { color: string; glow: string }) {
  return (
    <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
      <Defs>
        <RadialGradient id={`pg${glow.slice(1)}`} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor={glow} stopOpacity={0.5} />
          <Stop offset="1" stopColor={glow} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={color} />
      <Ellipse cx="52%" cy="18%" rx="46%" ry="62%" fill={`url(#pg${glow.slice(1)})`} />
    </Svg>
  );
}

export function PromoCard({ promo, onPress }: { promo: Promo; onPress?: () => void }) {
  const [copied, setCopied] = useState(false);
  const dark = promo.color === '#141C21';
  // The dark card blooms green; the colourful ones bloom toward white.
  const glow = dark ? '#2E7A52' : '#FFFFFF';

  return (
    <PressableScale
      to={0.985}
      onPress={onPress}
      style={{ height: HEIGHT, borderRadius: RADIUS, overflow: 'hidden' }}
    >
      <Backdrop color={promo.color} glow={glow} />

      <View style={{ position: 'absolute', right: dark ? -4 : -6, top: dark ? 16 : 14 }}>
        {promo.art === 'ticket' ? <TicketMark /> : <ParcelMark width={128} height={128} />}
      </View>

      <View style={{ paddingLeft: 20, paddingTop: 14 }}>
        <Text style={{ fontSize: 14, lineHeight: 18, fontFamily: font.regular, color: colors.white }}>
          {promo.lead}
        </Text>
        <Text
          style={{
            marginTop: 1,
            fontSize: 27,
            lineHeight: 32,
            fontFamily: font.bold,
            color: colors.white,
            letterSpacing: -0.5,
          }}
        >
          {promo.amount}
        </Text>
        <Text
          style={{
            marginTop: 2,
            fontSize: 14,
            lineHeight: 18,
            fontFamily: font.regular,
            color: colors.white,
          }}
        >
          {promo.blurb}
        </Text>

        <PressableScale
          to={0.94}
          onPress={() => setCopied(true)}
          style={{
            marginTop: 13,
            alignSelf: 'flex-start',
            height: 28,
            borderRadius: 14,
            paddingHorizontal: 13,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.white,
          }}
        >
          <CopyGlyph color={promo.color} />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 14.5,
              fontFamily: font.medium,
              color: promo.color,
              letterSpacing: -0.1,
            }}
          >
            {copied ? 'Copied!' : promo.code}
          </Text>
        </PressableScale>
      </View>
    </PressableScale>
  );
}

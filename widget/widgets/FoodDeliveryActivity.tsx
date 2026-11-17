import { Circle, HStack, Image, Rectangle, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  activityBackgroundTint,
  background,
  clipShape,
  fixedSize,
  font,
  foregroundStyle,
  frame,
  layoutPriority,
  lineLimit,
  minimumScaleFactor,
  opacity,
  padding,
  resizable,
  shapes,
} from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';
import type { SFSymbol } from 'sf-symbols-typescript';

/**
 * Content shown by the Foody order-tracking Live Activity.
 *
 * `progress` drives both the bar and the rider on it. The arrival figure is a string
 * rather than a live timer because `7 min` is not a shape SwiftUI's self-updating date
 * styles can produce.
 */
export type FoodDeliveryProps = {
  /** Restaurant or app name shown as the headline. For example `Foody`. */
  brand: string;
  /** What was ordered, shown under the brand. For example `Pizza Napolitana`. */
  orderItem: string;
  /** Order total as it should read, including the currency mark. For example `25$`. */
  amount: string;
  /** How it will be paid. For example `Cash`. */
  paymentMethod: string;
  /** Minutes until arrival, already rounded. Rendered as `<etaMinutes> min`. */
  etaMinutes: number;
  /** How far along the delivery is, `0` at the restaurant and `1` at the door. */
  progress: number;
  /** Courier's display name. For example `George K.`. */
  courierName: string;
  /**
   * `file://` URIs staged into `widgetsDirectory` by `stageWidgetAssets`, so the extension
   * can read them. Each falls back to an SF Symbol when omitted.
   */
  /** The courier's photo, cut to a circle. */
  courierAvatarUri?: string;
  /** The rider-on-a-scooter illustration that travels along the bar. */
  courierImageUri?: string;
  /** Foody's burger-and-cup mark, white on transparent, for the badge. */
  brandGlyphUri?: string;
};

/**
 * The body is serialised by `babel-preset-expo` and re-evaluated in the widget extension,
 * so it may only reach for `@expo/ui`, JS builtins and its own declarations — hence the
 * inline colour tokens. Every nested component needs `'use no memo'`, because Expo's
 * `'widget'` opt-out does not reach inside this function. `npm run check:widgets`
 * enforces both.
 */
const FoodDeliveryActivity = (props: FoodDeliveryProps, environment: LiveActivityEnvironment) => {
  'widget';

  const color = {
    surface: '#06161C',
    chip: '#32373C',
    track: '#323235',
    mint: '#77FBDA',
    cyan: '#69D6FB',
    primary: '#FFFFFF',
    secondary: '#B8C3CE',
    tertiary: '#C9D0DB',
    // The soft mint halo behind the rider, fading to nothing.
    glow: '#77FBDA66',
    glowEnd: '#77FBDA00',
  };

  /**
   * Separate size sets for the card and the island, which loses height to the camera band.
   * `bar` is an estimate of the track width the fill and rider are measured against.
   * `rider` keeps the illustration's 138:111 aspect.
   */
  const CARD = {
    badge: 44, badgeGlyph: 22, brand: 15, item: 13, amount: 19, payment: 12,
    riderW: 39, riderH: 31, barH: 7.5, bar: 335,
    avatar: 37, courier: 16, eta: 15, action: 37, actionGlyph: 17,
    gutter: 11, pad: 8, rowGap: 8, barGap: 2,
  };
  const ISLAND = {
    badge: 40, badgeGlyph: 20, brand: 14.5, item: 12.5, amount: 18, payment: 11.5,
    riderW: 36, riderH: 29, barH: 7, bar: 340,
    avatar: 34, courier: 15, eta: 14, action: 34, actionGlyph: 16,
    gutter: 10, pad: 4, rowGap: 7, barGap: 2,
  };
  type Sizes = typeof CARD;

  const travel = Math.min(1, Math.max(0, props.progress));
  const minutes = `${Math.max(0, Math.round(props.etaMinutes))} min`;
  // Once the system marks the content stale these figures are no longer trustworthy.
  const etaTint = environment.isStale ? color.secondary : color.mint;

  const Line = (p: { size: number; bold?: boolean; tint: string; text: string }) => {
    'use no memo';
    return (
      <Text
        modifiers={[
          font(p.bold ? { size: p.size, weight: 'bold' } : { size: p.size }),
          foregroundStyle(p.tint),
          lineLimit(1),
          minimumScaleFactor(0.6),
        ]}>
        {p.text}
      </Text>
    );
  };

  /** A glyph centred in a filled circle — the two action buttons and fallbacks. */
  const CircleIcon = (p: {
    systemName: SFSymbol;
    diameter: number;
    glyphSize: number;
    tint: string;
  }) => {
    'use no memo';
    return (
      <Image
        systemName={p.systemName}
        size={p.glyphSize}
        color={p.tint}
        modifiers={[
          frame({ width: p.diameter, height: p.diameter }),
          background(color.chip, shapes.circle()),
        ]}
      />
    );
  };

  /**
   * The Foody mark, white on the chip. The PNG is 69 x 60, so the frame keeps that ratio. A takeout-bag symbol stands in if it is not staged.
   */
  const Badge = (p: { diameter: number; glyphSize: number }) => {
    'use no memo';
    if (props.brandGlyphUri) {
      return (
        <ZStack
          modifiers={[
            frame({ width: p.diameter, height: p.diameter }),
            background(color.chip, shapes.circle()),
          ]}>
          <Image
            uiImage={props.brandGlyphUri}
            modifiers={[
              resizable(),
              frame({ width: p.glyphSize, height: p.glyphSize * (60 / 69) }),
            ]}
          />
        </ZStack>
      );
    }
    return (
      <CircleIcon
        systemName="takeoutbag.and.cup.and.straw.fill"
        diameter={p.diameter}
        glyphSize={p.glyphSize * 0.9}
        tint={color.primary}
      />
    );
  };

  /**
   * `pin` stops text truncating beside a Spacer, but a pinned stack refuses to shrink and
   * gets clipped in the Dynamic Island. Narrow regions take a width `cap` instead, which
   * gives `minimumScaleFactor` something to scale against.
   */
  const StackedPair = (p: {
    top: React.ReactNode;
    bottom: React.ReactNode;
    align: 'leading' | 'trailing';
    pin?: boolean;
    cap?: number;
  }) => {
    'use no memo';
    return (
      <VStack
        alignment={p.align}
        spacing={0}
        modifiers={
          p.pin
            ? [fixedSize({ horizontal: true, vertical: false }), layoutPriority(1)]
            : p.cap
              ? [frame({ maxWidth: p.cap, alignment: p.align }), layoutPriority(1)]
              : [layoutPriority(1)]
        }>
        {p.top}
        {p.bottom}
      </VStack>
    );
  };

  const OrderIdentity = (p: { s: Sizes; pin?: boolean; cap?: number }) => {
    'use no memo';
    return (
      <HStack spacing={p.s.gutter} alignment="center">
        <Badge diameter={p.s.badge} glyphSize={p.s.badgeGlyph} />
        <StackedPair
          align="leading"
          pin={p.pin}
          cap={p.cap}
          top={<Line size={p.s.brand} bold tint={color.primary} text={props.brand} />}
          bottom={<Line size={p.s.item} tint={color.secondary} text={props.orderItem} />}
        />
      </HStack>
    );
  };

  const Payment = (p: { s: Sizes; pin?: boolean; cap?: number }) => {
    'use no memo';
    return (
      <StackedPair
        align="trailing"
        pin={p.pin}
        cap={p.cap}
        top={<Line size={p.s.amount} bold tint={color.primary} text={props.amount} />}
        bottom={<Line size={p.s.payment} tint={color.tertiary} text={props.paymentMethod} />}
      />
    );
  };

  /**
   * The rider over a mint halo: a radial gradient on a circle larger than the rider's frame,
   * left unclipped so it spills softly into the neighbouring rows.
   */
  const Rider = (p: { s: Sizes }) => {
    'use no memo';
    const halo = p.s.riderW * 3.2;
    return (
      <ZStack modifiers={[frame({ width: p.s.riderW, height: p.s.riderH })]}>
        <Circle
          modifiers={[
            frame({ width: halo, height: halo }),
            foregroundStyle({
              type: 'radialGradient',
              colors: [color.glow, color.glowEnd],
              center: { x: 0.5, y: 0.5 },
              startRadius: 0,
              endRadius: halo / 2,
            }),
          ]}
        />
        {props.courierImageUri ? (
          <Image
            uiImage={props.courierImageUri}
            modifiers={[resizable(), frame({ width: p.s.riderW, height: p.s.riderH })]}
          />
        ) : (
          <Image systemName="moped.fill" size={p.s.riderH * 0.9} color={color.primary} />
        )}
      </ZStack>
    );
  };

  /**
   * The rider trails the fill's leading edge by about 4pt. A transparent leading spacer
   * positions it and a Spacer takes the remainder, so overshooting `bar` cannot push it off.
   */
  const Courier = (p: { s: Sizes }) => {
    'use no memo';
    const lead = Math.max(0, p.s.bar * travel - p.s.riderW - 4);
    return (
      <HStack spacing={0} alignment="bottom">
        <Rectangle modifiers={[frame({ width: lead, height: 1 }), opacity(0)]} />
        <Rider s={p.s} />
        <Spacer />
      </HStack>
    );
  };

  /**
   * Two rectangles clipped to a capsule; a ProgressView would force the system's track grey.
   * `bar` is only an estimate, so near the end the fill takes the whole track.
   */
  const ProgressBar = (p: { s: Sizes }) => {
    'use no memo';
    const done = travel >= 0.995;
    // No conditional children: the serialised tree must not contain `null` nodes.
    return (
      <HStack spacing={0} modifiers={[frame({ height: p.s.barH }), clipShape('capsule')]}>
        <Rectangle
          modifiers={
            done
              ? [foregroundStyle(color.mint)]
              : [frame({ width: p.s.bar * travel }), foregroundStyle(color.mint)]
          }
        />
        <Rectangle
          modifiers={
            done ? [frame({ width: 0 }), foregroundStyle(color.track)] : [foregroundStyle(color.track)]
          }
        />
      </HStack>
    );
  };

  /** The courier's photo cut to a circle, with a glyph only if it is missing. */
  const Avatar = (p: { diameter: number }) => {
    'use no memo';
    if (props.courierAvatarUri) {
      return (
        <Image
          uiImage={props.courierAvatarUri}
          modifiers={[
            resizable(),
            frame({ width: p.diameter, height: p.diameter }),
            clipShape('circle'),
          ]}
        />
      );
    }
    return (
      <CircleIcon
        systemName="person.fill"
        diameter={p.diameter}
        glyphSize={p.diameter * 0.45}
        tint={color.secondary}
      />
    );
  };

  /** Courier, arrival line, then the two call/message buttons. Their glyphs differ in hue. */
  const CourierBar = (p: { s: Sizes; pin?: boolean; cap?: number }) => {
    'use no memo';
    return (
      <HStack spacing={p.s.gutter} alignment="center">
        <Avatar diameter={p.s.avatar} />
        <VStack
          alignment="leading"
          spacing={1}
          modifiers={
            p.pin
              ? [fixedSize({ horizontal: true, vertical: false }), layoutPriority(1)]
              : [layoutPriority(1)]
          }>
          <Line size={p.s.courier} bold tint={color.primary} text={props.courierName} />
          <HStack spacing={4} alignment="firstTextBaseline">
            <Line size={p.s.eta} tint={color.secondary} text="Will arrive in" />
            <Line size={p.s.eta} bold tint={etaTint} text={minutes} />
          </HStack>
        </VStack>
        <Spacer />
        <CircleIcon
          systemName="phone.connection"
          diameter={p.s.action}
          glyphSize={p.s.actionGlyph}
          tint={color.cyan}
        />
        <CircleIcon
          systemName="ellipsis.bubble"
          diameter={p.s.action}
          glyphSize={p.s.actionGlyph}
          tint={color.mint}
        />
      </HStack>
    );
  };

  const Body = (p: { s: Sizes }) => {
    'use no memo';
    return (
      <VStack alignment="leading" spacing={p.s.barGap}>
        <Courier s={p.s} />
        <ProgressBar s={p.s} />
      </VStack>
    );
  };

  return {
    // Lock Screen and Notification Centre.
    banner: (
      <VStack
        alignment="leading"
        spacing={CARD.rowGap}
        modifiers={[
          padding({ horizontal: 14, vertical: CARD.pad }),
          activityBackgroundTint(color.surface),
        ]}>
        <HStack alignment="center">
          <OrderIdentity s={CARD} pin />
          <Spacer />
          <Payment s={CARD} pin />
        </HStack>
        <Body s={CARD} />
        <CourierBar s={CARD} pin />
      </VStack>
    ),

    // CarPlay and watchOS: the headline only.
    bannerSmall: (
      <HStack spacing={10} alignment="center" modifiers={[padding({ all: 10 })]}>
        <Badge diameter={30} glyphSize={15} />
        <StackedPair
          align="leading"
          cap={150}
          top={<Line size={14} bold tint={color.primary} text={props.brand} />}
          bottom={<Line size={11} tint={color.secondary} text={props.orderItem} />}
        />
        <Spacer />
        <Line size={14} bold tint={etaTint} text={minutes} />
      </HStack>
    ),

    // Dynamic Island, expanded. The rounded corners clip whatever hugs the edge, so both
    // top regions carry an inset.
    expandedLeading: (
      <HStack modifiers={[padding({ leading: 4 })]}>
        <OrderIdentity s={ISLAND} cap={150} />
        <Spacer />
      </HStack>
    ),
    expandedTrailing: (
      <HStack modifiers={[padding({ trailing: 12 })]}>
        <Spacer />
        <Payment s={ISLAND} cap={80} />
      </HStack>
    ),
    expandedBottom: (
      <VStack
        alignment="leading"
        spacing={ISLAND.rowGap}
        modifiers={[padding({ top: ISLAND.pad })]}>
        <Body s={ISLAND} />
        <CourierBar s={ISLAND} cap={150} />
      </VStack>
    ),

    // Dynamic Island, collapsed: badge and brand, then the ETA.
    compactLeading: (
      <HStack spacing={7} alignment="center">
        <Badge diameter={26} glyphSize={13} />
        <Line size={14} bold tint={color.primary} text={props.brand} />
      </HStack>
    ),
    compactTrailing: (
      <HStack modifiers={[padding({ trailing: 2 })]}>
        <Line size={14} bold tint={etaTint} text={minutes} />
      </HStack>
    ),

    minimal: <Badge diameter={24} glyphSize={12} />,
  };
};

export default createLiveActivity<FoodDeliveryProps>('FoodDeliveryActivity', FoodDeliveryActivity);

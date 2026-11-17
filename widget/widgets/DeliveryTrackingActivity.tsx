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
  monospacedDigit,
  multilineTextAlignment,
  offset,
  padding,
  resizable,
  shapes,
} from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';
import type { SFSymbol } from 'sf-symbols-typescript';

/**
 * Content shown by the delivery-tracking Live Activity.
 *
 * The trip is described by when it began and when it is due rather than a minute count
 * the app decrements, so SwiftUI counts the ETA down unaided — on the Lock Screen, with
 * the app suspended. `progress` positions the truck in the collapsed pill, which is the
 * one thing SwiftUI cannot work out for itself.
 */
export type DeliveryTrackingProps = {
  /** Vehicle registration, shown as the headline. For example `RJ 4567`. */
  vehiclePlate: string;
  /** Vehicle make/model shown under the plate. For example `Volvo max s23`. */
  vehicleModel: string;
  /** Epoch milliseconds when the trip started. Anchors the countdown and the truck. */
  startedAt: number;
  /** Epoch milliseconds the van is due to arrive. The countdown runs to this. */
  etaAt: number;
  /** How far along the route the van is, `0` at the pickup and `1` at the drop-off. */
  progress: number;
  /** Remaining distance in kilometres. The system cannot derive this, so the app refreshes it. */
  distanceKm: number;
  /** Pickup address. */
  fromAddress: string;
  /** Drop-off address. */
  toAddress: string;
  /** Driver's display name. */
  driverName: string;
  /** Driver's reference code, shown as `ID - <driverId>`. */
  driverId: string;
  /**
   * `file://` URI for the driver's photo, staged into `widgetsDirectory` by
   * `stageWidgetAssets` so the extension can read it. Falls back to a person glyph when
   * omitted.
   */
  driverAvatarUri?: string;
};

/**
 * Every Live Activity presentation caps out near 160pt and SwiftUI clips rather than
 * scales, so each size here is the largest that fits that budget.
 *
 * The body is serialised by `babel-preset-expo` and
 * re-evaluated in the widget extension, so it may only reach for `@expo/ui`, JS builtins
 * and its own declarations — hence inline colour tokens. And every nested component needs
 * `'use no memo'`, because Expo's `'widget'` opt-out does not reach inside this function.
 * `npm run check:widgets` enforces both.
 */
const DeliveryTrackingActivity = (
  props: DeliveryTrackingProps,
  environment: LiveActivityEnvironment
) => {
  'widget';

  const color = {
    surface: '#000000',
    badgeCircle: '#25272D',
    actionCircle: '#2D2D2F',
    primary: '#F1F1F1',
    driverName: '#C8C8C8',
    secondary: '#63676C',
    driverId: '#4E5457',
    address: '#5C5C5C',
    label: '#2A2C2E',
    accent: '#FCEE58',
    rail: '#636A71',
  };

  // SwiftUI falls back to plain (empty) text if a timer range is inverted, so the upper
  // bound is clamped rather than trusted.
  const tripStart = new Date(props.startedAt);
  const tripEnd = new Date(Math.max(props.etaAt, props.startedAt));
  const trip = { lower: tripStart, upper: tripEnd };
  const now = Date.now();
  const arrived = props.etaAt <= now;

  // Position comes from whichever is further along: what the app last pushed, or what the
  // clock implies. Pushes stop when the app is suspended, and without that floor the truck
  // would park mid-route while the countdown ran on to zero.
  const span = props.etaAt - props.startedAt;
  const elapsed = span > 0 ? (now - props.startedAt) / span : 1;
  const travel = Math.min(1, Math.max(0, Math.max(props.progress, elapsed)));

  const distance = `${props.distanceKm} km`;
  // Once the system marks the content stale the figures are no longer trustworthy.
  const liveColor = environment.isStale ? color.secondary : color.primary;

  /**
   * Separate size sets per presentation: the Lock Screen card owns all ~160pt, while the
   * expanded island loses about 30pt to the camera band and system padding.
   */
  const CARD = {
    badge: 44, badgeGlyph: 21, plate: 13.5, model: 11.5,
    label: 10.5, address: 12.5, legGap: 4, dot: 8, railW: 2,
    action: 29, actionGlyph: 13, driverName: 13.5, driverId: 9.8, avatar: 29,
    gutter: 11, rowGap: 6, pad: 5,
  };
  const ISLAND = {
    badge: 38, badgeGlyph: 18, plate: 12.5, model: 10.5,
    label: 9.5, address: 12, legGap: 3, dot: 8, railW: 2,
    action: 26, actionGlyph: 12, driverName: 12, driverId: 8.8, avatar: 26,
    gutter: 10, rowGap: 4, pad: 3,
  };
  type Sizes = typeof CARD;

  /**
   * The ETA. `timerInterval` hands the countdown to SwiftUI, which ticks it unaided.
   * A timer text fills its offered width from the leading edge, so at a row's end it
   * needs `trailing` to stay flush with the distance under it.
   */
  const Countdown = (p: { size: number; weight?: 'bold' | 'semibold'; trailing?: boolean }) => {
    'use no memo';
    const style = [
      font({ size: p.size, weight: p.weight ?? 'bold' }),
      foregroundStyle(liveColor),
      lineLimit(1),
      minimumScaleFactor(0.6),
      multilineTextAlignment(p.trailing ? 'trailing' : 'leading'),
    ];
    if (arrived) {
      return <Text modifiers={style}>Arrived</Text>;
    }
    return <Text timerInterval={trip} countsDown modifiers={[...style, monospacedDigit()]} />;
  };

  /** A glyph centred in a filled circle — the truck badge and the two action buttons. */
  const CircleIcon = (p: {
    systemName: SFSymbol;
    diameter: number;
    glyphSize: number;
    fill: string;
  }) => {
    'use no memo';
    return (
      <Image
        systemName={p.systemName}
        size={p.glyphSize}
        color={color.primary}
        modifiers={[
          frame({ width: p.diameter, height: p.diameter }),
          background(p.fill, shapes.circle()),
        ]}
      />
    );
  };

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

  /** Truck badge, then plate over model. */
  const VehicleIdentity = (p: { s: Sizes; pin?: boolean; cap?: number }) => {
    'use no memo';
    return (
      <HStack spacing={p.s.gutter} alignment="center">
        <CircleIcon
          systemName="box.truck"
          diameter={p.s.badge}
          glyphSize={p.s.badgeGlyph}
          fill={color.badgeCircle}
        />
        <StackedPair
          align="leading"
          pin={p.pin}
          cap={p.cap}
          top={<Line size={p.s.plate} bold tint={color.primary} text={props.vehiclePlate} />}
          bottom={<Line size={p.s.model} tint={color.secondary} text={props.vehicleModel} />}
        />
      </HStack>
    );
  };

  /** ETA over remaining distance, right-aligned. */
  const EtaReadout = (p: { s: Sizes; pin?: boolean; cap?: number }) => {
    'use no memo';
    return (
      <StackedPair
        align="trailing"
        pin={p.pin}
        cap={p.cap}
        top={<Countdown size={p.s.plate} trailing />}
        bottom={<Line size={p.s.model} tint={color.secondary} text={distance} />}
      />
    );
  };

  /**
   * The route: the origin dot sits level with the first address, with a thin rule running
   * down beside `To`. `inset` indents the whole block from the card's edge.
   */
  const Route = (p: { s: Sizes; inset: number }) => {
    'use no memo';
    const labelLine = p.s.label * 1.2;
    const addressLine = p.s.address * 1.2;
    return (
      <HStack spacing={p.s.gutter + 3} alignment="top" modifiers={[padding({ leading: p.inset })]}>
        <VStack spacing={0} alignment="center" modifiers={[padding({ top: labelLine })]}>
          <Circle
            modifiers={[
              frame({ width: p.s.dot, height: p.s.dot }),
              foregroundStyle(color.accent),
            ]}
          />
          <Rectangle
            modifiers={[
              // Runs from the dot to beside `To`, stopping short of the second address.
              frame({ width: p.s.railW, height: addressLine + p.s.legGap + labelLine * 0.6 }),
              foregroundStyle(color.rail),
            ]}
          />
        </VStack>
        <VStack alignment="leading" spacing={p.s.legGap}>
          <VStack alignment="leading" spacing={0}>
            <Line size={p.s.label} tint={color.label} text="From" />
            <Line size={p.s.address} tint={color.address} text={props.fromAddress} />
          </VStack>
          <VStack alignment="leading" spacing={0}>
            <Line size={p.s.label} tint={color.label} text="To" />
            <Line size={p.s.address} tint={color.address} text={props.toAddress} />
          </VStack>
        </VStack>
        <Spacer />
      </HStack>
    );
  };

  /** The driver's photo cut to a circle, with a glyph only if it is missing. */
  const Avatar = (p: { diameter: number }) => {
    'use no memo';
    if (props.driverAvatarUri) {
      return (
        <Image
          uiImage={props.driverAvatarUri}
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
        fill={color.actionCircle}
      />
    );
  };

  /** Call and message on the left, driver identity and photo on the right. */
  const DriverBar = (p: { s: Sizes; pin?: boolean; cap?: number; inset: number }) => {
    'use no memo';
    return (
      <HStack spacing={p.s.gutter} alignment="center" modifiers={[padding({ leading: p.inset })]}>
        <CircleIcon
          systemName="phone.connection"
          diameter={p.s.action}
          glyphSize={p.s.actionGlyph}
          fill={color.actionCircle}
        />
        <CircleIcon
          systemName="ellipsis.bubble"
          diameter={p.s.action}
          glyphSize={p.s.actionGlyph}
          fill={color.actionCircle}
          />
        <Spacer />
        <StackedPair
          align="trailing"
          pin={p.pin}
          cap={p.cap}
          top={
            <Line size={p.s.driverName} bold tint={color.driverName} text={props.driverName} />
          }
          bottom={
            <Line size={p.s.driverId} tint={color.driverId} text={`ID - ${props.driverId}`} />
          }
        />
        <Avatar diameter={p.s.avatar} />
      </HStack>
    );
  };

  /**
   * The collapsed pill's leading region: a capsule track the truck rides along, reaching
   * the right end on arrival. The only place the collapsed presentation can show travel.
   */
  const CompactRail = () => {
    'use no memo';
    // The compact region clips anything past about 100pt, flattening the capsule's end.
    const capW = 96;
    const truckW = 24;
    const endGap = 5;
    // Offset from the capsule's centre: a ZStack centres its child regardless of the
    // alignment asked for, so a leading-relative offset pushes the truck off the end.
    const run = capW - truckW - endGap * 2;
    return (
      <ZStack
        modifiers={[
          frame({ width: capW, height: 26 }),
          background(color.badgeCircle, shapes.capsule()),
          clipShape('capsule'),
        ]}>
        <Image
          systemName="box.truck"
          size={14}
          color={color.primary}
          modifiers={[offset({ x: (travel - 0.5) * run })]}
        />
      </ZStack>
    );
  };

  return {
    // Lock Screen and Notification Centre.
    banner: (
      <VStack
        alignment="leading"
        spacing={CARD.rowGap}
        modifiers={[
          padding({ horizontal: 12, vertical: CARD.pad }),
          activityBackgroundTint(color.surface),
        ]}>
        <HStack alignment="center">
          <VehicleIdentity s={CARD} pin />
          <Spacer />
          {/* Never `pin` the countdown: a `timerInterval` text inside a horizontally
              fixed-size stack is a layout WidgetKit refuses to render, and the whole
              card comes up blank until the timer ends and it turns into plain text. */}
          <EtaReadout s={CARD} cap={110} />
        </HStack>
        <Route s={CARD} inset={18} />
        <DriverBar s={CARD} pin inset={14} />
      </VStack>
    ),

    // CarPlay and watchOS: the headline only, there is no room for the route.
    bannerSmall: (
      <HStack spacing={10} alignment="center" modifiers={[padding({ all: 10 })]}>
        <CircleIcon
          systemName="box.truck"
          diameter={32}
          glyphSize={15}
          fill={color.badgeCircle}
        />
        <StackedPair
          align="leading"
          cap={150}
          top={<Line size={14} bold tint={color.primary} text={props.vehiclePlate} />}
          bottom={<Line size={11} tint={color.secondary} text={props.toAddress} />}
        />
        <Spacer />
        <Countdown size={14} />
      </HStack>
    ),

    // Dynamic Island, expanded. The top row sits beside the camera.
    expandedLeading: (
      <HStack modifiers={[padding({ leading: 4 })]}>
        <VehicleIdentity s={ISLAND} cap={150} />
        <Spacer />
      </HStack>
    ),
    // The island's rounded corner clips content that hugs the trailing edge.
    expandedTrailing: (
      <HStack modifiers={[padding({ trailing: 12 })]}>
        <Spacer />
        <EtaReadout s={ISLAND} cap={90} />
      </HStack>
    ),
    expandedBottom: (
      <VStack alignment="leading" spacing={ISLAND.rowGap} modifiers={[padding({ top: ISLAND.pad })]}>
        <Route s={ISLAND} inset={14} />
        <DriverBar s={ISLAND} cap={110} inset={10} />
      </VStack>
    ),

    // Dynamic Island, collapsed.
    compactLeading: <CompactRail />,
    // Compact regions flank the 126pt camera and iOS pins their content to the outer
    // edge; neither a Spacer nor a fixed-width row moves it inward.
    compactTrailing: (
      <HStack spacing={6} alignment="center">
        <Countdown size={13} weight="semibold" />
        <Image
          systemName="clock"
          size={9}
          color={color.primary}
          modifiers={[frame({ width: 18, height: 18 }), background(color.actionCircle, shapes.circle())]}
        />
      </HStack>
    ),

    // Shown when another activity shares the island.
    minimal: <Image systemName="box.truck.fill" size={14} color={color.primary} />,
  };
};

export default createLiveActivity<DeliveryTrackingProps>(
  'DeliveryTrackingActivity',
  DeliveryTrackingActivity
);

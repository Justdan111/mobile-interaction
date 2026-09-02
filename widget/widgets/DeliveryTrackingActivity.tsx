import { Circle, HStack, Image, Rectangle, Spacer, Text, VStack } from '@expo/ui/swift-ui';
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
  padding,
  shapes,
  symbolEffect,
} from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';
import type { SFSymbol } from 'sf-symbols-typescript';

/**
 * Content shown by the delivery-tracking Live Activity.
 *
 * The trip is described by when it began and when it is due rather than by a minute
 * count the app decrements, so SwiftUI counts the ETA down by itself — on the Lock
 * Screen, with the app suspended. `progress` is the one thing the app drives, because
 * nothing in SwiftUI can move a dot along a path on its own.
 */
export type DeliveryTrackingProps = {
  /** Vehicle registration, shown as the headline. For example `RJ 4567`. */
  vehiclePlate: string;
  /** Vehicle make/model shown under the plate. For example `Volvo max s23`. */
  vehicleModel: string;
  /** Epoch milliseconds when the trip started. Anchors the countdown's range. */
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
   * Optional `file://` URI for the driver's photo. It must sit somewhere both the app and
   * the widget extension can read, so write it into `widgetsDirectory` from `expo-widgets`.
   * Falls back to a person glyph when omitted.
   */
  driverAvatarUri?: string;
};

/**
 * `babel-preset-expo` serialises this function to a string and the widget extension
 * re-evaluates it, so the body may only reach for `@expo/ui` components and modifiers,
 * JS builtins, its own declarations, and `props` / `environment`. Colour tokens are
 * declared inline for that reason. `npm run check:widgets` enforces this.
 *
 * Every nested component carries `'use no memo'`: Expo opts the `'widget'` function out
 * of the React Compiler, but that does not extend to functions declared inside it.
 *
 * On sizing: a Lock Screen Live Activity is capped at 160 points tall, while the comp
 * this is drawn from is about 300 points tall at the same width. The card keeps every
 * element and the same hierarchy, but the comp's generous whitespace is spent — it is
 * the air that gets compressed, not the content. Overshooting the cap does not scale
 * the card down, it silently clips the bottom off it.
 */
const DeliveryTrackingActivity = (
  props: DeliveryTrackingProps,
  environment: LiveActivityEnvironment
) => {
  'widget';

  const color = {
    surface: '#000000',
    chip: '#1F1F22',
    primary: '#FFFFFF',
    secondary: '#8E8E93',
    routeLabel: '#6E6E73',
    routeAddress: '#9E9EA3',
    accent: '#FFD60A',
    routeLine: '#48484C',
  };

  // SwiftUI drops to plain (empty) text if a timer range is inverted, so the upper bound
  // is clamped rather than trusted.
  const tripStart = new Date(props.startedAt);
  const tripEnd = new Date(Math.max(props.etaAt, props.startedAt));
  const trip = { lower: tripStart, upper: tripEnd };
  const arrived = props.etaAt <= Date.now();

  const travel = Math.min(1, Math.max(0, props.progress));
  const distance = `${props.distanceKm} km`;
  // Once the system marks the content stale the figures are no longer trustworthy.
  const liveColor = environment.isStale ? color.secondary : color.primary;

  /** The ETA. `timerInterval` hands the countdown to SwiftUI, which ticks it unaided. */
  const Countdown = (p: { size: number }) => {
    'use no memo';
    if (arrived) {
      return (
        <Text
          modifiers={[
            font({ size: p.size, weight: 'bold' }),
            foregroundStyle(liveColor),
            lineLimit(1),
          ]}>
          Arrived
        </Text>
      );
    }
    return (
      <Text
        timerInterval={trip}
        countsDown
        modifiers={[
          font({ size: p.size, weight: 'bold' }),
          monospacedDigit(),
          foregroundStyle(liveColor),
          lineLimit(1),
        ]}
      />
    );
  };

  /** A glyph centred in a filled circle — the truck badge and the two action buttons. */
  const CircleIcon = (p: { systemName: SFSymbol; diameter: number; glyphSize: number }) => {
    'use no memo';
    return (
      <Image
        systemName={p.systemName}
        size={p.glyphSize}
        color={color.primary}
        modifiers={[
          frame({ width: p.diameter, height: p.diameter }),
          background(color.chip, shapes.circle()),
        ]}
      />
    );
  };

  const TruckBadge = (p: { diameter: number; glyphSize: number }) => {
    'use no memo';
    return (
      <Image
        systemName="box.truck.fill"
        size={p.glyphSize}
        color={color.primary}
        modifiers={[
          symbolEffect({ effect: 'pulse' }, { options: { repeat: 'continuous', speed: 0.7 } }),
          frame({ width: p.diameter, height: p.diameter }),
          background(color.chip, shapes.circle()),
        ]}
      />
    );
  };

  /**
   * `fixedSize` is what stops "RJ 4567" rendering as "RJ…". Beside a Spacer, SwiftUI
   * was handing these stacks a width far below their ideal and truncating to fit,
   * even with most of the row empty. Fixing the horizontal axis pins them to their
   * natural width and lets the Spacer absorb what is left.
   */
  const StackedPair = (p: {
    top: React.ReactNode;
    bottom: React.ReactNode;
    align: 'leading' | 'trailing';
  }) => {
    'use no memo';
    return (
      <VStack
        alignment={p.align}
        spacing={0}
        modifiers={[fixedSize({ horizontal: true, vertical: false }), layoutPriority(1)]}>
        {p.top}
        {p.bottom}
      </VStack>
    );
  };

  const VehicleIdentity = (p: { compact?: boolean }) => {
    'use no memo';
    return (
      <HStack spacing={p.compact ? 9 : 11} alignment="center">
        <TruckBadge diameter={p.compact ? 32 : 34} glyphSize={p.compact ? 15 : 16} />
        <StackedPair
          align="leading"
          top={
            <Text
              modifiers={[
                font({ size: p.compact ? 15 : 17, weight: 'bold' }),
                foregroundStyle(color.primary),
                lineLimit(1),
              ]}>
              {props.vehiclePlate}
            </Text>
          }
          bottom={
            <Text
              modifiers={[
                font({ size: p.compact ? 11 : 12 }),
                foregroundStyle(color.secondary),
                lineLimit(1),
              ]}>
              {props.vehicleModel}
            </Text>
          }
        />
      </HStack>
    );
  };

  const EtaReadout = (p: { compact?: boolean }) => {
    'use no memo';
    return (
      <StackedPair
        align="trailing"
        top={<Countdown size={p.compact ? 15 : 17} />}
        bottom={
          <Text
            modifiers={[
              font({ size: p.compact ? 11 : 12 }),
              foregroundStyle(color.secondary),
              lineLimit(1),
            ]}>
            {distance}
          </Text>
        }
      />
    );
  };

  /**
   * The route rail. Splitting the line into a travelled segment, the dot, and a
   * remaining segment puts the dot exactly at `travel` without needing an offset, and
   * keeps the rail's total height constant as it moves.
   */
  const Rail = (p: { length: number }) => {
    'use no memo';
    return (
      <VStack spacing={0} alignment="center" modifiers={[padding({ top: 4 })]}>
        <Rectangle
          modifiers={[
            frame({ width: 2, height: p.length * travel }),
            foregroundStyle(color.accent),
          ]}
        />
        <Circle modifiers={[frame({ width: 10, height: 10 }), foregroundStyle(color.accent)]} />
        <Rectangle
          modifiers={[
            frame({ width: 2, height: p.length * (1 - travel) }),
            foregroundStyle(color.routeLine),
          ]}
        />
      </VStack>
    );
  };

  const RouteLeg = (p: { label: string; address: string }) => {
    'use no memo';
    return (
      <VStack alignment="leading" spacing={0}>
        <Text modifiers={[font({ size: 10 }), foregroundStyle(color.routeLabel), lineLimit(1)]}>
          {p.label}
        </Text>
        <Text
          modifiers={[
            font({ size: 13 }),
            foregroundStyle(color.routeAddress),
            lineLimit(1),
            minimumScaleFactor(0.7),
          ]}>
          {p.address}
        </Text>
      </VStack>
    );
  };

  const Route = () => {
    'use no memo';
    return (
      <HStack spacing={12} alignment="top">
        <Rail length={30} />
        <VStack alignment="leading" spacing={3}>
          <RouteLeg label="From" address={props.fromAddress} />
          <RouteLeg label="To" address={props.toAddress} />
        </VStack>
        <Spacer />
      </HStack>
    );
  };

  const Avatar = (p: { diameter: number }) => {
    'use no memo';
    if (props.driverAvatarUri) {
      return (
        <Image
          uiImage={props.driverAvatarUri}
          modifiers={[frame({ width: p.diameter, height: p.diameter }), clipShape('circle')]}
        />
      );
    }
    return (
      <CircleIcon systemName="person.fill" diameter={p.diameter} glyphSize={p.diameter * 0.45} />
    );
  };

  const DriverBar = () => {
    'use no memo';
    return (
      <HStack spacing={10} alignment="center">
        <CircleIcon systemName="phone.fill" diameter={28} glyphSize={12} />
        <CircleIcon systemName="ellipsis.bubble.fill" diameter={28} glyphSize={12} />
        <Spacer />
        <StackedPair
          align="trailing"
          top={
            <Text
              modifiers={[
                font({ size: 13, weight: 'bold' }),
                foregroundStyle(color.primary),
                lineLimit(1),
              ]}>
              {props.driverName}
            </Text>
          }
          bottom={
            <Text
              modifiers={[
                font({ size: 10 }),
                foregroundStyle(color.secondary),
                lineLimit(1),
              ]}>
              {`ID - ${props.driverId}`}
            </Text>
          }
        />
        <Avatar diameter={28} />
      </HStack>
    );
  };

  return {
    // Lock Screen and Notification Centre: the full card, inside the 160pt cap.
    banner: (
      <VStack
        alignment="leading"
        spacing={7}
        modifiers={[
          padding({ horizontal: 16, vertical: 6 }),
          activityBackgroundTint(color.surface),
        ]}>
        <HStack alignment="center">
          <VehicleIdentity />
          <Spacer />
          <EtaReadout />
        </HStack>
        <Route />
        <DriverBar />
      </VStack>
    ),

    // CarPlay and watchOS get the headline only — there is no room for the route.
    bannerSmall: (
      <HStack spacing={10} alignment="center" modifiers={[padding({ all: 10 })]}>
        <TruckBadge diameter={30} glyphSize={14} />
        <StackedPair
          align="leading"
          top={
            <Text
              modifiers={[
                font({ size: 14, weight: 'bold' }),
                foregroundStyle(color.primary),
                lineLimit(1),
              ]}>
              {props.vehiclePlate}
            </Text>
          }
          bottom={
            <Text
              modifiers={[font({ size: 11 }), foregroundStyle(color.secondary), lineLimit(1)]}>
              {props.toAddress}
            </Text>
          }
        />
        <Spacer />
        <Countdown size={14} />
      </HStack>
    ),

    // Dynamic Island, expanded. These regions are tighter still, so the route collapses
    // to its destination and the card's bottom row carries the actions.
    expandedLeading: <VehicleIdentity compact />,
    expandedTrailing: <EtaReadout compact />,
    expandedBottom: (
      <HStack spacing={10} alignment="center" modifiers={[padding({ top: 8 })]}>
        <Circle modifiers={[frame({ width: 8, height: 8 }), foregroundStyle(color.accent)]} />
        <Text
          modifiers={[
            font({ size: 13 }),
            foregroundStyle(color.routeAddress),
            lineLimit(1),
            minimumScaleFactor(0.7),
          ]}>
          {props.toAddress}
        </Text>
        <Spacer />
        <CircleIcon systemName="phone.fill" diameter={28} glyphSize={12} />
        <CircleIcon systemName="ellipsis.bubble.fill" diameter={28} glyphSize={12} />
        <Avatar diameter={28} />
      </HStack>
    ),

    // Dynamic Island, collapsed. The pill is a few points wide, so the ticking countdown
    // is the whole trailing side.
    compactLeading: (
      <Image
        systemName="box.truck.fill"
        size={16}
        color={color.primary}
        modifiers={[
          symbolEffect({ effect: 'pulse' }, { options: { repeat: 'continuous', speed: 0.7 } }),
        ]}
      />
    ),
    compactTrailing: <Countdown size={14} />,

    minimal: (
      <Image
        systemName="box.truck.fill"
        size={14}
        color={color.primary}
        modifiers={[
          symbolEffect({ effect: 'pulse' }, { options: { repeat: 'continuous', speed: 0.7 } }),
        ]}
      />
    ),
  };
};

export default createLiveActivity<DeliveryTrackingProps>(
  'DeliveryTrackingActivity',
  DeliveryTrackingActivity
);

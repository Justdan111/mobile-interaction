import { Circle, HStack, Image, Rectangle, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  activityBackgroundTint,
  background,
  clipShape,
  font,
  foregroundStyle,
  frame,
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
 * The two timestamps are what let the activity run on its own. Rather than a number of
 * minutes the app has to keep decrementing, the trip is described by when it began and
 * when it is due, and SwiftUI counts down between them — every second, on the Lock
 * Screen, with the app suspended or killed. The app only needs to start it and end it.
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

  // SwiftUI drops back to plain (empty) text if the range is inverted, so the upper bound
  // is clamped rather than trusted. A trip due before it started would otherwise render
  // a blank space where the ETA should be.
  const tripStart = new Date(props.startedAt);
  const tripEnd = new Date(Math.max(props.etaAt, props.startedAt));
  const trip = { lower: tripStart, upper: tripEnd };
  const arrived = props.etaAt <= Date.now();

  const distance = `${props.distanceKm} km`;
  // Once the system marks the content stale the figures are no longer trustworthy, so
  // they drop back to the secondary colour rather than reading as live.
  const liveColor = environment.isStale ? color.secondary : color.primary;

  /**
   * The ETA. `timerInterval` hands the countdown to SwiftUI, which ticks it without the
   * app running. Monospaced digits stop the text jittering as the seconds change width.
   */
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
          Arriving
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

  /**
   * The truck badge. The pulse is an indefinite SF Symbol effect, which the system runs
   * on its own the way it runs the countdown — no trigger from the app.
   */
  const TruckBadge = (p: { diameter: number; glyphSize: number }) => {
    'use no memo';
    return (
      <Image
        systemName="box.truck"
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

  const VehicleIdentity = (p: { compact?: boolean }) => {
    'use no memo';
    return (
      <HStack spacing={p.compact ? 9 : 12} alignment="center">
        <TruckBadge diameter={p.compact ? 34 : 46} glyphSize={p.compact ? 16 : 21} />
        <VStack alignment="leading" spacing={1}>
          <Text
            modifiers={[
              font({ size: p.compact ? 16 : 19, weight: 'bold' }),
              foregroundStyle(color.primary),
              lineLimit(1),
            ]}>
            {props.vehiclePlate}
          </Text>
          <Text
            modifiers={[
              font({ size: p.compact ? 12 : 14 }),
              foregroundStyle(color.secondary),
              lineLimit(1),
            ]}>
            {props.vehicleModel}
          </Text>
        </VStack>
      </HStack>
    );
  };

  const EtaReadout = (p: { compact?: boolean }) => {
    'use no memo';
    return (
      <VStack alignment="trailing" spacing={1}>
        <Countdown size={p.compact ? 16 : 19} />
        <Text
          modifiers={[
            font({ size: p.compact ? 12 : 14 }),
            foregroundStyle(color.secondary),
            lineLimit(1),
          ]}>
          {distance}
        </Text>
      </VStack>
    );
  };

  const RouteLeg = (p: { label: string; address: string }) => {
    'use no memo';
    return (
      <VStack alignment="leading" spacing={2}>
        <Text modifiers={[font({ size: 12 }), foregroundStyle(color.routeLabel)]}>{p.label}</Text>
        <Text
          modifiers={[
            font({ size: 16 }),
            foregroundStyle(color.routeAddress),
            lineLimit(1),
            minimumScaleFactor(0.8),
          ]}>
          {p.address}
        </Text>
      </VStack>
    );
  };

  /** From/To pair, with the yellow origin dot and the rule running down to the destination. */
  const Route = () => {
    'use no memo';
    return (
      <HStack spacing={14} alignment="top">
        <VStack spacing={0} alignment="center" modifiers={[padding({ top: 5 })]}>
          <Circle modifiers={[frame({ width: 10, height: 10 }), foregroundStyle(color.accent)]} />
          <Rectangle
            modifiers={[frame({ width: 2, height: 54 }), foregroundStyle(color.routeLine)]}
          />
        </VStack>
        <VStack alignment="leading" spacing={18}>
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

  /** Call / message actions on the left, driver identity and photo on the right. */
  const DriverBar = () => {
    'use no memo';
    return (
      <HStack spacing={12} alignment="center">
        <CircleIcon systemName="phone.fill" diameter={36} glyphSize={15} />
        <CircleIcon systemName="ellipsis.bubble.fill" diameter={36} glyphSize={15} />
        <Spacer />
        <VStack alignment="trailing" spacing={1}>
          <Text
            modifiers={[
              font({ size: 17, weight: 'bold' }),
              foregroundStyle(color.primary),
              lineLimit(1),
            ]}>
            {props.driverName}
          </Text>
          <Text
            modifiers={[
              font({ size: 13 }),
              foregroundStyle(color.secondary),
              lineLimit(1),
            ]}>
            {`ID - ${props.driverId}`}
          </Text>
        </VStack>
        <Avatar diameter={38} />
      </HStack>
    );
  };

  return {
    // Lock Screen and Notification Centre: the full card.
    banner: (
      <VStack
        alignment="leading"
        spacing={20}
        modifiers={[
          padding({ horizontal: 18, vertical: 16 }),
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
        <TruckBadge diameter={32} glyphSize={15} />
        <VStack alignment="leading" spacing={1}>
          <Text
            modifiers={[
              font({ size: 15, weight: 'bold' }),
              foregroundStyle(color.primary),
              lineLimit(1),
            ]}>
            {props.vehiclePlate}
          </Text>
          <Text
            modifiers={[font({ size: 12 }), foregroundStyle(color.secondary), lineLimit(1)]}>
            {props.toAddress}
          </Text>
        </VStack>
        <Spacer />
        <Countdown size={15} />
      </HStack>
    ),

    // Dynamic Island, expanded. The regions are height-constrained, so this is a tightened
    // cut of the card rather than the whole thing: the route collapses to the destination.
    expandedLeading: <VehicleIdentity compact />,
    expandedTrailing: <EtaReadout compact />,
    expandedBottom: (
      <HStack spacing={10} alignment="center" modifiers={[padding({ top: 10 })]}>
        <Circle modifiers={[frame({ width: 8, height: 8 }), foregroundStyle(color.accent)]} />
        <Text
          modifiers={[
            font({ size: 14 }),
            foregroundStyle(color.routeAddress),
            lineLimit(1),
            minimumScaleFactor(0.8),
          ]}>
          {props.toAddress}
        </Text>
        <Spacer />
        <CircleIcon systemName="phone.fill" diameter={30} glyphSize={13} />
        <CircleIcon systemName="ellipsis.bubble.fill" diameter={30} glyphSize={13} />
        <Avatar diameter={30} />
      </HStack>
    ),

    // Dynamic Island, collapsed. The pill is only a few points wide, so the ticking
    // countdown is the whole trailing side — it reads as the clock the comp draws.
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

    // Dynamic Island, minimal: shown when another activity shares the island.
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

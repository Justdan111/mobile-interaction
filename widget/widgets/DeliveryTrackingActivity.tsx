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
 * Screen, with the app suspended. `progress` positions the truck along the route, which
 * is the one thing SwiftUI cannot work out on its own.
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
 * declared inline for that reason, and every nested component carries `'use no memo'`.
 * `npm run check:widgets` enforces both.
 *
 * On sizing: each presentation has a hard height and SwiftUI clips rather than scales.
 * The Lock Screen card is budgeted near 150pt against a 160pt ceiling, and the expanded
 * Dynamic Island fits its route and driver row into a single band because the camera
 * takes most of that presentation's height. See widgets/README.md.
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
  const now = Date.now();
  const arrived = props.etaAt <= now;

  // The truck's position is taken from whichever is further along: what the app last
  // pushed, or what the clock implies. Pushes can be throttled or stop when the app is
  // suspended, and without this floor the truck would park mid-route while the countdown
  // ran on to zero. Any redraw then puts it where it should be, and it always lands at
  // the drop-off as the ETA expires.
  const span = props.etaAt - props.startedAt;
  const elapsed = span > 0 ? (now - props.startedAt) / span : 1;
  const travel = Math.min(1, Math.max(0, Math.max(props.progress, elapsed)));

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
            minimumScaleFactor(0.6),
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
          minimumScaleFactor(0.6),
        ]}
      />
    );
  };

  /** A glyph centred in a filled circle — the truck badge and the action buttons. */
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
   * `pin` stops "RJ 4567" rendering as "RJ…" beside a Spacer, which hands these stacks a
   * width well below their ideal. It is only safe where the row is wide: pinning inside
   * the Dynamic Island pushed "Arrived" straight through the island's edge, because a
   * pinned stack overflows instead of shrinking. Narrow regions scale down instead.
   */
  const StackedPair = (p: {
    top: React.ReactNode;
    bottom: React.ReactNode;
    align: 'leading' | 'trailing';
    pin?: boolean;
  }) => {
    'use no memo';
    return (
      <VStack
        alignment={p.align}
        spacing={0}
        modifiers={
          p.pin
            ? [fixedSize({ horizontal: true, vertical: false }), layoutPriority(1)]
            : [layoutPriority(1)]
        }>
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
          pin={!p.compact}
          top={
            <Text
              modifiers={[
                font({ size: p.compact ? 15 : 17, weight: 'bold' }),
                foregroundStyle(color.primary),
                lineLimit(1),
                minimumScaleFactor(0.7),
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
                minimumScaleFactor(0.7),
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
        pin={!p.compact}
        top={<Countdown size={p.compact ? 15 : 17} />}
        bottom={
          <Text
            modifiers={[
              font({ size: p.compact ? 11 : 12 }),
              foregroundStyle(color.secondary),
              lineLimit(1),
              minimumScaleFactor(0.7),
            ]}>
            {distance}
          </Text>
        }
      />
    );
  };

  /**
   * The route rail, with the truck riding it. Splitting the line into a travelled
   * segment, the truck, and a remaining segment puts the truck exactly at `travel`
   * without an offset, and keeps the rail's overall height constant as it moves.
   */
  const Rail = (p: { length: number; truck: number }) => {
    'use no memo';
    return (
      <VStack spacing={0} alignment="center" modifiers={[padding({ top: 3 })]}>
        <Circle modifiers={[frame({ width: 7, height: 7 }), foregroundStyle(color.accent)]} />
        <Rectangle
          modifiers={[
            frame({ width: 2, height: p.length * travel }),
            foregroundStyle(color.accent),
          ]}
        />
        <Image
          systemName="box.truck.fill"
          size={p.truck}
          color={color.accent}
          modifiers={[symbolEffect({ effect: 'pulse' }, { options: { repeat: 'continuous' } })]}
        />
        <Rectangle
          modifiers={[
            frame({ width: 2, height: p.length * (1 - travel) }),
            foregroundStyle(color.routeLine),
          ]}
        />
        <Circle
          modifiers={[
            frame({ width: 7, height: 7 }),
            foregroundStyle(travel >= 1 ? color.accent : color.routeLine),
          ]}
        />
      </VStack>
    );
  };

  const RouteLeg = (p: { label: string; address: string; labelSize: number; size: number }) => {
    'use no memo';
    return (
      <VStack alignment="leading" spacing={0}>
        <Text
          modifiers={[
            font({ size: p.labelSize }),
            foregroundStyle(color.routeLabel),
            lineLimit(1),
          ]}>
          {p.label}
        </Text>
        <Text
          modifiers={[
            font({ size: p.size }),
            foregroundStyle(color.routeAddress),
            lineLimit(1),
            minimumScaleFactor(0.6),
          ]}>
          {p.address}
        </Text>
      </VStack>
    );
  };

  const Route = (p: { compact?: boolean }) => {
    'use no memo';
    return (
      <HStack spacing={p.compact ? 9 : 12} alignment="top">
        <Rail length={p.compact ? 16 : 26} truck={p.compact ? 12 : 14} />
        <VStack alignment="leading" spacing={p.compact ? 1 : 3}>
          <RouteLeg
            label="From"
            address={props.fromAddress}
            labelSize={p.compact ? 9 : 10}
            size={p.compact ? 12 : 13}
          />
          <RouteLeg
            label="To"
            address={props.toAddress}
            labelSize={p.compact ? 9 : 10}
            size={p.compact ? 12 : 13}
          />
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

  const DriverIdentity = (p: { compact?: boolean }) => {
    'use no memo';
    return (
      <StackedPair
        align="trailing"
        pin={!p.compact}
        top={
          <Text
            modifiers={[
              font({ size: p.compact ? 12 : 13, weight: 'bold' }),
              foregroundStyle(color.primary),
              lineLimit(1),
              minimumScaleFactor(0.7),
            ]}>
            {props.driverName}
          </Text>
        }
        bottom={
          <Text
            modifiers={[
              font({ size: p.compact ? 9 : 10 }),
              foregroundStyle(color.secondary),
              lineLimit(1),
              minimumScaleFactor(0.7),
            ]}>
            {`ID - ${props.driverId}`}
          </Text>
        }
      />
    );
  };

  const DriverBar = () => {
    'use no memo';
    return (
      <HStack spacing={10} alignment="center">
        <CircleIcon systemName="phone.fill" diameter={28} glyphSize={12} />
        <CircleIcon systemName="ellipsis.bubble.fill" diameter={28} glyphSize={12} />
        <Spacer />
        <DriverIdentity />
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
                minimumScaleFactor(0.7),
              ]}>
              {props.vehiclePlate}
            </Text>
          }
          bottom={
            <Text
              modifiers={[
                font({ size: 11 }),
                foregroundStyle(color.secondary),
                lineLimit(1),
                minimumScaleFactor(0.7),
              ]}>
              {props.toAddress}
            </Text>
          }
        />
        <Spacer />
        <Countdown size={14} />
      </HStack>
    ),

    // Dynamic Island, expanded. The camera band takes most of this presentation's height,
    // so the route and the driver share a single band rather than stacking.
    expandedLeading: <VehicleIdentity compact />,
    expandedTrailing: <EtaReadout compact />,
    expandedBottom: (
      <HStack spacing={10} alignment="center" modifiers={[padding({ top: 6 })]}>
        <Route compact />
        <CircleIcon systemName="phone.fill" diameter={26} glyphSize={11} />
        <CircleIcon systemName="ellipsis.bubble.fill" diameter={26} glyphSize={11} />
        <DriverIdentity compact />
        <Avatar diameter={26} />
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

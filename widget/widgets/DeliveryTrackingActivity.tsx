import {
  Circle,
  HStack,
  Image,
  Rectangle,
  Spacer,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import {
  activityBackgroundTint,
  background,
  clipShape,
  font,
  foregroundStyle,
  frame,
  padding,
  shapes,
} from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';
import type { SFSymbol } from 'sf-symbols-typescript';

/**
 * Content shown by the delivery-tracking Live Activity. Every field is supplied by the
 * app on `start()` / `update()` — the layout below is a pure function of it.
 */
export type DeliveryTrackingProps = {
  /** Vehicle registration, shown as the headline. For example `RJ 4567`. */
  vehiclePlate: string;
  /** Vehicle make/model shown under the plate. For example `Volvo max s23`. */
  vehicleModel: string;
  /** Remaining time to the drop-off, in whole minutes. */
  etaMinutes: number;
  /** Remaining distance to the drop-off, in kilometres. */
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
 * its own declarations, and `props` / `environment`. Colour tokens are declared inline
 * for that reason — importing them from a shared module would type check and then be
 * `undefined` on device. `npm run check:widgets` enforces this. See widgets/README.md.
 *
 * Every nested component carries `'use no memo'`: Expo opts the `'widget'` function out
 * of the React Compiler, but that does not extend to functions declared inside it, and
 * compiled output calls a `_c` memo-cache helper the widget runtime does not provide.
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

  const eta = `${props.etaMinutes} Min`;
  const distance = `${props.distanceKm} km`;
  // Once the system marks the content stale the ETA is no longer trustworthy, so it drops
  // back to the secondary colour rather than continuing to read as a live figure.
  const etaColor = environment.isStale ? color.secondary : color.primary;

  // A glyph centred in a filled circle — the truck badge and the two action buttons.
  const CircleIcon = (iconProps: {
    systemName: SFSymbol;
    diameter: number;
    glyphSize: number;
  }) => {
    'use no memo';
    return (
      <Image
        systemName={iconProps.systemName}
        size={iconProps.glyphSize}
        color={color.primary}
        modifiers={[
          frame({ width: iconProps.diameter, height: iconProps.diameter }),
          background(color.chip, shapes.circle()),
        ]}
      />
    );
  };

  // Plate over model, led by the truck badge. Top-left of the card.
  const VehicleIdentity = () => {
    'use no memo';
    return (
      <HStack spacing={12} alignment="center">
        <CircleIcon systemName="box.truck.fill" diameter={44} glyphSize={20} />
        <VStack alignment="leading" spacing={1}>
          <Text modifiers={[font({ size: 18, weight: 'bold' }), foregroundStyle(color.primary)]}>
            {props.vehiclePlate}
          </Text>
          <Text modifiers={[font({ size: 14 }), foregroundStyle(color.secondary)]}>
            {props.vehicleModel}
          </Text>
        </VStack>
      </HStack>
    );
  };

  // ETA over remaining distance. Top-right of the card.
  const EtaReadout = () => {
    'use no memo';
    return (
      <VStack alignment="trailing" spacing={1}>
        <Text modifiers={[font({ size: 18, weight: 'bold' }), foregroundStyle(etaColor)]}>
          {eta}
        </Text>
        <Text modifiers={[font({ size: 14 }), foregroundStyle(color.secondary)]}>{distance}</Text>
      </VStack>
    );
  };

  const RouteLeg = (legProps: { label: string; address: string }) => {
    'use no memo';
    return (
      <VStack alignment="leading" spacing={2}>
        <Text modifiers={[font({ size: 12 }), foregroundStyle(color.routeLabel)]}>
          {legProps.label}
        </Text>
        <Text modifiers={[font({ size: 16 }), foregroundStyle(color.routeAddress)]}>
          {legProps.address}
        </Text>
      </VStack>
    );
  };

  // From/To pair, with the yellow origin dot and the rule running down to the destination.
  const Route = () => {
    'use no memo';
    return (
      <HStack spacing={14} alignment="top">
        <VStack spacing={0} alignment="center" modifiers={[padding({ top: 4 })]}>
          <Circle modifiers={[frame({ width: 10, height: 10 }), foregroundStyle(color.accent)]} />
          <Rectangle modifiers={[frame({ width: 2, height: 52 }), foregroundStyle(color.routeLine)]} />
        </VStack>
        <VStack alignment="leading" spacing={16}>
          <RouteLeg label="From" address={props.fromAddress} />
          <RouteLeg label="To" address={props.toAddress} />
        </VStack>
        <Spacer />
      </HStack>
    );
  };

  // Call / message actions on the left, driver identity and photo on the right.
  const DriverBar = () => {
    'use no memo';
    return (
      <HStack spacing={12} alignment="center">
        <CircleIcon systemName="phone.fill" diameter={36} glyphSize={15} />
        <CircleIcon systemName="ellipsis.message.fill" diameter={36} glyphSize={15} />
        <Spacer />
        <VStack alignment="trailing" spacing={1}>
          <Text modifiers={[font({ size: 17, weight: 'bold' }), foregroundStyle(color.primary)]}>
            {props.driverName}
          </Text>
          <Text modifiers={[font({ size: 13 }), foregroundStyle(color.secondary)]}>
            {`ID - ${props.driverId}`}
          </Text>
        </VStack>
        {props.driverAvatarUri ? (
          <Image
            uiImage={props.driverAvatarUri}
            modifiers={[frame({ width: 38, height: 38 }), clipShape('circle')]}
          />
        ) : (
          <CircleIcon systemName="person.fill" diameter={38} glyphSize={17} />
        )}
      </HStack>
    );
  };

  return {
    // Lock Screen and Notification Centre: the full card.
    banner: (
      <VStack
        alignment="leading"
        spacing={18}
        modifiers={[
          padding({ horizontal: 16, vertical: 14 }),
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
        <CircleIcon systemName="box.truck.fill" diameter={32} glyphSize={15} />
        <VStack alignment="leading" spacing={1}>
          <Text modifiers={[font({ size: 15, weight: 'bold' }), foregroundStyle(color.primary)]}>
            {props.vehiclePlate}
          </Text>
          <Text modifiers={[font({ size: 12 }), foregroundStyle(color.secondary)]}>
            {props.toAddress}
          </Text>
        </VStack>
        <Spacer />
        <Text modifiers={[font({ size: 15, weight: 'bold' }), foregroundStyle(etaColor)]}>
          {eta}
        </Text>
      </HStack>
    ),

    // Dynamic Island, expanded. Leading and trailing flank the camera; bottom spans the width.
    expandedLeading: <VehicleIdentity />,
    expandedTrailing: <EtaReadout />,
    expandedBottom: (
      <VStack alignment="leading" spacing={16} modifiers={[padding({ top: 10 })]}>
        <Route />
        <DriverBar />
      </VStack>
    ),

    // Dynamic Island, collapsed: truck on one side, ETA and a clock on the other.
    compactLeading: <Image systemName="box.truck.fill" size={16} color={color.primary} />,
    compactTrailing: (
      <HStack spacing={5} alignment="center">
        <Text modifiers={[font({ size: 15, weight: 'semibold' }), foregroundStyle(etaColor)]}>
          {eta}
        </Text>
        <Image
          systemName="clock.fill"
          size={11}
          color={color.primary}
          modifiers={[frame({ width: 22, height: 22 }), background(color.chip, shapes.circle())]}
        />
      </HStack>
    ),

    // Dynamic Island, minimal: shown when another activity shares the island.
    minimal: <Image systemName="box.truck.fill" size={14} color={color.primary} />,
  };
};

export default createLiveActivity<DeliveryTrackingProps>(
  'DeliveryTrackingActivity',
  DeliveryTrackingActivity
);

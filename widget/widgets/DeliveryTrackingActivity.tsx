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
 * Built from `docs/design-spec.md`, which is measured off the comps rather than eyeballed.
 * Colours, glyph weights, alignment and the driver's photo are the comp's; the vertical
 * rhythm is not, because the comp is 295pt tall at 361pt wide and every Live Activity
 * presentation caps out near 160pt. SwiftUI clips instead of scaling, so the comp's
 * ~132pt of whitespace is spent first and the type is trimmed second — but only as far
 * as the cap demands, so every size here is the largest the budget allows.
 *
 * Two rules govern the code itself. The body is serialised by `babel-preset-expo` and
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

  // Sampled from ref-03. p90 equalled max for every one of these, so they are the
  // comp's real values rather than an antialiased guess.
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
   * Each presentation gets its own measured sizes rather than one scale factor, because
   * they have different budgets. The Lock Screen card owns all ~160pt; the expanded
   * island loses about 30pt to the camera band and system padding before anything of
   * ours is drawn, and its top row has to sit beside the camera.
   *
   * The comp's sizes are: badge 54, plate 16, model 13.5, labels 13.5, addresses 15.5,
   * dot 10, actions 35.5, name 16, id 11.8, avatar 35. The card runs at ~0.8 of that,
   * the island at ~0.72 — the most either budget holds without dropping a row.
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
   *
   * A timer text takes every point of width it is offered and lays its digits out from
   * the leading edge, so where it sits at the end of a row it needs `trailing` to keep
   * the digits flush with the distance under them.
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
   * `pin` stops `RJ 4567` rendering as `RJ…` beside a Spacer, which otherwise hands these
   * stacks a width well below their ideal. It is only safe where the row is wide: a pinned
   * stack refuses to shrink, so inside the Dynamic Island it overflows and the presentation
   * clips it — that is what cut the last letter off `Arrived`. Narrow regions take a width
   * cap instead, which is what gives `minimumScaleFactor` something to scale against.
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

  /** Truck badge, then plate over model. The comp uses the outline truck here. */
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
   * The route. The comp puts the origin dot level with the *address*, not the `From` label,
   * and runs a thin rule from it down beside `To`. There is no second dot and no vehicle on
   * the rail — a truck there read as an amber smear against the dot and rule.
   *
   * The comp indents the whole block: the dot sits 34pt in from the card's edge and the
   * text 52pt, well inside the badge's left edge. `inset` reproduces that.
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

  /** The driver's photo — the comp's, cut to a circle — with a glyph only if it is missing. */
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

  /**
   * Call and message on the left, driver identity and photo on the right. Outline glyphs.
   * The comp's two buttons sit 27pt apart, wider than the gutter elsewhere.
   */
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
   * The collapsed pill, straight from ref-02: a grey capsule in the leading region with the
   * truck at its right-hand end, then the ETA, then a grey circle holding a clock.
   *
   * Reading that capsule as a track explains the comp — a truck parked at the right end is
   * the arrived state — so the truck rides it, sitting further left earlier in the trip.
   * The two regions flank the camera and cannot be spanned, so this is the only place in
   * the collapsed presentation where travel can be shown.
   */
  const CompactRail = () => {
    'use no memo';
    // The comp's capsule is 119.5pt with an 18.6pt truck ending 6.6pt short of its right
    // end. The pill already stretches to ~250pt with a 60pt track, so the track goes as
    // wide as the region will take; a narrow one leaves a 24pt glyph parked at 70% of
    // the way along at travel 1, which does not read as arrived.
    // The region clips anything past about 100pt, flattening the capsule's right end.
    const capW = 96;
    const truckW = 24;
    const endGap = 5;
    // The truck is positioned by an offset measured from the capsule's centre, not from
    // its leading edge. A ZStack centres its child regardless of the alignment asked for
    // here, so a leading-relative offset landed the glyph further right than intended and
    // the capsule clipped it to a sliver at travel 1. Measuring from the centre cancels the
    // glyph's own width out of the sum, so a wrong estimate of it only shortens the run
    // rather than pushing the truck off the end. The run is symmetric: at travel 0 the
    // truck sits `endGap` from the left end, at travel 1 `endGap` from the right.
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
    // Lock Screen and Notification Centre. The widest presentation, so it carries the
    // comp's proportions most closely: badge in the corner, route indented under it,
    // actions and driver along the bottom.
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

    // Dynamic Island, expanded — the presentation ref-03 was drawn for. The camera band
    // and system padding take about 30pt of its ~160, and the top row sits beside the
    // camera, so the bottom region gets what is left for the route and the driver.
    expandedLeading: (
      <HStack modifiers={[padding({ leading: 4 })]}>
        <VehicleIdentity s={ISLAND} cap={150} />
        <Spacer />
      </HStack>
    ),
    // The island's rounded corner clips whatever hugs the edge, and the trailing content
    // was landing 5pt from it — which is what kept cutting the last letter off `Arrived`.
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

    // Dynamic Island, collapsed — ref-01 and ref-02.
    compactLeading: <CompactRail />,
    // The ETA sits where iOS puts it: the compact regions flank the 126pt hardware
    // island and each pins its content to the pill's outer edge, and neither a Spacer
    // nor a fixed-width row moves it inward. The black stretch between the track and
    // the ETA is the camera on a real phone; the comp's 47pt camera gap is not physical.
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

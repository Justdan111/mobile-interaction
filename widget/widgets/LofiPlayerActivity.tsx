import {
  Button,
  Capsule,
  Circle,
  HStack,
  Image,
  ProgressView,
  RoundedRectangle,
  Spacer,
  Text,
  VStack,
  ZStack,
} from '@expo/ui/swift-ui';
import {
  activityBackgroundTint,
  background,
  buttonStyle,
  clipShape,
  font,
  foregroundStyle,
  frame,
  labelsHidden,
  lineLimit,
  minimumScaleFactor,
  offset,
  opacity,
  padding,
  resizable,
  rotationEffect,
  strokeBorder,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';
import type { SFSymbol } from 'sf-symbols-typescript';

/**
 * What the LO-FI player Live Activity shows.
 *
 * While playing, `startedAt`/`endsAt` hand the progress bar to SwiftUI, which fills it on
 * its own with the app suspended. Paused, the bar freezes at `position`. `reelAngle` is the
 * one figure only the app can advance: nothing in a Live Activity spins by itself, so the
 * app pushes it while it is in the foreground and the reels hold still otherwise.
 */
export type LofiPlayerProps = {
  /** Track title. For example `Crossroads`. */
  title: string;
  /** Artist, shown under the title. For example `Pocket-Soul`. */
  artist: string;
  isPlaying: boolean;
  /** When the track would have started, in ms since the epoch, given its current position. */
  startedAt: number;
  /** When the track ends at the current position, in ms since the epoch. */
  endsAt: number;
  /** Fraction of the track played, `0`-`1`. Only drawn while paused. */
  position: number;
  /** Rotation of the tape hubs, in degrees. */
  reelAngle: number;
  repeatOn: boolean;
  /**
   * `file://` URIs staged into `widgetsDirectory` by `stageWidgetAssets`. The stickers are
   * cut from docs/screenshots/widget-3, the reel art drawn by tools/make-lofi-art.py.
   */
  lofiStickerUri?: string;
  smileyStickerUri?: string;
  headphonesStickerUri?: string;
  reelHubUri?: string;
  vinylUri?: string;
  vinylRimUri?: string;
};

/**
 * Built from docs/design-spec-lofi.md. The comp is one 371 x 199pt canvas — a grey cassette
 * shell over a dark island, controls underneath — against a ~160pt ceiling, so the shell is
 * drawn into whatever height each presentation leaves and its contents are placed by the
 * comp's own coordinates, scaled. See `Shell`.
 *
 * The body is serialised by `babel-preset-expo` and re-evaluated in the widget extension, so
 * it may only reach for `@expo/ui`, JS builtins and its own declarations — hence the inline
 * colour tokens. Every nested component needs `'use no memo'`. `npm run check:widgets`
 * enforces both.
 */
const LofiPlayerActivity = (props: LofiPlayerProps, environment: LiveActivityEnvironment) => {
  'widget';

  const color = {
    surface: '#1F1F1F',
    shellTop: '#7C7C7C',
    shell: '#5A5A5A',
    shellBottom: '#4C4C4C',
    shellEdge: '#6A6A6A',
    window: '#1E1E1E',
    track: '#323232',
    orange: '#F4B64B',
    title: '#FFFFFF',
    artist: '#C4C4C4',
    button: '#212121',
    buttonRing: '#434343',
    well: '#1A1A1A',
    wellEdge: '#080808',
    wellGlyph: '#5A5A5A',
    glyph: '#E5E5E5',
    dimGlyph: '#8E8E8E',
  };

  /** The comp's shell canvas, in points. Everything inside it is placed in these units. */
  const COMP_W = 371;
  const COMP_H = 140;

  const playing = props.isPlaying && !environment.isStale;
  const lower = new Date(props.startedAt);
  // `lower > upper` makes SwiftUI drop the timer branch silently, so clamp it.
  const upper = new Date(Math.max(props.startedAt, props.endsAt));
  const position = Math.min(1, Math.max(0, props.position));

  /**
   * Centres a child at (cx, cy) inside a ZStack of size W x H. A ZStack here centres its
   * children whatever alignment is asked for, so position is an offset from the middle —
   * see "Position by offset" in README.md.
   */
  const At = (p: {
    W: number;
    H: number;
    cx: number;
    cy: number;
    w: number;
    h: number;
    children: React.ReactNode;
  }) => {
    'use no memo';
    return (
      <ZStack
        modifiers={[
          frame({ width: p.w, height: p.h }),
          offset({ x: p.cx - p.W / 2, y: p.cy - p.H / 2 }),
        ]}>
        {p.children}
      </ZStack>
    );
  };

  /** A staged PNG at a fixed frame, or an empty frame of the same size if it was not staged. */
  const Art = (p: { uri?: string; w: number; h: number; angle?: number }) => {
    'use no memo';
    if (!p.uri) {
      return <Spacer modifiers={[frame({ width: p.w, height: p.h })]} />;
    }
    return (
      <Image
        uiImage={p.uri}
        modifiers={[
          resizable(),
          frame({ width: p.w, height: p.h }),
          rotationEffect(p.angle ?? 0),
        ]}
      />
    );
  };

  /**
   * A tape spool: grooved vinyl that looks the same at any angle, and the toothed hub on
   * top of it, which is the part that visibly turns.
   */
  const Reel = (p: { vinyl: number; hub: number; rim?: boolean }) => {
    'use no memo';
    return (
      <ZStack modifiers={[frame({ width: p.vinyl, height: p.vinyl })]}>
        <Art uri={p.rim ? props.vinylRimUri : props.vinylUri} w={p.vinyl} h={p.vinyl} />
        <Art uri={props.reelHubUri} w={p.hub} h={p.hub} angle={props.reelAngle} />
      </ZStack>
    );
  };

  /**
   * Orange fill on a dark capsule. Playing, SwiftUI advances it from the track's start and
   * end dates; paused, it holds `position`. The system draws its own translucent track,
   * which reads as the comp's dark groove over the `track` capsule behind it.
   */
  const Bar = (p: { w: number; h: number }) => {
    'use no memo';
    const style = [labelsHidden(), tint(color.orange), frame({ width: p.w })];
    return (
      <ZStack modifiers={[frame({ width: p.w, height: p.h })]}>
        <Capsule modifiers={[foregroundStyle(color.track), frame({ width: p.w, height: p.h })]} />
        {playing ? (
          <ProgressView timerInterval={{ lower, upper }} countsDown={false} modifiers={style} />
        ) : (
          <ProgressView value={position} modifiers={style} />
        )}
      </ZStack>
    );
  };

  /**
   * The cassette shell, the comp's top 140pt, drawn W x H. Positions scale by width and
   * height separately so the shell fills whatever room a presentation has; artwork scales
   * by height only, keeping circles round. Text keeps legible sizes rather than scaling.
   *
   * `stickers` draws LO-FI and the headphones inside the shell, as the comp does. The
   * Dynamic Island moves them up beside the camera instead, where they cost no height.
   */
  const Shell = (p: {
    W: number;
    H: number;
    stickers: boolean;
    titleSize: number;
    artistSize: number;
    barH: number;
    /**
     * Artwork scale floor. A short shell would otherwise shrink the reels and smiley to
     * specks beside text that keeps its size; the window clips whatever this overgrows.
     */
    minArt?: number;
  }) => {
    'use no memo';
    const sx = p.W / COMP_W;
    const sy = p.H / COMP_H;
    const sa = Math.max(sy, p.minArt ?? 0);

    // The dark window the right-hand reel spins in: comp x 100-358, y 6-106.
    const win = { cx: 229 * sx, cy: 56 * sy, w: 258 * sx, h: 100 * sy };
    // Right reel at comp (269, 69), expressed relative to the window's centre.
    const rightReel = { x: 269 * sx - win.cx, y: 69 * sy - win.cy };

    const textH = (p.titleSize + p.artistSize) * 1.25;
    const barY = 125.5 * sy;
    const textW = 150 * sx;

    return (
      <ZStack
        modifiers={[
          frame({ width: p.W, height: p.H }),
          clipShape('roundedRectangle', 26 * sy + 4),
          // As a modifier, not a second shape: a bare shape fills itself with the default
          // foreground and would paint over the shell.
          strokeBorder({
            color: color.shellEdge,
            style: { lineWidth: 1 },
            shape: 'roundedRectangle',
            cornerRadius: 26 * sy + 4,
          }),
        ]}>
        <RoundedRectangle
          cornerRadius={26 * sy + 4}
          modifiers={[
            foregroundStyle({
              type: 'linearGradient',
              colors: [color.shellTop, color.shell, color.shell, color.shellBottom],
              startPoint: { x: 0.5, y: 0 },
              endPoint: { x: 0.5, y: 1 },
            }),
          ]}
        />

        <At W={p.W} H={p.H} cx={win.cx} cy={win.cy} w={win.w} h={win.h}>
          <ZStack
            modifiers={[
              frame({ width: win.w, height: win.h }),
              background(color.window),
              clipShape('roundedRectangle', win.h * 0.4),
            ]}>
            <ZStack modifiers={[offset(rightReel)]}>
              <Reel vinyl={124 * sa} hub={56 * sa} />
            </ZStack>
          </ZStack>
        </At>

        {/* The left spool sits under the translucent shell, so it reads faded. */}
        <At W={p.W} H={p.H} cx={106 * sx} cy={69 * sy} w={96 * sa} h={96 * sa}>
          <ZStack modifiers={[opacity(0.4)]}>
            <Reel vinyl={96 * sa} hub={56 * sa} />
          </ZStack>
        </At>

        <At W={p.W} H={p.H} cx={186 * sx} cy={60 * sy} w={48 * sa} h={48 * sa}>
          <Art uri={props.smileyStickerUri} w={48 * sa} h={48 * sa} />
        </At>

        {p.stickers ? (
          <At W={p.W} H={p.H} cx={321 * sx} cy={55 * sy} w={56 * sy} h={60 * sy}>
            <Art uri={props.headphonesStickerUri} w={56 * sy} h={60 * sy} />
          </At>
        ) : (
          <Spacer modifiers={[frame({ width: 0, height: 0 })]} />
        )}
        {p.stickers ? (
          <At W={p.W} H={p.H} cx={43 * sx} cy={43 * sy} w={60 * sy} h={51 * sy}>
            <Art uri={props.lofiStickerUri} w={60 * sy} h={51 * sy} />
          </At>
        ) : (
          <Spacer modifiers={[frame({ width: 0, height: 0 })]} />
        )}

        {/* Title block, bottom-anchored just above the bar. */}
        <At
          W={p.W}
          H={p.H}
          cx={21 * sx + textW / 2}
          cy={barY - p.barH - 3 - textH / 2}
          w={textW}
          h={textH}>
          <VStack
            alignment="leading"
            spacing={0}
            modifiers={[frame({ width: textW, height: textH, alignment: 'bottomLeading' })]}>
            <Text
              modifiers={[
                font({ size: p.titleSize, weight: 'bold' }),
                foregroundStyle(color.title),
                lineLimit(1),
                minimumScaleFactor(0.7),
              ]}>
              {props.title}
            </Text>
            <Text
              modifiers={[
                font({ size: p.artistSize }),
                foregroundStyle(color.artist),
                lineLimit(1),
                minimumScaleFactor(0.7),
              ]}>
              {props.artist}
            </Text>
          </VStack>
        </At>

        <At W={p.W} H={p.H} cx={182.5 * sx} cy={barY} w={269 * sx} h={p.barH}>
          <Bar w={269 * sx} h={p.barH} />
        </At>
      </ZStack>
    );
  };

  /** A control that sends `target` to the app, which owns playback and pushes the result. */
  const Control = (p: { target: string; children: React.ReactElement }) => {
    'use no memo';
    return (
      <Button target={p.target} modifiers={[buttonStyle('plain')]}>
        {p.children}
      </Button>
    );
  };

  const RoundButton = (p: { target: string; systemName: SFSymbol; d: number }) => {
    'use no memo';
    return (
      <Control target={p.target}>
        <ZStack
          modifiers={[
            frame({ width: p.d, height: p.d }),
            strokeBorder({ color: color.buttonRing, style: { lineWidth: 1.5 }, shape: 'circle' }),
          ]}>
          <Circle modifiers={[foregroundStyle(color.button)]} />
          <Image systemName={p.systemName} size={p.d * 0.36} color={color.glyph} />
        </ZStack>
      </Control>
    );
  };

  /** Repeat · rewind · play/pause well · forward · AirPlay, at the comp's 40pt scaled by `k`. */
  const Controls = (p: { k: number }) => {
    'use no memo';
    const d = 40 * p.k;
    return (
      <HStack spacing={0} alignment="center">
        <Spacer />
        <Control target="repeat">
          <Image
            systemName="repeat"
            size={20 * p.k}
            color={props.repeatOn ? color.orange : color.dimGlyph}
            modifiers={[frame({ width: d, height: d })]}
          />
        </Control>
        <Spacer />
        <HStack spacing={6 * p.k} alignment="center">
          <RoundButton target="previous" systemName="backward.fill" d={d} />
          <Control target="toggle">
            <ZStack
              modifiers={[
                frame({ width: 88 * p.k, height: d }),
                strokeBorder({ color: color.wellEdge, style: { lineWidth: 2 }, shape: 'capsule' }),
              ]}>
              <Capsule modifiers={[foregroundStyle(color.well)]} />
              <Image
                systemName={props.isPlaying ? 'pause.fill' : 'play.fill'}
                size={d * 0.4}
                color={props.isPlaying ? color.wellGlyph : color.glyph}
              />
            </ZStack>
          </Control>
          <RoundButton target="next" systemName="forward.fill" d={d} />
        </HStack>
        <Spacer />
        <Control target="airplay">
          <Image
            systemName="airplay.audio"
            size={20 * p.k}
            color={color.dimGlyph}
            modifiers={[frame({ width: d, height: d })]}
          />
        </Control>
        <Spacer />
      </HStack>
    );
  };

  /** The spinning disc in the pill's trailing region: pale rim, grooves, turning hub. */
  const Disc = (p: { d: number }) => {
    'use no memo';
    return <Reel vinyl={p.d} hub={p.d * 0.42} rim />;
  };

  // Lock Screen width less the banner's padding; a shortfall only leaves a margin, an
  // overshoot is clipped by the card, so err small.
  const BANNER_W = 344;
  const ISLAND_W = 336;

  return {
    // Lock Screen: the whole comp — shell with all three stickers, then the controls.
    banner: (
      <VStack
        spacing={6}
        modifiers={[
          padding({ horizontal: 8, vertical: 7 }),
          activityBackgroundTint(color.surface),
        ]}>
        <Shell W={BANNER_W} H={100} stickers titleSize={14} artistSize={12} barH={5} />
        <Controls k={0.82} />
      </VStack>
    ),

    // CarPlay and watchOS — ref-02's strip: sticker cluster, title, spinning disc.
    bannerSmall: (
      <HStack spacing={8} alignment="center" modifiers={[padding({ all: 8 })]}>
        <ZStack modifiers={[frame({ width: 64, height: 44 })]}>
          <ZStack modifiers={[offset({ x: -10, y: -8 })]}>
            <Art uri={props.lofiStickerUri} w={38} h={32} />
          </ZStack>
          <ZStack modifiers={[offset({ x: -4, y: 12 })]}>
            <Art uri={props.smileyStickerUri} w={18} h={18} />
          </ZStack>
          <ZStack modifiers={[offset({ x: 20, y: 2 })]}>
            <Art uri={props.headphonesStickerUri} w={26} h={28} />
          </ZStack>
        </ZStack>
        <Spacer />
        <VStack spacing={1}>
          <Text modifiers={[font({ size: 14, weight: 'bold' }), foregroundStyle(color.title), lineLimit(1)]}>
            {props.title}
          </Text>
          <Text modifiers={[font({ size: 12 }), foregroundStyle(color.artist), lineLimit(1)]}>
            {props.artist}
          </Text>
        </VStack>
        <Spacer />
        <Disc d={40} />
      </HStack>
    ),

    // Dynamic Island, expanded (ref-03). The stickers flank the camera; the shell and the
    // controls take the band below it.
    expandedLeading: (
      <HStack modifiers={[padding({ leading: 6, top: 2 })]}>
        <Art uri={props.lofiStickerUri} w={47} h={40} />
        <Spacer />
      </HStack>
    ),
    expandedTrailing: (
      <HStack modifiers={[padding({ trailing: 10, top: 2 })]}>
        <Spacer />
        <Art uri={props.headphonesStickerUri} w={38} h={40} />
      </HStack>
    ),
    expandedBottom: (
      <VStack spacing={5}>
        <Shell
          W={ISLAND_W}
          H={54}
          stickers={false}
          titleSize={13}
          artistSize={11}
          barH={4}
          minArt={0.6}
        />
        <Controls k={0.7} />
      </VStack>
    ),

    // Dynamic Island, collapsed (ref-01): LO-FI, and the disc turning on the right.
    compactLeading: (
      <HStack modifiers={[padding({ leading: 2 })]}>
        <Art uri={props.lofiStickerUri} w={30} h={26} />
      </HStack>
    ),
    compactTrailing: <Disc d={32} />,

    minimal: <Disc d={22} />,
  };
};

export default createLiveActivity<LofiPlayerProps>('LofiPlayerActivity', LofiPlayerActivity);

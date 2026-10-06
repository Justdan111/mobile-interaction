import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { TRACKS, positionAt, type LofiCommand, type Playback } from './useLofiPlayer';

const ART = {
  lofi: require('../../assets/widgets/lofi-sticker.png'),
  smiley: require('../../assets/widgets/smiley-sticker.png'),
  headphones: require('../../assets/widgets/headphones-sticker.png'),
  hub: require('../../assets/widgets/reel-hub.png'),
  vinyl: require('../../assets/widgets/vinyl.png'),
};

/** The comp's canvas, in points. The preview draws at this size and scales to fit. */
const W = 371;
const H = 199;

const C = {
  island: '#1F1F1F',
  shell: '#5A5A5A',
  shellTop: '#7C7C7C',
  window: '#1E1E1E',
  track: '#323232',
  orange: '#F4B64B',
  artist: '#C4C4C4',
  button: '#212121',
  ring: '#434343',
  well: '#1A1A1A',
  wellEdge: '#080808',
  wellGlyph: '#5A5A5A',
  glyph: '#E5E5E5',
  dim: '#8E8E8E',
};

/** Positions a box by its centre, in comp points — the same coordinates the widget uses. */
function at(cx: number, cy: number, w: number, h: number) {
  return { position: 'absolute' as const, left: cx - w / 2, top: cy - h / 2, width: w, height: h };
}

function Reel({ vinyl, hub, angle }: { vinyl: number; hub: number; angle: number }) {
  return (
    <View style={{ width: vinyl, height: vinyl, alignItems: 'center', justifyContent: 'center' }}>
      {/* Explicit size: absoluteFill alone lets the image draw at its natural 288pt. */}
      <Image source={ART.vinyl} style={{ position: 'absolute', width: vinyl, height: vinyl }} />
      <Image source={ART.hub} style={{ width: hub, height: hub, transform: [{ rotate: `${angle}deg` }] }} />
    </View>
  );
}

function Glyph({ name, size, color }: { name: SFSymbol; size: number; color: string }) {
  return <SymbolView name={name} size={size} tintColor={color} type="monochrome" />;
}

/**
 * ref-03 at its own size: the expanded island as the comp draws it. The Live Activity has
 * to fit this into ~160pt, so the preview is where the full proportions live. Its buttons
 * send the same commands as the island's.
 */
export function LofiPreview({
  playback,
  now,
  angle,
  onCommand,
}: {
  playback: Playback;
  now: number;
  angle: number;
  onCommand: (command: LofiCommand) => void;
}) {
  const { width } = useWindowDimensions();
  const scale = Math.min(1, (width - 40) / W);
  const track = TRACKS[playback.index];
  const fraction = positionAt(playback, now) / track.durationMs;

  return (
    <View style={{ width: W * scale, height: H * scale }}>
      <View style={[s.island, { transform: [{ scale }], left: (W * scale - W) / 2, top: (H * scale - H) / 2 }]}>
        <View style={s.shell}>
          <View style={s.shellSheen} />
          <View style={s.window}>
            <View style={at(169, 63, 124, 124)}>
              <Reel vinyl={124} hub={56} angle={angle} />
            </View>
          </View>
          <View style={[at(106, 69, 96, 96), { opacity: 0.4 }]}>
            <Reel vinyl={96} hub={56} angle={angle} />
          </View>
          <Image source={ART.smiley} style={at(186, 60, 48, 48)} />
          <Image source={ART.headphones} style={at(321, 55, 56, 60)} />
          <Image source={ART.lofi} style={at(43, 43, 60, 51)} />
          <View style={s.titles}>
            <Text style={s.title} numberOfLines={1}>{track.title}</Text>
            <Text style={s.artist} numberOfLines={1}>{track.artist}</Text>
          </View>
          <View style={s.bar}>
            <View style={[s.fill, { width: `${fraction * 100}%` }]} />
          </View>
        </View>

        <View style={s.controls}>
          <Pressable onPress={() => onCommand('repeat')} style={s.side}>
            <Glyph name="repeat" size={20} color={playback.repeatOn ? C.orange : C.dim} />
          </Pressable>
          <View style={s.cluster}>
            <Pressable onPress={() => onCommand('previous')} style={s.round}>
              <Glyph name="backward.fill" size={15} color={C.glyph} />
            </Pressable>
            <Pressable onPress={() => onCommand('toggle')} style={s.wellButton}>
              <Glyph
                name={playback.playing ? 'pause.fill' : 'play.fill'}
                size={16}
                color={playback.playing ? C.wellGlyph : C.glyph}
              />
            </Pressable>
            <Pressable onPress={() => onCommand('next')} style={s.round}>
              <Glyph name="forward.fill" size={15} color={C.glyph} />
            </Pressable>
          </View>
          <Pressable onPress={() => onCommand('airplay')} style={s.side}>
            <Glyph name="airplay.audio" size={20} color={C.dim} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  island: { position: 'absolute', width: W, height: H, backgroundColor: C.island, borderRadius: 44, overflow: 'hidden' },
  shell: { position: 'absolute', left: 2, top: 3, width: 367, height: 140, borderRadius: 30, backgroundColor: C.shell, overflow: 'hidden', borderWidth: 1, borderColor: '#6A6A6A' },
  shellSheen: { position: 'absolute', left: 0, right: 0, top: 0, height: 18, backgroundColor: C.shellTop, opacity: 0.45 },
  window: { position: 'absolute', left: 100, top: 6, width: 258, height: 100, borderRadius: 40, backgroundColor: C.window, overflow: 'hidden' },
  titles: { position: 'absolute', left: 21, top: 82, width: 150 },
  title: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  artist: { color: C.artist, fontSize: 13, marginTop: 2 },
  bar: { position: 'absolute', left: 48, top: 123, width: 269, height: 5, borderRadius: 3, backgroundColor: C.track, overflow: 'hidden' },
  fill: { height: 5, backgroundColor: C.orange },
  controls: { position: 'absolute', left: 0, right: 0, top: 150, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' },
  side: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  cluster: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  round: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.button, borderWidth: 1.5, borderColor: C.ring, alignItems: 'center', justifyContent: 'center' },
  wellButton: { width: 88, height: 40, borderRadius: 20, backgroundColor: C.well, borderWidth: 2, borderColor: C.wellEdge, alignItems: 'center', justifyContent: 'center' },
});

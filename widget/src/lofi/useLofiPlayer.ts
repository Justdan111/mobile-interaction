import type { EventSubscription } from 'expo-modules-core';
import type { LiveActivity } from 'expo-widgets';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import {
  LofiPlayerActivity,
  addUserInteractionListener,
  type LofiPlayerProps,
  type WidgetAssetUris,
} from '../../widgets';

/**
 * Playback for the LO-FI player. There is no audio: this is the clock a real player
 * would expose, so the Live Activity has something honest to follow.
 */
export const TRACKS = [
  { title: 'Crossroads', artist: 'Pocket-Soul', durationMs: 168_000 },
  { title: 'Rainy Window', artist: 'Kissa Tapes', durationMs: 192_000 },
  { title: 'Late Bus Home', artist: 'Mellow Haze', durationMs: 155_000 },
];

/** Where the first track starts, so the bar opens about where the comp draws it. */
const OPENING_POSITION = 0.17;
/**
 * How often the reels are pushed while the app is in front, and how far they turn each
 * time. The hub has ten teeth, so it looks identical every 36°: a step near that would
 * strobe or appear to run backwards. 12° per push stays well clear and reads as a slow,
 * steady turn.
 */
const FRAME_MS = 300;
const STEP_DEG = 12;
/** Past this far into a track, "previous" restarts it rather than going back one. */
const RESTART_MS = 3_000;

export type Playback = {
  index: number;
  playing: boolean;
  /** Position at `anchorAt`. While playing, position advances with the clock from there. */
  positionMs: number;
  anchorAt: number;
  repeatOn: boolean;
};

export type LofiCommand = 'toggle' | 'previous' | 'next' | 'repeat' | 'airplay';

export function positionAt(playback: Playback, at: number) {
  const { durationMs } = TRACKS[playback.index];
  const raw = playback.playing ? playback.positionMs + (at - playback.anchorAt) : playback.positionMs;
  return Math.min(durationMs, Math.max(0, raw));
}

function propsFor(
  playback: Playback,
  at: number,
  reelAngle: number,
  assets: WidgetAssetUris | null
): LofiPlayerProps {
  const track = TRACKS[playback.index];
  const position = positionAt(playback, at);
  return {
    title: track.title,
    artist: track.artist,
    isPlaying: playback.playing,
    startedAt: at - position,
    endsAt: at - position + track.durationMs,
    position: position / track.durationMs,
    reelAngle,
    repeatOn: playback.repeatOn,
    lofiStickerUri: assets?.lofiSticker,
    smileyStickerUri: assets?.smileySticker,
    headphonesStickerUri: assets?.headphonesSticker,
    reelHubUri: assets?.reelHub,
    vinylUri: assets?.vinyl,
    vinylRimUri: assets?.vinylRim,
  };
}

/** Applies a control press to the playback state as of `at`. Pure, so preview and island agree. */
export function applyCommand(playback: Playback, command: LofiCommand, at: number): Playback {
  const position = positionAt(playback, at);
  switch (command) {
    case 'toggle':
      return { ...playback, playing: !playback.playing, positionMs: position, anchorAt: at };
    case 'next':
      return {
        ...playback,
        index: (playback.index + 1) % TRACKS.length,
        positionMs: 0,
        anchorAt: at,
      };
    case 'previous':
      return position > RESTART_MS
        ? { ...playback, positionMs: 0, anchorAt: at }
        : {
            ...playback,
            index: (playback.index + TRACKS.length - 1) % TRACKS.length,
            positionMs: 0,
            anchorAt: at,
          };
    case 'repeat':
      return { ...playback, repeatOn: !playback.repeatOn, positionMs: position, anchorAt: at };
    case 'airplay':
      // A Live Activity cannot present the route picker; the button is decorative there.
      return playback;
  }
}

/** At the end of a track: repeat it, or move on. */
function advanceIfFinished(playback: Playback, at: number): Playback {
  const { durationMs } = TRACKS[playback.index];
  if (!playback.playing || positionAt(playback, at) < durationMs) return playback;
  const finishedAt = playback.anchorAt + (durationMs - playback.positionMs);
  return playback.repeatOn
    ? { ...playback, positionMs: 0, anchorAt: finishedAt }
    : { ...playback, index: (playback.index + 1) % TRACKS.length, positionMs: 0, anchorAt: finishedAt };
}

/**
 * Owns the LO-FI Live Activity: starts and ends it, applies presses from its buttons
 * (they arrive through `addUserInteractionListener` with the button's `target`), and
 * pushes the reel angle while playing. The progress bar needs no pushes — the widget
 * hands it to SwiftUI as a date range.
 */
export function useLofiPlayer(
  assets: WidgetAssetUris | null,
  report: (error: unknown) => void
) {
  // Reattach to an activity left running by a previous launch.
  const [activity, setActivity] = useState<LiveActivity<LofiPlayerProps> | null>(() =>
    Platform.OS === 'ios' ? (LofiPlayerActivity?.getInstances()[0] ?? null) : null
  );
  const [playback, setPlayback] = useState<Playback>(() => ({
    index: 0,
    playing: false,
    positionMs: TRACKS[0].durationMs * OPENING_POSITION,
    anchorAt: Date.now(),
    repeatOn: false,
  }));
  const [angle, setAngle] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const playbackRef = useRef(playback);
  const angleRef = useRef(angle);
  const activityRef = useRef(activity);
  const assetsRef = useRef(assets);
  // Mirrored after commit, so the interval and the event listener read current values
  // without being torn down every time one changes.
  useLayoutEffect(() => {
    playbackRef.current = playback;
    angleRef.current = angle;
    activityRef.current = activity;
    assetsRef.current = assets;
  });

  const push = useCallback(
    (next: Playback, at: number) => {
      activityRef.current
        ?.update(propsFor(next, at, angleRef.current, assetsRef.current))
        .catch(report);
    },
    [report]
  );

  const command = useCallback(
    (name: string) => {
      const at = Date.now();
      const next = applyCommand(playbackRef.current, name as LofiCommand, at);
      playbackRef.current = next;
      setPlayback(next);
      setNow(at);
      push(next, at);
    },
    [push]
  );

  // Presses on the island or Lock Screen controls.
  useEffect(() => {
    if (!addUserInteractionListener) return;
    const subscription: EventSubscription = addUserInteractionListener((event) => {
      if (event.source === 'LofiPlayerActivity') command(event.target);
    });
    return () => subscription.remove();
  }, [command]);

  // Turns the reels and rolls over finished tracks while playing.
  useEffect(() => {
    if (!playback.playing) return;
    const id = setInterval(() => {
      const at = Date.now();
      const advanced = advanceIfFinished(playbackRef.current, at);
      if (advanced !== playbackRef.current) {
        playbackRef.current = advanced;
        setPlayback(advanced);
      }
      angleRef.current = (angleRef.current + STEP_DEG) % 360;
      setAngle(angleRef.current);
      setNow(at);
      push(advanced, at);
    }, FRAME_MS);
    return () => clearInterval(id);
  }, [playback.playing, push]);

  const start = useCallback(() => {
    if (!LofiPlayerActivity) return;
    const at = Date.now();
    const next: Playback = {
      ...playbackRef.current,
      playing: true,
      positionMs: positionAt(playbackRef.current, at),
      anchorAt: at,
    };
    try {
      const began = LofiPlayerActivity.start(propsFor(next, at, angleRef.current, assetsRef.current));
      playbackRef.current = next;
      setPlayback(next);
      setActivity(began);
    } catch (error) {
      report(error);
    }
  }, [report]);

  /** Ends every LO-FI activity, including ones from earlier launches, and stops playback. */
  const end = useCallback(async () => {
    await Promise.all(
      (LofiPlayerActivity?.getInstances() ?? []).map((instance) =>
        instance.end('immediate').catch(report)
      )
    );
    const at = Date.now();
    const stopped = { ...playbackRef.current, playing: false, positionMs: positionAt(playbackRef.current, at), anchorAt: at };
    playbackRef.current = stopped;
    setPlayback(stopped);
    setActivity(null);
  }, [report]);

  return { activity, playback, angle, now, start, end, command };
}

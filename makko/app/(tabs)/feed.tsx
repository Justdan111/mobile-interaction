import React, { useCallback, useMemo, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useSharedValue, withTiming } from 'react-native-reanimated';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CardList } from '../../components/feed/CardList';
import { TabLayer } from '../../components/feed/Entrance';
import { FeedTabs } from '../../components/feed/FeedTabs';
import { MasonryFeed } from '../../components/feed/MasonryFeed';
import { useLikes } from '../../components/feed/Overlays';
import { TopicSheet } from '../../components/feed/TopicSheet';
import { VideoPager } from '../../components/feed/VideoPager';
import { Header } from '../../components/ui/Header';
import { Icon } from '../../components/ui/icons';
import { Press } from '../../components/ui/Press';
import { FEED_TABS, postsFor, type FeedTab, type Post, type VideoPost } from '../../data/posts';
import { FEED_TOPICS } from '../../data/topics';
import { C } from '../../theme/colors';

const HEADER_H = 64;
/** Opacity of the current feed while a finger is down on another tab. */
const PRESSED_DIM = 0.3;

export default function Feed() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [tabIndex, setTabIndex] = useState(0);
  // Bumped on every switch or topic change; replays the active layer's entrance.
  const [play, setPlay] = useState(0);
  const [leaveFrom, setLeaveFrom] = useState(1);
  const [jump, setJump] = useState<{ index: number; n: number } | undefined>(undefined);
  const [topic, setTopic] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [screenH, setScreenH] = useState(0);
  const [contentH, setContentH] = useState(0);
  const { liked, toggle } = useLikes();

  const byTab = useMemo(() => Object.fromEntries(FEED_TABS.map((t) => [t.key, postsFor(t.key, topic)])) as Record<FeedTab, Post[]>, [topic]);
  const dim = useSharedValue(1);

  /** Switch at once: the old layer fades from wherever the press-dim left it. */
  const switchTo = useCallback(
    (i: number, at?: number) => {
      if (at !== undefined) setJump({ index: at, n: Date.now() });
      if (i === tabIndex) {
        dim.value = withTiming(1, { duration: 160 });
        return;
      }
      setLeaveFrom(dim.value);
      dim.value = 1;
      setTabIndex(i);
      setPlay((p) => p + 1);
    },
    [tabIndex, dim]
  );

  // As the sheet drops away the feed comes back in with its entrance.
  const closeSheet = (then?: () => void) => {
    setSheetOpen(false);
    setTimeout(() => {
      then?.();
      setPlay((p) => p + 1);
    }, 60);
  };

  const onPressTab = (i: number | null) => {
    if (i !== null && i !== tabIndex) dim.value = withTiming(PRESSED_DIM, { duration: 140 });
    else if (i === null) dim.value = withTiming(1, { duration: 160 });
  };

  // Tapping a tile in All opens it full-size in its own tab.
  const open = (p: Post) => {
    const target: FeedTab = p.kind === 'video' ? 'videos' : 'photos';
    switchTo(
      FEED_TABS.findIndex((t) => t.key === target),
      Math.max(0, byTab[target].findIndex((x) => x.id === p.id))
    );
  };

  const last = FEED_TABS.length - 1;
  const swipe = usePanGesture({
    activeOffsetX: [-24, 24],
    failOffsetY: [-14, 14],
    onDeactivate: (e) => {
      'worklet';
      if (e.translationX < -60 && tabIndex < last) scheduleOnRN(switchTo, tabIndex + 1, undefined);
      else if (e.translationX > 60 && tabIndex > 0) scheduleOnRN(switchTo, tabIndex - 1, undefined);
    },
  });

  const cardH = Math.max(0, Math.min(contentH - 60, (width - 32) * 1.32));
  const topicLabel = FEED_TOPICS.find((t) => t.id === topic)?.label;
  const target = (key: FeedTab) => (FEED_TABS[tabIndex].key === key ? jump : undefined);

  const layer = (key: FeedTab) => {
    if (key === 'all') return <MasonryFeed posts={byTab.all} width={width} bottomInset={24} onOpen={open} />;
    if (key === 'videos')
      return <VideoPager posts={byTab.videos as VideoPost[]} width={width} height={contentH} liked={liked} onLike={toggle} jump={target('videos')} visible={FEED_TABS[tabIndex].key === 'videos'} play={play} />;
    return <CardList posts={byTab[key]} width={width} cardHeight={key === 'posts' ? 0 : cardH} bottomInset={24} liked={liked} onLike={toggle} jump={target(key)} play={play} active={FEED_TABS[tabIndex].key === key} />;
  };

  return (
    <View className="flex-1 bg-page" style={{ paddingTop: insets.top }} onLayout={(e) => setScreenH(e.nativeEvent.layout.height)}>
      <Header />
      <FeedTabs index={tabIndex} filtered={!!topic} onSelect={(_, i) => switchTo(i)} onPressTab={onPressTab} onFilter={() => setSheetOpen(true)} />

      {topicLabel ? (
        <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-row" style={{ paddingHorizontal: 20, paddingBottom: 4 }}>
          <Press
            onPress={() => setTopic(null)}
            accessibilityRole="button"
            accessibilityLabel={`Clear ${topicLabel}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.card, borderRadius: 16, paddingLeft: 12, paddingRight: 8, paddingVertical: 6 }}
          >
            <Text className="font-medium text-ink" style={{ fontSize: 13.5 }}>
              {topicLabel}
            </Text>
            <Icon name="close" color={C.muted} size={16} strokeWidth={2} />
          </Press>
        </Animated.View>
      ) : null}

      <GestureDetector gesture={swipe}>
        <View style={{ flex: 1 }} onLayout={(e) => setContentH(e.nativeEvent.layout.height)}>
          {contentH
            ? FEED_TABS.map((t, i) => (
                <TabLayer
                  key={`${t.key}-${topic ?? 'all'}`}
                  active={i === tabIndex}
                  play={play}
                  dim={dim}
                  leaveFrom={leaveFrom}
                >
                  {layer(t.key)}
                </TabLayer>
              ))
            : null}
        </View>
      </GestureDetector>

      {/* Mounted once the height is known, so it starts parked off-screen
          rather than flashing open for a frame on first layout. */}
      {screenH ? (
        <TopicSheet
          open={sheetOpen}
          top={insets.top + HEADER_H}
          height={Math.max(0, screenH - insets.top - HEADER_H)}
          bottomInset={24}
          selected={topic}
          onSelect={(id) => closeSheet(() => setTopic(id))}
        onClose={() => closeSheet()}
        />
      ) : null}
    </View>
  );
}

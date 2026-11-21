import React, { useMemo, useRef, useState } from 'react';
import { FlatList, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CardList } from '../../components/feed/CardList';
import { FeedTabs } from '../../components/feed/FeedTabs';
import { MasonryFeed } from '../../components/feed/MasonryFeed';
import { useLikes } from '../../components/feed/Overlays';
import { TopicSheet } from '../../components/feed/TopicSheet';
import { Header } from '../../components/ui/Header';
import { Icon } from '../../components/ui/icons';
import { Press } from '../../components/ui/Press';
import { FEED_TABS, postsFor, type FeedTab, type Post } from '../../data/posts';
import { FEED_TOPICS } from '../../data/topics';
import { C } from '../../theme/colors';

const HEADER_H = 64;
const TABS_H = 52;

export default function Feed() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [topic, setTopic] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [areaH, setAreaH] = useState(height);
  const { liked, toggle } = useLikes();

  const pager = useRef<Animated.ScrollView>(null);
  const lists = useRef<Partial<Record<FeedTab, FlatList<Post> | null>>>({});
  const pos = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    pos.value = e.contentOffset.x / width;
  });

  const pageH = areaH - insets.top - HEADER_H - TABS_H;
  const cardH = Math.min(pageH - 60, (width - 32) * 1.32);
  // The tab bar sits below this screen rather than over it.
  const bottomInset = 24;
  const byTab = useMemo(() => Object.fromEntries(FEED_TABS.map((t) => [t.key, postsFor(t.key, topic)])) as Record<FeedTab, Post[]>, [topic]);

  const goTo = (i: number) => {
    pager.current?.scrollTo({ x: i * width, animated: true });
    setPage(i);
  };

  // Tapping a tile in All opens it full-size in its own tab.
  const open = (p: Post) => {
    const tab: FeedTab = p.kind === 'video' ? 'videos' : 'photos';
    const i = FEED_TABS.findIndex((t) => t.key === tab);
    goTo(i);
    const index = byTab[tab].findIndex((x) => x.id === p.id);
    if (index >= 0) setTimeout(() => lists.current[tab]?.scrollToIndex({ index, animated: false }), 320);
  };

  const topicLabel = FEED_TOPICS.find((t) => t.id === topic)?.label;

  return (
    <View className="flex-1 bg-page" style={{ paddingTop: insets.top }} onLayout={(e) => setAreaH(e.nativeEvent.layout.height)}>
      <Header />
      <FeedTabs pos={pos} filtered={!!topic} onSelect={(_, i) => goTo(i)} onFilter={() => setSheetOpen(true)} />

      {topicLabel ? (
        <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-row" style={{ paddingHorizontal: 20, paddingBottom: 4 }}>
          <Press onPress={() => setTopic(null)} accessibilityRole="button" accessibilityLabel={`Clear ${topicLabel}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.card, borderRadius: 16, paddingLeft: 12, paddingRight: 8, paddingVertical: 6 }}>
            <Text className="font-medium text-ink" style={{ fontSize: 13.5 }}>
              {topicLabel}
            </Text>
            <Icon name="close" color={C.muted} size={16} strokeWidth={2} />
          </Press>
        </Animated.View>
      ) : null}

      <Animated.ScrollView
        ref={pager}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={{ flex: 1 }}
      >
        {FEED_TABS.map((t, i) => (
          <View key={t.key} style={{ width }}>
            {t.key === 'all' ? (
              <MasonryFeed posts={byTab.all} width={width} bottomInset={bottomInset} onOpen={open} />
            ) : (
              <CardList
                ref={(r) => {
                  lists.current[t.key] = r;
                }}
                posts={byTab[t.key]}
                width={width}
                cardHeight={t.key === 'posts' ? 0 : cardH}
                bottomInset={bottomInset}
                liked={liked}
                onLike={toggle}
                visible={page === i}
              />
            )}
          </View>
        ))}
      </Animated.ScrollView>

      <TopicSheet
        open={sheetOpen}
        top={insets.top + HEADER_H}
        height={areaH - insets.top - HEADER_H}
        bottomInset={bottomInset}
        selected={topic}
        onSelect={(id) => {
          setTopic(id);
          setSheetOpen(false);
        }}
        onClose={() => setSheetOpen(false)}
      />
    </View>
  );
}

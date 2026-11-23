import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, type ListViewToken } from 'react-native';
import type { PhotoPost, Post, VideoPost } from '../../data/posts';
import { Reveal, Rise } from './Entrance';
import { MediaCard } from './MediaCard';
import { TextCard } from './TextCard';

const GAP = 28;

/**
 * Full-width cards, one per screen of scroll, snapping card to card. The card
 * most in view is `active`, which is what starts and stops video playback.
 */
export function CardList({
  posts,
  width,
  cardHeight,
  bottomInset,
  liked,
  onLike,
  jump,
  play,
  active,
}: {
  posts: Post[];
  width: number;
  cardHeight: number;
  bottomInset: number;
  liked: Set<string>;
  onLike: (id: string, force?: boolean) => void;
  /** Scrolls straight to a card; `n` changes on every request so repeats still fire. */
  jump?: { index: number; n: number };
  /** Replays the entrance: the lead card reveals, the rest rise after it. */
  play: number;
  /** Whether this list's tab is the one on screen. */
  active: boolean;
}) {
  const list = useRef<React.ComponentRef<typeof FlatList<Post>>>(null);
  const [activeId, setActiveId] = useState<string | null>(posts[0]?.id ?? null);
  const [lead, setLead] = useState(0);
  useEffect(() => {
    if (jump && cardHeight > 0 && posts[jump.index]) {
      list.current?.scrollToIndex({ index: jump.index, animated: false });
      setActiveId(posts[jump.index].id);
      setLead(jump.index);
    }
  }, [jump?.n]); // eslint-disable-line react-hooks/exhaustive-deps
  const onViewable = useRef(({ viewableItems }: { viewableItems: ListViewToken[] }) => {
    const first = viewableItems.find((v) => v.isViewable);
    if (first) setActiveId((first.item as Post).id);
  }).current;

  const cardW = width - 32;
  const step = cardHeight + GAP;
  const render = useCallback(
    ({ item, index }: { item: Post; index: number }) => {
      if (item.kind === 'text')
        return (
          <Rise play={play} active={active} order={index - 2}>
            <TextCard post={item} />
          </Rise>
        );
      const card = (
        <MediaCard
          post={item as PhotoPost | VideoPost}
          width={cardW}
          height={cardHeight}
          active={item.id === activeId}
          liked={liked.has(item.id)}
          onLike={(force) => onLike(item.id, force)}
        />
      );
      return index === lead ? (
        <Reveal play={play} active={active} width={cardW} height={cardHeight}>
          {card}
        </Reveal>
      ) : (
        <Rise play={play} active={active}>
          {card}
        </Rise>
      );
    },
    [cardW, cardHeight, activeId, liked, onLike, play, lead, active]
  );

  return (
    <FlatList
      ref={list}
      data={posts}
      keyExtractor={(p) => p.id}
      renderItem={render}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: bottomInset, gap: cardHeight > 0 ? GAP : 12 }}
      snapToInterval={cardHeight > 0 ? step : undefined}
      decelerationRate={cardHeight > 0 ? 'fast' : 'normal'}
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewable}
      viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
      getItemLayout={cardHeight > 0 ? (_, index) => ({ length: cardHeight, offset: 16 + index * step, index }) : undefined}
    />
  );
}

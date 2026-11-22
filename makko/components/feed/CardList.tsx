import React, { forwardRef, useCallback, useRef, useState } from 'react';
import { FlatList, type ListViewToken } from 'react-native';
import type { PhotoPost, Post, VideoPost } from '../../data/posts';
import { MediaCard } from './MediaCard';
import { TextCard } from './TextCard';

const GAP = 28;

/**
 * Full-width cards, one per screen of scroll, snapping card to card. The card
 * most in view is `active`, which is what starts and stops video playback.
 */
export const CardList = forwardRef<
  FlatList<Post>,
  { posts: Post[]; width: number; cardHeight: number; bottomInset: number; liked: Set<string>; onLike: (id: string, force?: boolean) => void; visible: boolean }
>(({ posts, width, cardHeight, bottomInset, liked, onLike, visible }, ref) => {
  const [activeId, setActiveId] = useState<string | null>(posts[0]?.id ?? null);
  const onViewable = useRef(({ viewableItems }: { viewableItems: ListViewToken[] }) => {
    const first = viewableItems.find((v) => v.isViewable);
    if (first) setActiveId((first.item as Post).id);
  }).current;

  const cardW = width - 32;
  const step = cardHeight + GAP;
  const render = useCallback(
    ({ item }: { item: Post }) =>
      item.kind === 'text' ? (
        <TextCard post={item} />
      ) : (
        <MediaCard
          post={item as PhotoPost | VideoPost}
          width={cardW}
          height={cardHeight}
          active={visible && item.id === activeId}
          liked={liked.has(item.id)}
          onLike={(force) => onLike(item.id, force)}
        />
      ),
    [cardW, cardHeight, visible, activeId, liked, onLike]
  );

  return (
    <FlatList
      ref={ref}
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
});
CardList.displayName = 'CardList';

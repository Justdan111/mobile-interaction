import { PEOPLE } from './people';

export type PersonId = keyof typeof PEOPLE;

type Base = {
  id: string;
  author: PersonId;
  /** Feed-topic id from data/topics.ts FEED_TOPICS, for the topic filter. */
  topic: string;
  likes: number;
  replies: number;
};

export type TextPost = Base & { kind: 'text'; text: string };
/** `tile` is the tile's height over its width in the All masonry. */
export type PhotoPost = Base & { kind: 'photo'; photo: string; tile: number };
export type VideoPost = Base & { kind: 'video'; video: string; tile: number };
export type Post = TextPost | PhotoPost | VideoPost;

/**
 * The feed, in order. Every tab is a filter over this list: All shows it as a
 * masonry, Photos and Videos as full-width cards, Posts as text only.
 */
export const POSTS: Post[] = [
  {
    id: 'p1',
    kind: 'text',
    author: 'devon',
    topic: 'travel',
    text: "Life is an adventure, and each day is a new chapter of that story. Let's make it unforgettable! ✨🌺",
    likes: 0,
    replies: 0,
  },
  { id: 'p2', kind: 'photo', author: 'courtney', topic: 'fitness', photo: 'feed-sneakers', tile: 0.74, likes: 48, replies: 3 },
  { id: 'p3', kind: 'photo', author: 'devon', topic: 'art', photo: 'feed-orange-hair', tile: 1.0, likes: 112, replies: 9 },
  {
    id: 'p4',
    kind: 'text',
    author: 'mariane',
    topic: 'nature',
    text: 'Share your smile and positive vibes with the world today! 😊💫',
    likes: 22,
    replies: 1,
  },
  { id: 'p5', kind: 'video', author: 'courtney', topic: 'nature', video: 'video-1', tile: 0.93, likes: 205, replies: 14 },
  { id: 'p6', kind: 'photo', author: 'mark', topic: 'art', photo: 'feed-yellow-wall', tile: 1.0, likes: 87, replies: 6 },
  { id: 'p7', kind: 'photo', author: 'courtney', topic: 'art', photo: 'feed-purple-arch', tile: 0.9, likes: 64, replies: 2 },
  { id: 'p8', kind: 'photo', author: 'mark', topic: 'travel', photo: 'feed-boat', tile: 1.3, likes: 431, replies: 27 },
  { id: 'p9', kind: 'video', author: 'mariane', topic: 'fitness', video: 'video-2', tile: 1.2, likes: 318, replies: 21 },
  {
    id: 'p10',
    kind: 'text',
    author: 'mark',
    topic: 'tech',
    text: 'Shipped my first app this week. Tiny, a bit rough, entirely mine. 🚀',
    likes: 56,
    replies: 8,
  },
  { id: 'p11', kind: 'photo', author: 'mariane', topic: 'pets', photo: 'feed-jump', tile: 0.92, likes: 76, replies: 5 },
  { id: 'p12', kind: 'photo', author: 'devon', topic: 'food', photo: 'feed-extra-1', tile: 1.15, likes: 39, replies: 2 },
  {
    id: 'p13',
    kind: 'text',
    author: 'courtney',
    topic: 'food',
    text: 'Sunday plan: farmers market, a long lunch, zero notifications. Who’s in? 🍑',
    likes: 31,
    replies: 4,
  },
  { id: 'p14', kind: 'video', author: 'devon', topic: 'travel', video: 'video-3', tile: 1.25, likes: 154, replies: 11 },
  { id: 'p15', kind: 'photo', author: 'mariane', topic: 'nature', photo: 'feed-extra-2', tile: 1.2, likes: 92, replies: 7 },
  { id: 'p16', kind: 'photo', author: 'mark', topic: 'fitness', photo: 'feed-extra-3', tile: 1.1, likes: 58, replies: 3 },
  { id: 'p17', kind: 'photo', author: 'courtney', topic: 'nature', photo: 'feed-curly-flowers', tile: 1.25, likes: 143, replies: 12 },
];

export type FeedTab = 'all' | 'photos' | 'videos' | 'posts';

export const FEED_TABS: { key: FeedTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'photos', label: 'Photos' },
  { key: 'videos', label: 'Videos' },
  { key: 'posts', label: 'Posts' },
];

export function postsFor(tab: FeedTab, topic: string | null, posts: Post[] = POSTS): Post[] {
  return posts.filter(
    (p) =>
      (topic === null || p.topic === topic) &&
      (tab === 'all' ||
        (tab === 'photos' && p.kind === 'photo') ||
        (tab === 'videos' && p.kind === 'video') ||
        (tab === 'posts' && p.kind === 'text'))
  );
}

/** "1 reply · 22 likes" — empty when there is nothing yet, as on Devon's post. */
export function engagement(p: Post): string {
  const parts: string[] = [];
  if (p.replies) parts.push(`${p.replies} ${p.replies === 1 ? 'reply' : 'replies'}`);
  if (p.likes) parts.push(`${p.likes} ${p.likes === 1 ? 'like' : 'likes'}`);
  return parts.join('  ·  ');
}

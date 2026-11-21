import { engagement, FEED_TABS, POSTS, postsFor } from '../data/posts';
import { PEOPLE } from '../data/people';
import { NOTIFICATION_KINDS, RULER_MAX, RULER_MIN } from '../data/notifications';
import { FEED_TOPICS, INTERESTS } from '../data/topics';
import { art, photos, videos } from '../lib/media';

const has = (slug: string) => slug in art || slug in photos;

describe('media references', () => {
  // A missing slug renders as an empty tile with no error anywhere.
  it('resolves every photo and video a post uses', () => {
    for (const p of POSTS) {
      if (p.kind === 'photo') expect(p.photo in photos).toBe(true);
      if (p.kind === 'video') expect(p.video in videos).toBe(true);
    }
  });

  it('resolves every topic tile and sheet row', () => {
    for (const t of INTERESTS.flat()) if (t.art !== 'music-note') expect(has(t.art)).toBe(true);
    for (const t of FEED_TOPICS) expect(has(t.art)).toBe(true);
  });

  it('gives every person an avatar and the intro its subject', () => {
    for (const p of Object.values(PEOPLE)) expect(p.avatar).toBeDefined();
    expect('intro-woman' in art).toBe(true);
  });
});

describe('feed filters', () => {
  it('splits the feed by kind for each tab', () => {
    expect(postsFor('all', null)).toHaveLength(POSTS.length);
    expect(postsFor('photos', null).every((p) => p.kind === 'photo')).toBe(true);
    expect(postsFor('videos', null).every((p) => p.kind === 'video')).toBe(true);
    expect(postsFor('posts', null).every((p) => p.kind === 'text')).toBe(true);
    const total = FEED_TABS.filter((t) => t.key !== 'all').reduce((n, t) => n + postsFor(t.key, null).length, 0);
    expect(total).toBe(POSTS.length);
  });

  it('narrows to a topic, and every topic has at least one post', () => {
    for (const t of FEED_TOPICS) {
      const hits = postsFor('all', t.id);
      expect(hits.length).toBeGreaterThan(0);
      expect(hits.every((p) => p.topic === t.id)).toBe(true);
    }
  });

  it('opens the Videos tab on the flower clip', () => {
    expect(postsFor('videos', null)[0]).toMatchObject({ video: 'video-1', author: 'courtney' });
  });
});

describe('engagement line', () => {
  it('reads as replies then likes', () => {
    expect(engagement(POSTS.find((p) => p.id === 'p4')!)).toBe('1 reply  ·  22 likes');
  });
  it('is empty with no activity, as on Devon’s post', () => {
    expect(engagement(POSTS.find((p) => p.id === 'p1')!)).toBe('');
  });
});

describe('onboarding data', () => {
  it('fills each tile row exactly (wide+narrow or half+half)', () => {
    const share = { wide: 0.66, narrow: 0.34, half: 0.5 } as const;
    for (const row of INTERESTS) expect(row.reduce((n, t) => n + share[t.span], 0)).toBeCloseTo(1);
  });
  it('starts every notification budget on the ruler', () => {
    for (const k of NOTIFICATION_KINDS) {
      expect(k.perDay).toBeGreaterThanOrEqual(RULER_MIN);
      expect(k.perDay).toBeLessThanOrEqual(RULER_MAX);
    }
    expect(NOTIFICATION_KINDS[0].perDay).toBe(27);
  });
});

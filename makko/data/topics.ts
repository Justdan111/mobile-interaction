import type { Tint } from '../theme/colors';

/**
 * Onboarding interest tiles. `span` is the tile's share of its row, so a row
 * of `wide` + `narrow` reads 58/42 and two `half` tiles split evenly.
 * `hero` tiles put a cut-out photo over a colour shape with the label in a
 * pill; `object` tiles centre a small subject with the label beneath.
 */
export type InterestTile = {
  id: string;
  label: string;
  art: string | 'music-note';
  span: 'wide' | 'narrow' | 'half';
  style: 'hero' | 'object';
  /** Colour of the shape drawn behind a hero tile's subject. */
  shape?: string;
};

export const INTERESTS: InterestTile[][] = [
  [
    { id: 'music', label: 'Music', art: 'music-note', span: 'narrow', style: 'object' },
    { id: 'lifestyle', label: 'Lifestyle', art: 'topic-lifestyle', span: 'wide', style: 'hero', shape: '#CFC6F7' },
  ],
  [
    { id: 'plants', label: 'Plants', art: 'topic-plants', span: 'wide', style: 'hero', shape: '#BCD5F7' },
    { id: 'fashion', label: 'Fashion', art: 'topic-fashion', span: 'narrow', style: 'object' },
  ],
  [
    { id: 'sports', label: 'Sports', art: 'topic-sports', span: 'half', style: 'object' },
    { id: 'dogs', label: 'Dogs', art: 'topic-dogs', span: 'half', style: 'hero', shape: '#F7DACE' },
  ],
  [
    { id: 'travel', label: 'Travel', art: 'topic-travel', span: 'narrow', style: 'object' },
    { id: 'food', label: 'Food', art: 'sheet-food', span: 'wide', style: 'hero', shape: '#FDF3D0' },
  ],
];

/** The feed's "Choose topic" sheet. */
export type FeedTopic = { id: string; label: string; art: string; tint: Tint };

export const FEED_TOPICS: FeedTopic[] = [
  { id: 'tech', label: 'Technology & Innovation', art: 'sheet-tech', tint: 'mint' },
  { id: 'art', label: 'Art & Creativity', art: 'sheet-art', tint: 'lilac' },
  { id: 'fitness', label: 'Fitness & Health', art: 'sheet-fitness', tint: 'sky' },
  { id: 'nature', label: 'Science & Nature', art: 'sheet-nature', tint: 'blush' },
  { id: 'travel', label: 'Travel & Adventures', art: 'topic-travel', tint: 'butter' },
  { id: 'food', label: 'Culinary & Food', art: 'sheet-food', tint: 'periwinkle' },
  { id: 'pets', label: 'Pets & Animals', art: 'topic-dogs', tint: 'rose' },
];

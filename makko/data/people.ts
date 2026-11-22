import { photos } from '../lib/media';

export type Person = {
  id: string;
  name: string;
  handle: string;
  /** A `require()`d image, as expo-image takes it. */
  avatar?: number;
};

const avatar = (slug: string): number | undefined => photos[slug as keyof typeof photos]?.source;

export const PEOPLE = {
  devon: { id: 'devon', name: 'Devon', handle: '@devon.lane', avatar: avatar('avatar-devon') },
  mariane: { id: 'mariane', name: 'Mariane', handle: '@mariane', avatar: avatar('avatar-mariane') },
  mark: { id: 'mark', name: 'Mark', handle: '@markwav', avatar: avatar('avatar-mark') },
  courtney: { id: 'courtney', name: 'Courtney', handle: '@court.ney', avatar: avatar('avatar-courtney') },
} satisfies Record<string, Person>;

/** The signed-in user. */
export const ME: Person = { id: 'me', name: 'Ava Brooks', handle: '@avabrooks', avatar: avatar('avatar-me') };

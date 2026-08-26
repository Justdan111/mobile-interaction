export type Mode = 'light' | 'dark';

export const TOKEN_NAMES = [
  'page', 'card', 'ink', 'muted', 'accent', 'accentDeep',
  'chip', 'hairline', 'danger', 'info', 'success',
] as const;

export type TokenName = (typeof TOKEN_NAMES)[number];

export const tokens: Record<Mode, Record<TokenName, string>> = {
  light: {
    page: '#F4F3F0',
    card: '#FFFFFF',
    ink: '#0F0F12',
    muted: '#6B6B72',
    accent: '#6C63E8',
    accentDeep: '#3B34C9',
    chip: '#ECEBF9',
    hairline: '#E3E1DC',
    danger: '#E5483D',
    info: '#0A84FF',
    success: '#34C759',
  },
  dark: {
    page: '#0A0A0A',
    card: '#1C1C1E',
    ink: '#FFFFFF',
    muted: '#8E8E93',
    accent: '#7B77E8',
    accentDeep: '#3B34C9',
    chip: '#2A2A33',
    hairline: '#2C2C2E',
    danger: '#E5483D',
    info: '#0A84FF',
    success: '#34C759',
  },
};

// Fixed art-direction palettes for procedural halftone plates (Avatar,
// TeamTile). These are deliberately NOT mode-keyed — they read the same in
// light and dark — and deliberately NOT semantic tokens: they exist purely
// so a list of people or teams reads as varied rather than uniform, not to
// carry any meaning `tokens` values do.

/** Rotating plate colours so a member list reads as varied, not uniform. */
export const PLATE_COLORS = ['#6C63E8', '#E5483D', '#0A84FF', '#F0A202', '#34C759', '#8E5BE8'];

/** Saturated plate grounds, echoing the app-icon tiles in the comps. */
export const TILE_GROUNDS = ['#2C4BFF', '#111111', '#E8622C', '#6C63E8', '#0F8B5B', '#C41E4A'];

/**
 * The `Toggle` knob is white in both light and dark mode — deliberate art
 * direction (a switch's moving part reads as a physical object, not a
 * themed surface), not a semantic colour. Lives here, not inline in the
 * component, per the "no raw hex at call sites" rule.
 */
export const TOGGLE_KNOB_COLOR = '#FFFFFF';

/**
 * Foreground for icons/labels drawn on top of a solid action or status
 * surface — swipe-action buttons (mute/exit) and the unread-count badge.
 * Always white against the saturated `danger`/`info` fills those surfaces
 * use, in both light and dark mode; it's contrast against a fixed brand
 * colour, not a themed surface, so it isn't mode-keyed either. Lives here,
 * not inline at each call site, per the "no raw hex at call sites" rule.
 */
export const ACTION_FOREGROUND_COLOR = '#FFFFFF';

/**
 * The voice-note play-button circle for the current user's *own* messages
 * is a fixed white disc sitting on top of the accent-filled bubble — a
 * control surface, not a foreground colour on a surface (the inverse of
 * `ACTION_FOREGROUND_COLOR`, which is a foreground fixed against a themed
 * surface). Always white in both light and dark mode, like
 * `TOGGLE_KNOB_COLOR`'s "physical control" rationale. Lives here, not
 * inline at the call site, per the "no raw hex at call sites" rule.
 */
export const VOICE_NOTE_SURFACE_COLOR = '#FFFFFF';

/**
 * Home screen art-card row (`ArtCardRow`): one fixed ground/dot pair per
 * card id. Like PLATE_COLORS/TILE_GROUNDS above, these are art plates —
 * deliberately NOT mode-keyed, since inverting them would break the
 * halftone contrast they depend on.
 */
export const ART_CARD_PALETTES: Record<string, { ground: string; dot: string }> = {
  inspiration: { ground: '#8E88F0', dot: '#FFFFFF' },
  unite: { ground: '#C9C9C9', dot: '#141414' },
  match: { ground: '#D6D6D6', dot: '#141414' },
};

/**
 * Caption legibility for the art-card row. Each card's dot colour is a
 * seeded pattern painted across the whole plate, so no single flat colour
 * reliably contrasts with both the ground and the dots at fine
 * granularity. The caption instead sits on a scrim strip painted in a
 * colour chosen independently of the plate's own dot colour — see
 * ArtCardRow, which layers this scrim between the Halftone art and the
 * caption text rather than relying on colour choice alone.
 */
export const ART_CARD_CAPTION_COLOR = '#FFFFFF';
export const ART_CARD_CAPTION_SCRIM = 'rgba(0,0,0,0.42)';

/**
 * Profile header plate. Comp 9 is a DARK-MODE capture and its header is still
 * the pale lavender of the light comps, carrying dark ink — so this is a fixed
 * art plate like PLATE_COLORS/TILE_GROUNDS above, not a mode-keyed surface.
 * Keeping one plate in both themes also keeps the contrast honest: dark ink on
 * pale lavender reads the same either way, where a mode-swapped ground has to
 * re-derive its foreground and can get it wrong.
 */
export const PROFILE_PLATE_COLOR = '#E4E1FB';
export const PROFILE_PLATE_INK = '#0F0F12';

/** The translucent white pill holding the phone number on that plate. */
export const PROFILE_PLATE_CHIP_COLOR = 'rgba(255,255,255,0.7)';

/**
 * The rating star. A gold star is the rating idiom itself rather than a themed
 * accent, so like the plates above it is fixed across modes. Same value as
 * PLATE_COLORS' amber, but named for its meaning, not borrowed from an
 * art-direction list that exists only to vary avatars.
 */
export const RATING_STAR_COLOR = '#F0A202';

/**
 * Secondary text drawn on the accent-filled bubble of the user's OWN messages:
 * the timestamp, and a voice note's duration. Softened white rather than the
 * `muted` grey those same elements use on a `card` bubble — `muted` against
 * `accent` is about 1.1:1 and simply cannot be read, which is exactly how the
 * voice-note duration shipped until the Task 18 screenshot pass.
 *
 * Alpha-modified white rather than a flat token because it has to read as
 * secondary NEXT TO the full-white primary text in the same bubble.
 */
export const MESSAGE_ON_ACCENT_MUTED_COLOR = 'rgba(255,255,255,0.75)';

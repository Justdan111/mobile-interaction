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

// Fixed art plates for the procedural halftone surfaces. Deliberately not
// mode-keyed: inverting them would break the contrast the halftone depends on.

export const PLATE_COLORS = ['#6C63E8', '#E5483D', '#0A84FF', '#F0A202', '#34C759', '#8E5BE8'];

export const TILE_GROUNDS = ['#2C4BFF', '#111111', '#E8622C', '#6C63E8', '#0F8B5B', '#C41E4A'];

/** A switch's moving part reads as a physical object, not a themed surface. */
export const TOGGLE_KNOB_COLOR = '#FFFFFF';

/** Icons and labels on the saturated `danger`/`info` action fills. */
export const ACTION_FOREGROUND_COLOR = '#FFFFFF';

/** The play disc on the accent-filled bubble of your own voice notes. */
export const VOICE_NOTE_SURFACE_COLOR = '#FFFFFF';

export const ART_CARD_PALETTES: Record<string, { ground: string; dot: string }> = {
  inspiration: { ground: '#8E88F0', dot: '#FFFFFF' },
  unite: { ground: '#C9C9C9', dot: '#141414' },
  match: { ground: '#D6D6D6', dot: '#141414' },
};

// The dots are painted across the whole plate, so no flat colour contrasts
// with both ground and dots. The caption sits on a scrim strip instead.
export const ART_CARD_CAPTION_COLOR = '#FFFFFF';
export const ART_CARD_CAPTION_SCRIM = 'rgba(0,0,0,0.42)';

/** Dark ink on pale lavender reads the same in both themes, so it stays fixed. */
export const PROFILE_PLATE_COLOR = '#E4E1FB';
export const PROFILE_PLATE_INK = '#0F0F12';

export const PROFILE_PLATE_CHIP_COLOR = 'rgba(255,255,255,0.7)';

/** A gold star is the rating idiom itself, not a themed accent. */
export const RATING_STAR_COLOR = '#F0A202';

/**
 * Timestamps and voice-note durations on your own accent-filled bubbles.
 * `muted` against `accent` is about 1.1:1 and cannot be read; this has to stay
 * secondary next to the full-white primary text in the same bubble.
 */
export const MESSAGE_ON_ACCENT_MUTED_COLOR = 'rgba(255,255,255,0.75)';

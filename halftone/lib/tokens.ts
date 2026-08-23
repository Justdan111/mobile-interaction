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

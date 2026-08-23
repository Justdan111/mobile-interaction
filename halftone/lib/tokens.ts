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

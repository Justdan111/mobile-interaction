import { tokens } from '../../lib/tokens';

describe('tokens', () => {
  it('matches the spec palette exactly, in both modes', () => {
    expect(tokens.light).toEqual({
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
    });

    expect(tokens.dark).toEqual({
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
    });
  });

  it('inverts ink and page between modes', () => {
    expect(tokens.light.ink).not.toBe(tokens.dark.ink);
    expect(tokens.light.page).not.toBe(tokens.dark.page);
  });
});

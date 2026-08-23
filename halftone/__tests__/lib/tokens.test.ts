import { tokens, TOKEN_NAMES } from '../../lib/tokens';

describe('tokens', () => {
  it('defines every token in both modes', () => {
    for (const name of TOKEN_NAMES) {
      expect(tokens.light[name]).toMatch(/^#[0-9A-F]{6}$/i);
      expect(tokens.dark[name]).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('matches the spec palette', () => {
    expect(tokens.light.page).toBe('#F4F3F0');
    expect(tokens.dark.page).toBe('#0A0A0A');
    expect(tokens.light.accent).toBe('#6C63E8');
    expect(tokens.dark.accent).toBe('#7B77E8');
    expect(tokens.light.ink).toBe('#0F0F12');
    expect(tokens.dark.ink).toBe('#FFFFFF');
  });

  it('inverts ink and page between modes', () => {
    expect(tokens.light.ink).not.toBe(tokens.dark.ink);
    expect(tokens.light.page).not.toBe(tokens.dark.page);
  });
});

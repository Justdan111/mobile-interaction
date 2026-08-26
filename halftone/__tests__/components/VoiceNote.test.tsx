import React from 'react';
import { render } from '@testing-library/react-native';
import { VoiceNote } from '../../components/chat/VoiceNote';
import { tokens } from '../../lib/tokens';

// Collects every RNSVGRect's `height` prop, in document order, from a
// rendered tree — i.e. the waveform's bar heights.
function barHeights(node: any, out: number[] = []): number[] {
  if (node == null) return out;
  if (Array.isArray(node)) {
    node.forEach((n) => barHeights(n, out));
    return out;
  }
  if (node.type === 'RNSVGRect' && typeof node.props?.height === 'number') {
    out.push(node.props.height);
  }
  if (Array.isArray(node.children)) {
    node.children.forEach((c: any) => barHeights(c, out));
  }
  return out;
}

describe('VoiceNote waveform', () => {
  it('draws the same bars for the same message seed across renders', async () => {
    const voice = { durationSec: 5, seed: 'alice-johnson-voice-1' };
    const a = await render(<VoiceNote voice={voice} tint="#7B77E8" barColor="#AAAAAA" durationColor="#6B6B72" />);
    const b = await render(<VoiceNote voice={voice} tint="#7B77E8" barColor="#AAAAAA" durationColor="#6B6B72" />);

    const barsA = barHeights(a.toJSON());
    const barsB = barHeights(b.toJSON());

    expect(barsA.length).toBeGreaterThan(0);
    expect(barsA).toEqual(barsB);
  });

  it('draws different bars for a different message seed', async () => {
    const a = await render(<VoiceNote voice={{ durationSec: 5, seed: 'alice-johnson-voice-1' }} tint="#7B77E8" barColor="#AAAAAA" durationColor="#6B6B72" />);
    const b = await render(<VoiceNote voice={{ durationSec: 5, seed: 'me-voice-1' }} tint="#7B77E8" barColor="#AAAAAA" durationColor="#6B6B72" />);

    const barsA = barHeights(a.toJSON());
    const barsB = barHeights(b.toJSON());

    // Not a byte-for-byte requirement that every bar differs, but a bar set
    // that never changes across seeds would mean the seed is being ignored.
    expect(barsA).not.toEqual(barsB);
  });

  it('shows the note duration', async () => {
    const r = await render(<VoiceNote voice={{ durationSec: 5, seed: 'x' }} tint="#7B77E8" barColor="#AAAAAA" durationColor="#6B6B72" />);
    expect(r.getByText('0:05')).toBeTruthy();
  });
});

/** WCAG relative luminance / contrast, for the legibility guard below. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe('VoiceNote duration legibility', () => {
  it('colours the duration from its prop, not from a fixed muted class', async () => {
    const r = await render(
      <VoiceNote voice={{ durationSec: 5, seed: 'x' }} tint="#FFFFFF" barColor="#FFFFFF" durationColor="#123456" />
    );
    expect(r.getByText('0:05').props.style.color).toBe('#123456');
  });

  // The duration shipped as `muted` grey on the accent-filled own bubble —
  // about 1.1:1, unreadable — because it was the one colour in this component
  // that was not a prop. `muted` on `card` is fine; `muted` on `accent` is not.
  it('proves muted is unreadable on an accent bubble, which is why this is a prop', () => {
    expect(contrast(tokens.light.muted, tokens.light.accent)).toBeLessThan(2);
    expect(contrast(tokens.dark.muted, tokens.dark.accent)).toBeLessThan(3);
    expect(contrast(tokens.light.muted, tokens.light.card)).toBeGreaterThan(4.5);
  });
});

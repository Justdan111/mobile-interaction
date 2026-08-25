import React from 'react';
import { render } from '@testing-library/react-native';
import { VoiceNote } from '../../components/chat/VoiceNote';

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
    const a = await render(<VoiceNote voice={voice} tint="#7B77E8" barColor="#AAAAAA" />);
    const b = await render(<VoiceNote voice={voice} tint="#7B77E8" barColor="#AAAAAA" />);

    const barsA = barHeights(a.toJSON());
    const barsB = barHeights(b.toJSON());

    expect(barsA.length).toBeGreaterThan(0);
    expect(barsA).toEqual(barsB);
  });

  it('draws different bars for a different message seed', async () => {
    const a = await render(<VoiceNote voice={{ durationSec: 5, seed: 'alice-johnson-voice-1' }} tint="#7B77E8" barColor="#AAAAAA" />);
    const b = await render(<VoiceNote voice={{ durationSec: 5, seed: 'me-voice-1' }} tint="#7B77E8" barColor="#AAAAAA" />);

    const barsA = barHeights(a.toJSON());
    const barsB = barHeights(b.toJSON());

    // Not a byte-for-byte requirement that every bar differs, but a bar set
    // that never changes across seeds would mean the seed is being ignored.
    expect(barsA).not.toEqual(barsB);
  });

  it('shows the note duration', async () => {
    const r = await render(<VoiceNote voice={{ durationSec: 5, seed: 'x' }} tint="#7B77E8" barColor="#AAAAAA" />);
    expect(r.getByText('0:05')).toBeTruthy();
  });
});

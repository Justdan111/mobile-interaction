import React from 'react';
import { render } from '@testing-library/react-native';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { ThemeProvider } from '../../lib/theme';
import { tokens } from '../../lib/tokens';
import type { Message } from '../../data/types';

const voiceMessage = (senderId: string): Message => ({
  id: 'v1',
  threadId: 'x',
  senderId,
  voice: { durationSec: 5, seed: 'seed-1' },
  at: '2023-08-01T10:00:00Z',
  read: true,
});

/** react-native-svg packs a resolved colour as {type, payload: 0xAARRGGBB}. */
function toArgb(hex: string): number {
  return (0xff000000 | parseInt(hex.replace('#', ''), 16)) >>> 0;
}
const WHITE = toArgb('#FFFFFF');
const ACCENT = toArgb(tokens.light.accent);
const MUTED = toArgb(tokens.light.muted);

// Finds the VoiceNote circle's background, the play triangle's fill payload
// and the first waveform bar's fill payload, in document order.
function colors(
  node: any,
  out: { circle?: string; iconPayload?: number; barPayload?: number } = {}
): typeof out {
  if (node == null) return out;
  if (Array.isArray(node)) {
    node.forEach((n) => colors(n, out));
    return out;
  }
  if (
    node.type === 'View' &&
    typeof node.props?.className === 'string' &&
    node.props.className.includes('rounded-full') &&
    node.props?.style?.backgroundColor
  ) {
    out.circle = node.props.style.backgroundColor;
  }
  if (node.type === 'RNSVGPath' && node.props?.d === 'M9 6.5 18 12l-9 5.5Z') {
    out.iconPayload = node.props.fill?.payload;
  }
  if (node.type === 'RNSVGRect' && out.barPayload === undefined && node.props?.fill?.payload !== undefined) {
    out.barPayload = node.props.fill.payload;
  }
  if (Array.isArray(node.children)) node.children.forEach((c: any) => colors(c, out));
  return out;
}

describe('MessageBubble voice note colour contrast', () => {
  it('gives the play icon a colour that contrasts with its own white circle', async () => {
    const r = await render(
      <ThemeProvider>
        <MessageBubble message={voiceMessage('me')} isOwn senderName="You" showSender />
      </ThemeProvider>
    );
    const { circle, iconPayload, barPayload } = colors(r.toJSON());
    expect(circle).toBe('#FFFFFF');
    // Own voice notes draw an accent triangle on a white circle.
    expect(iconPayload).toBe(ACCENT);
    expect(iconPayload).not.toBe(WHITE);
    // Own bars sit on the accent bubble, so they take the white foreground.
    expect(barPayload).toBe(WHITE);
  });

  it('keeps the play icon white against another sender’s accent-tinted circle', async () => {
    const r = await render(
      <ThemeProvider>
        <MessageBubble message={voiceMessage('m-alice-johnson')} isOwn={false} senderName="Alice" showSender />
      </ThemeProvider>
    );
    const { circle, iconPayload, barPayload } = colors(r.toJSON());
    expect(circle).toBe(tokens.light.accent);
    expect(iconPayload).toBe(WHITE);
    // Other-sender bars are neutral gray, not the circle's accent tint.
    expect(barPayload).toBe(MUTED);
    expect(barPayload).not.toBe(ACCENT);
  });
});

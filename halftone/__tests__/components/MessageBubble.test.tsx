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

// Find the VoiceNote circle's background colour and the play triangle's
// resolved fill payload, in document order, from a rendered tree.
function colors(node: any, out: { circle?: string; iconPayload?: number } = {}): typeof out {
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
    const { circle, iconPayload } = colors(r.toJSON());
    expect(circle).toBe('#FFFFFF');
    // A component that hardcoded the icon to white (invisible on a white
    // circle, contradicting the comp's purple-on-white own voice note) must
    // fail this — iconPayload would equal WHITE instead of ACCENT.
    expect(iconPayload).toBe(ACCENT);
    expect(iconPayload).not.toBe(WHITE);
  });

  it('keeps the play icon white against another sender’s accent-tinted circle', async () => {
    const r = await render(
      <ThemeProvider>
        <MessageBubble message={voiceMessage('m-alice-johnson')} isOwn={false} senderName="Alice" showSender />
      </ThemeProvider>
    );
    const { circle, iconPayload } = colors(r.toJSON());
    expect(circle).toBe(tokens.light.accent);
    expect(iconPayload).toBe(WHITE);
  });
});

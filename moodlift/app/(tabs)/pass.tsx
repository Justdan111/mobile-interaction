import { useMemo, useState } from 'react';
import { Pressable, Share, Text, View, useWindowDimensions } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { QrCanvas } from '../../components/pass/QrCanvas';
import { PassTimer } from '../../components/pass/PassTimer';
import { Icon } from '../../components/ui/icons';

const MEMBER = {
  name: 'Andrew Cooper',
  phone: '+33 963 274 8107',
  id: 'MLF-4821-QX',
};

/** Passes are issued for ten minutes, as in the comp's countdown. */
const PASS_MINUTES = 10;
const SAGE = '#5F7359';
const INK = '#FFFFFF';
const MUTED_INK = 'rgba(255,255,255,0.6)';
const CARD_INNER = 'rgba(255,255,255,0.12)';
const ACCENT = '#E8724C';
/**
 * The finder patterns are drawn in a deepened accent, not the brand coral.
 * Coral sits at 57% luminance; a scanner's threshold reads that as white and
 * the three patterns it locks onto vanish. Verified by decoding renders:
 * #E8724C fails, #A8442A decodes.
 */
const ACCENT_DEEP = '#A8442A';
const PAGE = '#0E0E10';

export default function PassScreen() {
  const { width } = useWindowDimensions();
  const [issuedAt, setIssuedAt] = useState(() => Date.now());

  const totalMs = PASS_MINUTES * 60_000;
  const expiresAt = issuedAt + totalMs;

  // The code encodes the issue time, so a refreshed pass is a different code
  // rather than the same image with a reset timer.
  const payload = useMemo(
    () => `moodlift://pass?member=${MEMBER.id}&issued=${issuedAt}`,
    [issuedAt]
  );

  const qrSize = Math.min(width - 32 - 80, 300);

  return (
    <Screen>
      <Text className="mb-4 font-display text-[26px] text-ink">Qr-code</Text>

      <View className="overflow-hidden rounded-[28px] px-5 pb-5 pt-5" style={{ backgroundColor: SAGE }}>
        <View
          className="flex-row items-center rounded-2xl p-3"
          style={{ backgroundColor: CARD_INNER }}
        >
          <View
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: ACCENT }}
          >
            <Text className="font-display text-[17px]" style={{ color: PAGE }}>
              AC
            </Text>
          </View>

          <View className="ml-3 flex-1">
            <Text className="font-semibold text-[16px]" style={{ color: INK }} numberOfLines={1}>
              {MEMBER.name}
            </Text>
            <Text className="mt-0.5 font-body text-[13px]" style={{ color: MUTED_INK }}>
              {MEMBER.phone}
            </Text>
          </View>

          <Pressable
            onPress={() =>
              Share.share({ message: `${MEMBER.name}'s Moodlift gym pass: ${payload}` })
            }
            accessibilityRole="button"
            accessibilityLabel="Share pass"
            hitSlop={8}
            className="h-11 w-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: PAGE }}
          >
            <Icon name="share" color={INK} size={19} />
          </Pressable>
        </View>

        <View className="items-center py-7">
          <QrCanvas
            payload={payload}
            size={qrSize}
            moduleColor="#20301E"
            finderColor={ACCENT_DEEP}
            background="#FFFFFF"
            logoColor={ACCENT_DEEP}
          />
        </View>

        <PassTimer
          expiresAt={expiresAt}
          totalMs={totalMs}
          ink={INK}
          mutedInk={MUTED_INK}
          surface={CARD_INNER}
        />

        <Pressable
          onPress={() => setIssuedAt(Date.now())}
          accessibilityRole="button"
          accessibilityLabel="Issue a new code"
          className="mt-3 items-center py-1 active:opacity-70"
        >
          <Text className="font-body text-[13.5px]" style={{ color: MUTED_INK }}>
            Scan at the entrance
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

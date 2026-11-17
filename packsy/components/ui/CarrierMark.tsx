import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { CarrierId } from '../../lib/packages';

/**
 * The carrier's badge: a white disc with the carrier's name set as type.
 * These are lettermarks in the carriers' colours, not their logo artwork.
 */
export function CarrierMark({ carrier, size = 44 }: { carrier: CarrierId; size?: number }) {
  const s = size / 44;
  return (
    <View
      accessibilityLabel={carrier}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {carrier === 'amazon' ? (
        <View style={{ alignItems: 'center', marginTop: -4 * s }}>
          <Text style={{ fontSize: 26 * s, lineHeight: 28 * s, fontWeight: '700', color: '#111111' }}>a</Text>
          <Svg width={24 * s} height={8 * s} viewBox="0 0 24 8" style={{ marginTop: -5 * s }}>
            <Path d="M1.5 1.6C7.5 6 16 6.4 21.2 2.6" stroke="#F29A2E" strokeWidth={2} fill="none" strokeLinecap="round" />
            <Path d="M18.4 1.2 21.8 2.2 21 5.6" stroke="#F29A2E" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      ) : carrier === 'fedex' ? (
        <Text style={{ fontSize: 12.5 * s, fontWeight: '800', letterSpacing: -0.6 * s }}>
          <Text style={{ color: '#4D148C' }}>Fed</Text>
          <Text style={{ color: '#FF6200' }}>Ex</Text>
        </Text>
      ) : carrier === 'meest' ? (
        <Text style={{ fontSize: 12 * s, fontWeight: '800', fontStyle: 'italic', letterSpacing: -0.4 * s }}>
          <Text style={{ color: '#1E3A8A' }}>M</Text>
          <Text style={{ color: '#E0313B' }}>ee</Text>
          <Text style={{ color: '#1E3A8A' }}>st</Text>
        </Text>
      ) : (
        <Text style={{ fontSize: 13 * s, fontWeight: '900', fontStyle: 'italic', color: '#D40511' }}>DHL</Text>
      )}
    </View>
  );
}

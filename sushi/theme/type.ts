/**
 * Lexend, the geometric sans used throughout. Each weight loads as
 * its own family, so `fontWeight` is never used — pick the family instead.
 *
 * Japanese glyphs aren't in Lexend and fall through to the platform CJK face,
 * which is what the design calls for, so vertical runs omit `fontFamily`.
 */
export const font = {
  regular: 'Lexend_400Regular',
  medium: 'Lexend_500Medium',
  semibold: 'Lexend_600SemiBold',
  bold: 'Lexend_700Bold',
  black: 'Lexend_800ExtraBold',
} as const;

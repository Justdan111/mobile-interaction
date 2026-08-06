/**
 * Lexend, the geometric sans used throughout the comps. Each weight loads as
 * its own family, so `fontWeight` is never used — pick the family instead.
 *
 * Japanese glyphs aren't in Lexend and fall through to the platform CJK face,
 * which is what the comps show, so vertical runs simply omit `fontFamily`.
 */
export const font = {
  regular: 'Lexend_400Regular',
  medium: 'Lexend_500Medium',
  semibold: 'Lexend_600SemiBold',
  bold: 'Lexend_700Bold',
  black: 'Lexend_800ExtraBold',
} as const;

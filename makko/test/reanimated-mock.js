/**
 * Minimal Reanimated stand-in for Jest. The mock Reanimated 4.7 ships
 * (`react-native-reanimated/mock`) imports the real index, which initialises
 * the native module and throws under jest-expo 58. Screens only need
 * Animated.* components, layout-animation builders that chain, and the
 * shared-value hooks, so that is all this provides.
 */
const React = require('react');
const RN = require('react-native');

const builder = () => {
  const b = new Proxy(function () {}, {
    get: (_t, key) => (key === 'build' ? () => ({}) : () => b),
    apply: () => b,
  });
  return b;
};

const animated = (C) => {
  const Wrapped = React.forwardRef(({ entering, exiting, layout, ...rest }, ref) => React.createElement(C, { ...rest, ref }));
  Wrapped.displayName = `Animated(${C.displayName || C.name || 'Component'})`;
  return Wrapped;
};

const Animated = {
  View: animated(RN.View),
  Text: animated(RN.Text),
  Image: animated(RN.Image),
  ScrollView: animated(RN.ScrollView),
  createAnimatedComponent: animated,
};

const names = ['FadeIn', 'FadeOut', 'FadeInDown', 'FadeOutDown', 'FadeInRight', 'FadeOutLeft', 'ZoomIn', 'LinearTransition'];
const builders = Object.fromEntries(names.map((n) => [n, builder()]));

module.exports = {
  __esModule: true,
  default: Animated,
  ...Animated,
  ...builders,
  Easing: { linear: (t) => t, bezier: () => (t) => t, out: (f) => f, in: (f) => f, inOut: (f) => f },
  useSharedValue: (v) => React.useRef({ value: v }).current,
  useAnimatedStyle: (fn) => fn(),
  withTiming: (v) => v,
  withSpring: (v) => v,
  withRepeat: (v) => v,
  useDerivedValue: (fn) => ({ value: fn() }),
  withSequence: (...steps) => steps[steps.length - 1],
  withDelay: (_ms, v) => v,
  interpolateColor: (_v, _i, o) => o[0],
  useAnimatedProps: (fn) => fn(),
  useAnimatedScrollHandler: () => () => {},
  interpolate: (_v, _i, o) => o[0],
};

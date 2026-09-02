/**
 * Guards the one rule that the type checker cannot see.
 *
 * `babel-preset-expo` serialises every function marked with the `'widget'` directive to
 * a string, and the widget extension re-evaluates that string in a bare JS runtime. The
 * only things in scope there are the `@expo/ui` components and modifiers the runtime
 * injects as globals, a small JSX/React shim, and whatever the function declares itself.
 *
 * A reference to anything else — a shared theme module, a helper, a constant — type
 * checks happily and then renders a red box on device. This walks the serialised body
 * and fails if it reaches for an identifier that will not exist at render time.
 */
const babel = require('@babel/core');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const fs = require('fs');
const path = require('path');

const WIDGET_UI_MODULES = ['@expo/ui/swift-ui', '@expo/ui/swift-ui/modifiers'];

// Mirror the app's own Babel configuration, so what we analyse is what actually ships.
// The React Compiler matters here: it rewrites components to call a `_c` memo-cache
// helper that the widget runtime does not provide, and Expo's `'widget'` opt-out does
// not reach functions declared *inside* the layout function.
const APP_CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'app.json'), 'utf8'));
const REACT_COMPILER = Boolean(APP_CONFIG.expo?.experiments?.reactCompiler);
const PRESET_OPTIONS = { reactCompiler: REACT_COMPILER ? undefined : false };
// `babel-preset-expo` reads this off the Babel caller, the way Metro supplies it.
const BABEL_CALLER = {
  name: 'metro',
  platform: 'ios',
  isDev: false,
  isServer: false,
  supportsStaticESM: true,
  supportsReactCompiler: REACT_COMPILER,
};

// Injected by expo-widgets/bundle/index.ts, plus the aliases Babel's JSX transform emits.
const RUNTIME_GLOBALS = new Set([
  'React', 'Fragment', '_Fragment', '_jsxFileName',
  'jsx', 'jsxs', 'jsxDEV', 'jsxProd', '_jsx', '_jsxs', '_jsxDEV',
]);

const JS_BUILTINS = new Set([
  'Object', 'Array', 'String', 'Number', 'Boolean', 'Math', 'JSON', 'Date', 'RegExp',
  'Map', 'Set', 'WeakMap', 'WeakSet', 'Promise', 'Symbol', 'BigInt', 'Error', 'TypeError',
  'RangeError', 'undefined', 'NaN', 'Infinity', 'globalThis', 'console', 'parseInt',
  'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent', 'Intl',
]);

function collectAllowedImports(source, file) {
  const ast = parser.parse(source, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });
  const allowed = new Set();
  const foreign = new Map();
  for (const node of ast.program.body) {
    if (node.type !== 'ImportDeclaration' || node.importKind === 'type') continue;
    const from = node.source.value;
    for (const spec of node.specifiers) {
      if (spec.importKind === 'type') continue;
      const local = spec.local.name;
      if (WIDGET_UI_MODULES.includes(from)) allowed.add(local);
      else foreign.set(local, from);
    }
  }
  return { allowed, foreign };
}

/** Pulls out every string produced by the widget serialiser. */
function serialisedWidgetBodies(code) {
  const ast = parser.parse(code, { sourceType: 'module' });
  const bodies = [];
  traverse(ast, {
    TemplateLiteral(p) {
      if (p.node.expressions.length !== 0 || p.node.quasis.length !== 1) return;
      const raw = p.node.quasis[0].value.cooked ?? p.node.quasis[0].value.raw;
      if (/^function\s*\(/.test(raw.trim())) bodies.push(raw);
    },
  });
  return bodies;
}

function freeIdentifiers(functionSource) {
  const ast = parser.parse(`(${functionSource})`, { sourceType: 'script' });
  let globals = [];
  traverse(ast, {
    Program(p) {
      globals = Object.keys(p.scope.globals);
      p.stop();
    },
  });
  return globals;
}

const dir = path.join(__dirname, '..', 'widgets');
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.tsx') || (f.endsWith('.ts') && f !== 'index.ts'))
  .map((f) => path.join(dir, f));

let failures = 0;
let checked = 0;

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const { allowed, foreign } = collectAllowedImports(source, file);
  const out = babel.transformSync(source, {
    filename: file,
    presets: [[require.resolve('babel-preset-expo'), PRESET_OPTIONS]],
    caller: BABEL_CALLER,
    babelrc: false,
    configFile: false,
  });

  const bodies = serialisedWidgetBodies(out.code);
  if (bodies.length === 0) {
    // Only a file that registers a widget needs a serialised layout; plain helpers are fine.
    if (/\bcreate(Widget|LiveActivity)\s*[<(]/.test(source)) {
      console.error(
        `✗ ${path.relative(process.cwd(), file)}: registers a widget but has no 'widget' ` +
          'directive — the layout will not be serialised.'
      );
      failures++;
    }
    continue;
  }

  for (const body of bodies) {
    checked++;
    for (const name of freeIdentifiers(body)) {
      if (allowed.has(name) || RUNTIME_GLOBALS.has(name) || JS_BUILTINS.has(name)) continue;
      const origin = foreign.get(name);
      const hint =
        name === '_c'
          ? " — React Compiler output. Add a 'use no memo' directive to the nested component."
          : ' — it will be undefined inside the widget extension.';
      console.error(
        `✗ ${path.relative(process.cwd(), file)}: widget body references '${name}'` +
          (origin ? ` imported from '${origin}'` : ' (not declared in the body)') +
          hint
      );
      failures++;
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} problem(s) found.`);
  process.exit(1);
}
console.log(`✓ ${checked} widget layout(s) in ${files.length} file(s): every reference resolves at render time.`);

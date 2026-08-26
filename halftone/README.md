# Halftone

A creative marketplace and team workspace, built as an Expo / React Native app.
Nine screens: splash, onboarding, a project feed, project detail, a chats list,
a chat thread, team detail, a proposals inbox, and a profile with a working
dark-mode switch — plus a hand-rolled month calendar.

**All data is mock.** There is no backend, no auth, and no networking of any
kind. Everything on screen is derived from the fixtures in `data/`, and every
image in the app — every avatar, team tile and art card — is generated at
runtime by the halftone engine. No photography ships with this app.

## Running it

```bash
npm install
npm start          # Metro on port 8091
npm run ios        # …and open the iOS simulator
```

The port is pinned to **8091** deliberately. Several Expo projects live
side by side in this repository, and a shared port leaves Expo Go holding a
stale entry that resolves assets from whichever project started last.

Deep links follow `exp://<host>:8091/--/<route>`, e.g. `/--/chats` or
`/--/team/t-website-dev`. Use the host the CLI prints — it is a LAN address
and it changes between restarts.

## Tests

```bash
npx jest           # the whole suite
npx jest -w 3      # …on a loaded machine
```

267 tests across 30 suites, covering the field generators, the seeded random,
calendar date maths, data derivations, message grouping, theme persistence,
and every screen.

`-w 3` is worth knowing about. Jest defaults to one worker per core minus one,
and each suite boots a full `jest-expo` environment; on a machine already busy
with Metro and a simulator, the workers oversubscribe badly enough that React
Testing Library's cleanup blows its timeout and passing tests report as
failures. Three workers runs the suite in about twelve seconds against roughly
fourteen minutes at the default.

```bash
npx tsc --noEmit   # zero errors, and it is kept there
```

## Tokens and colour

`lib/tokens.ts` holds a `tokens` map keyed by mode (`light` / `dark`), with
eleven semantic names: `page`, `card`, `ink`, `muted`, `accent`, `accentDeep`,
`chip`, `hairline`, `danger`, `info`, `success`.

Consume them two ways:

- **Tailwind classes** — `bg-card`, `text-ink`, `border-hairline`. `global.css`
  declares the palette as CSS variables and `tailwind.config.js` maps each to a
  colour name, so classes resolve per mode automatically.
- **`useTheme().t`** — the raw values, for anything that cannot take a
  className: SVG fills, glass tints, animated styles.

**To add a colour**, add the name to `TOKEN_NAMES`, add a value under both
`light` and `dark`, add the CSS variable in `global.css`, and map it in
`tailwind.config.js`. `__tests__/lib/tokens.test.ts` asserts the map exactly,
so it will tell you what you missed.

### Two rules the codebase enforces

**No raw hex at a call site.** If a colour is not a semantic token, it still
belongs in `lib/tokens.ts` as a named export with a comment saying why it is
not mode-keyed — `PLATE_COLORS`, `TILE_GROUNDS`, `PROFILE_PLATE_COLOR`,
`RATING_STAR_COLOR` and friends are all art-direction plates that read the same
in both themes.

**A foreground's colour belongs to whoever knows the surface.** This build
produced the same defect seven separate times: text or an icon drawn in a
colour that matched the thing behind it. If a component can be rendered on more
than one background, its foreground colours must be **props**, not constants —
see `VoiceNote`, where `iconColor`, `barColor` and `durationColor` are all
props for exactly this reason. Two suites now assert WCAG contrast ratios
directly.

## The halftone engine

`components/halftone/` turns a string seed into a field of dots.

- `lib/seed.ts` — `hashSeed` gives a stable uint32 from a string; `makeRandom`
  turns that into a deterministic PRNG. Same seed, same art, every render.
- `components/halftone/fields.ts` — the field functions. Each maps a normalised
  (x, y) to a dot radius, and `FIELD_NAMES` lists them.
- `components/halftone/Halftone.tsx` — renders a field to SVG circles. Takes
  `variant`, `size`, `seed`, `density`, `dotColor` and `background`.

`Avatar` and `TeamTile` sit on top: they hash a name to pick a variant and a
plate colour, so a person always looks like themselves.

**To add a variant**, write the field function in `fields.ts` and add its name
to `FIELD_NAMES`. Everything that picks a variant does so by indexing that
array, so it is immediately in rotation — and `fields.test.ts` will hold it to
the shared contract.

`dotColor` on `Halftone` and `color` on `Icon` are both **required**, with no
default. That is deliberate: a default is how a foreground ends up matching its
surface.

## Layout

```
app/            expo-router routes; (tabs)/ is the five-tab group
components/     halftone/ ui/ home/ chat/ tabs/ calendar/ profile/ proposals/
data/           mock fixtures and their types
lib/            tokens, theme, seed, calendar, derive, format, today, glass
__tests__/      mirrors the source tree
.design/comps/  the reference comps
.design/NOTES.md  screenshot-pass findings and every deliberate departure
```

Comps are referenced by **filename**, never by number — the numbering in the
spec does not match the files' order, and trusting it has already produced one
wrong conclusion.

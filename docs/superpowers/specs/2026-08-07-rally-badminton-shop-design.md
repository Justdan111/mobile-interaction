# Rally — badminton gear shop

Design spec, 2026-08-07.

Source comps: `.screenshots/2026-08-07-racket-shop/` — three screens, captured
from a mobile shopping concept.

| File | Screen |
| --- | --- |
| `Screenshot 2026-08-07 at 09.51.06.png` | Home |
| `Screenshot 2026-08-07 at 09.51.34.png` | Drawer, open over Home |
| `Screenshot 2026-08-07 at 09.51.45.png` | Product detail |

## Goal

A new sibling app at `rally/`, matching the three comps closely enough that a
side-by-side screenshot comparison reads as the same design, with the
interactions behind them actually working rather than mocked.

## Stack

Matches the existing `sushi` and `glucose` apps — the versions are pinned to
Expo SDK 57 and must not drift, because Expo Go on this machine is patched to a
specific SDK and skew produces a silent bounce to the home screen at splash.

| Package | Version |
| --- | --- |
| `expo` | `~57.0.11` |
| `expo-router` | `~57.0.11` |
| `react` / `react-dom` | `19.2.3` |
| `react-native` | `0.86.2` |
| `react-native-reanimated` | `4.5.1` |
| `react-native-worklets` | `0.10.1` |
| `react-native-gesture-handler` | `~2.32.0` |
| `react-native-svg` | `15.15.4` |
| `nativewind` | `^4.2.6` |
| `tailwindcss` | `^3.4.19` (dev) |
| `@expo-google-fonts/nunito` | `^0.4.1` |

Also: `expo-image`, `expo-linear-gradient`, `expo-haptics`, `expo-font`,
`expo-splash-screen`, `expo-status-bar`, `expo-constants`, `expo-linking`,
`react-native-safe-area-context`, `react-native-screens`.

Expo 57 changed enough that its exact versioned docs
(<https://docs.expo.dev/versions/v57.0.0/>) are the reference, not memory. This
app builds its own drawer and uses no tab navigator, so the deprecated root
`Tabs` export is not in play — but the same caution holds for every router API
touched: check the versioned docs before writing against it.

`app.json` sets name `Rally`, slug and scheme `rally`, `userInterfaceStyle`
`light`, and `backgroundColor` `#F1F1F1` to match the page ground.

### Dev server port

`package.json` pins `expo start --port 8085`. Expo Go caches recently-opened
projects keyed by dev-server URL, so sibling apps sharing port 8081 cause a
cached entry from one app to request assets from whichever server currently
holds the port — surfacing as `ENOENT` on an asset path that belongs to a
different project. 8085 is unclaimed by the other apps in this repo.

## Visual system

Values read from the comps.

### Colour

| Token | Value | Use |
| --- | --- | --- |
| `ground` | `#F1F1F1` | Page background |
| `surface` | `#FFFFFF` | Cards, search field, chips, thumbnail rail |
| `teal` | `#2B5561` | Primary — banner, drawer, active chip, buttons |
| `teal-deep` | `#1E3D45` | Gradient end for banner and drawer |
| `teal-tint` | `#E8EFF1` | Selected thumbnail fill |
| `ember` | `#E8442C` | Notification badge, active-status dot, brand mark |
| `ink` | `#1A1A1A` | Headings, price pills |
| `muted` | `#A0A0A0` | Placeholder text, product category, "See more" |
| `star` | `#F5C518` | Rating star |

Drawer type is white; inactive drawer items are white at ~55% opacity.

### Radii and rhythm

Corner radii are large and consistent: **16** on cards, chips, search field and
thumbnails; **20** on the voucher banner and the detail hero; **28** on the
scaled-back content screen behind the open drawer; fully round on the heart
buttons, the stepper's count area and the Buy Now pill.

Horizontal page padding is a single value (~20) applied everywhere except the
product grid and category rail, which bleed to the right edge so the next item
is partly visible.

### Type

The comps use a geometric sans with rounded terminals and a double-storey `a`.
The closest match available through `@expo-google-fonts` is **Nunito**.

Nunito ships one family per weight, so each registers separately, following the
`glucose` convention — the prefixed names keep these clear of Tailwind's own
font-weight utilities, which would otherwise collide on `font-bold`:

```
font-nunito           Nunito_400Regular
font-nunito-semibold  Nunito_600SemiBold
font-nunito-bold      Nunito_700Bold
font-nunito-extrabold Nunito_800ExtraBold
```

Approximate scale: screen titles and section headings 22–24 extrabold; the
detail product title 28–30 extrabold over two lines; body and product names
15–16 semibold; metadata and placeholders 13–14 regular.

## Screens

### Home — `app/(shop)/index.tsx`

Vertical scroll on `ground`, inside the safe area.

1. **Header row.** Hamburger button left (three lines, ~26 wide, `ink`), bell
   button right (outline bell with an `ember` dot at the top-right of the
   glyph). Hamburger opens the drawer.
2. **Search field.** White card, radius 16, ~56 tall, magnifier outline icon
   left, placeholder `Search your rackets` in `muted`. It is a real
   `TextInput`; filtering is out of scope, so it holds text and nothing more.
3. **Voucher carousel.** A paging horizontal `FlatList` of 4 cards, radius 20,
   roughly 2:1, filled with the teal vertical gradient. Each card carries the
   brand mark top-right and two lines of white extrabold copy — `Get voucher` /
   `discount up to 50%` — with a hand-drawn underline swoosh beneath the word
   `discount`. The swoosh is an SVG path, not a text decoration; it overshoots
   the word on both ends and has the doubled-stroke look of a marker.
4. **Page dots.** Four dots under the carousel; the active one is `teal` and
   slightly wider, the rest are a light grey. Driven by the carousel's scroll
   offset.
5. **Categories.** Section heading, then a horizontal rail of 4 brand tiles,
   ~118×88, radius 16. The selected tile is filled `teal` with a white
   wordmark; unselected tiles are white with a dark wordmark. Selection is
   local state and re-orders nothing — it is a visual filter affordance only.
6. **Popular Product.** Section heading with a `See more` link in `muted` on
   the right, then a 2-column grid of product cards.

**Product card.** White, radius 16. The upper ~60% is the product image on a
faintly darker inset; a dark `ink` price pill (radius 10) floats at the image's
top-right, and a white circular heart button floats at its bottom-right. Below,
the product name in semibold `ink` over the category in `muted`. The heart is
filled `ember` when the product is favourited.

### Drawer — `app/(shop)/_layout.tsx`

Built by hand with Reanimated rather than a stock drawer navigator, because the
comped effect is specific and a stock drawer will not produce it.

The drawer panel is the base layer: a full-screen teal vertical gradient. The
app content sits above it and moves aside:

- translates right to ~62% of screen width
- scales to ~0.78 about its centre
- gains a 28 radius and a soft shadow
- a second, translucent white sheet sits just behind the content card, offset
  slightly left and up, so a pale edge peeks out from behind it

All four transforms are one shared progress value in `[0, 1]`, driven by a
spring on button press and by a horizontal pan gesture. While open, the content
card is inert to touch and a tap anywhere on it closes the drawer.

Panel contents, top to bottom:

- **Profile.** 56 circular avatar, name in white extrabold ~22, and below it an
  `ember` dot with `Active status`. An X button sits at the top right.
- **Nav list**, vertically centred: Home, Cart, Favourites, Message, Account,
  Setting. Each row is an icon plus a ~20 label. The active row (Home) uses a
  filled icon and full-opacity white; the rest use outline icons at ~55%
  opacity. The Cart row shows a count badge when the cart is non-empty.
- **Sign Out** pinned to the bottom with a logout icon. It resets the store and
  closes the drawer; there is no auth to sign out of.

### Product detail — `app/(shop)/product/[id].tsx`

1. **Header.** Teal back chevron left, `Detail Product` centred in extrabold
   `ink`.
2. **Hero.** A light rounded card, radius 20, holding the selected product
   image large and centred. A white thumbnail rail floats over its right edge:
   a rounded white column containing three ~74 square thumbnails, radius 16,
   the selected one ringed in `teal` and filled `teal-tint`, with a chevron-up
   affordance below them. Tapping a thumbnail swaps the hero image.
3. **Title block.** `Racket` eyebrow in small bold, then the product name in
   extrabold over two lines, with a white circular heart button floating to its
   right, vertically centred against the title.
4. **Meta row.** `4.5` + star, a thin vertical rule, `23K sold`; on the right, a
   quantity stepper — teal rounded squares carrying `−` and `+` with the count
   between them on white. Minimum 1, no maximum.
5. **Description.** Regular `muted` body text, masked with a vertical
   fade-to-transparent gradient so the last line dissolves, exactly as comped.
   The text is not scrollable; the fade is the design, not a scroll hint.
6. **Price bar.** Pinned to the bottom above the safe area: `Total Price` in
   small `muted` over `$ 120.00` in extrabold ~26 on the left; a teal Buy Now
   pill on the right. The total is unit price × stepper quantity, so it moves
   with the stepper.

### Placeholder screens

`cart`, `favourites`, `message`, `account`, `setting` all render one shared
empty-state component — the screen's title, a muted line saying there is
nothing here yet, and a back affordance. Favourites and Cart show their item
counts so the store's effects are visible. These exist so drawer navigation
never dead-ends; they are not designed screens.

## Data

`data/brands.ts`, `data/products.ts`, `data/vouchers.ts`.

The comps use real trademarks (Li-Ning, Yonex, Wilson, Apacs). This app ships
four invented house brands instead, each with an original SVG wordmark, so the
category rail keeps its logo-tile texture without borrowing anyone's marks:

| Brand | Mark |
| --- | --- |
| **Volara** | Hero brand — an `ember` swoosh above the wordmark |
| **Kestrel** | Angular chevron, bird-derived |
| **Ardent** | Heavy condensed wordmark |
| **Sable** | Compact geometric `S` in a rounded square |

Products are renamed to suit — e.g. *Volara Kinetic 17 Limited Edition*
(Racket, $120), *Volara A+ 90 State* (Shuttlecock, $80). Six to eight products
across the four brands, each with: id, name, brand, category, price, rating,
sold count, description, and an array of three image keys for the thumbnail
rail.

## Imagery

Photography follows the pipeline established in `sushi`, and the tooling must
handle assets added later — not just the initial set.

- `tools/fetch-photos.sh` downloads badminton photography from Unsplash (free
  for commercial use under the Unsplash License) into `assets/img/`.
- `tools/make-art.py` runs over `assets/img/*.jpg` automatically. For each
  photo it cuts the subject out of its background with a soft, subject-centred
  falloff and grades the edge toward `#F1F1F1`, so the product settles into the
  page instead of sitting on it as a rectangle. Output goes to
  `assets/img/cut/`, and it writes `data/images.ts` as a typed manifest of
  everything it produced. Drop a new photo in, re-run, done.
- `CREDITS.md` lists every source photo and its Unsplash id.

Metro must be stopped before running `make-art.py`: it watches `assets/` and
will read a PNG mid-write, then cache `Error: Empty file` against that path
until the server is restarted.

Brand wordmarks and every UI icon are hand-drawn SVG in `components/icons.tsx`
— no icon font, so stroke weights can match the comps.

App icons (launcher, adaptive foreground/background/monochrome, splash,
favicon) come from `tools/gen-icons.sh`, ported from `glucose`, so the icon set
regenerates from one source mark rather than being hand-assembled.

## State

One React context plus reducer in `state/store.ts`, provided at the root
layout. No persistence — state lives for the session only.

```ts
type State = {
  favourites: Set<string>;      // product ids
  cart: { id: string; qty: number }[];
};
```

Actions: `toggleFavourite(id)`, `addToCart(id, qty)`, `reset()`. Derived
selectors expose `isFavourite(id)` and `cartCount`.

Effects visible in the UI:

- Heart buttons on the grid and the detail screen reflect and toggle the same
  favourite, and survive navigation between the two.
- The detail stepper drives the displayed total price.
- Buy Now adds the current quantity to the cart, fires a haptic, and lights the
  count badge on the drawer's Cart row.
- Sign Out clears everything.

## File layout

```
rally/
  app/
    _layout.tsx                  fonts, splash, StoreProvider, GestureHandlerRootView
    (shop)/_layout.tsx           drawer host + animated content wrapper
    (shop)/index.tsx             Home
    (shop)/product/[id].tsx      Detail
    (shop)/cart.tsx              placeholder
    (shop)/favourites.tsx        placeholder
    (shop)/message.tsx           placeholder
    (shop)/account.tsx           placeholder
    (shop)/setting.tsx           placeholder
  components/
    icons.tsx                    UI icons + brand wordmarks, all SVG
    ui/                          Screen, SectionHeader, IconButton, PricePill,
                                 HeartButton, Stepper, EmptyState
    home/                        SearchField, VoucherCarousel, VoucherCard,
                                 PageDots, CategoryRail, ProductGrid, ProductCard
    drawer/                      DrawerPanel, DrawerItem, ProfileHeader
    detail/                      HeroGallery, ThumbRail, MetaRow, PriceBar
  data/                          brands.ts, products.ts, vouchers.ts, images.ts
  state/store.ts
  theme/tokens.ts
  tools/                         fetch-photos.sh, make-art.py, gen-icons.sh
  assets/img/                    raw .jpg + cut/*.png
  app.json  tailwind.config.js  metro.config.js  babel.config.js
  global.css  nativewind-env.d.ts  tsconfig.json  package.json
  CREDITS.md  README.md  AGENTS.md
```

Each component file stays focused — a file growing past a couple of hundred
lines is a signal it is doing more than one job and should be split.

## Error handling

There is no network at runtime and no persistence, so the failure surface is
small and local:

- **Missing image key.** `data/images.ts` is generated, so a product
  referencing a key that does not exist is a build-time type error rather than
  a runtime blank. `HeroGallery` and `ProductCard` still render their inset
  background if a source fails to decode, so a broken asset leaves a shaped
  hole rather than collapsing the layout.
- **Unknown product id.** `product/[id].tsx` renders the shared empty state
  with a back affordance instead of throwing.
- **Fonts.** The root layout holds the splash screen until Nunito resolves,
  then hides it, so no frame renders in the fallback system font.
- **Stepper bounds.** Quantity clamps at 1; `−` is visibly disabled there.

## Verification

These apps carry no test runner, and adding one for a three-screen visual build
is not worth its weight. Verification is the screenshot loop already
established for `sushi` and `glucose`:

1. Start Metro on port 8085.
2. Open in Expo Go via an `exp://` deep link.
3. Capture Home, the open drawer, and the detail screen.
4. Compare each against its comp in `.screenshots/2026-08-07-racket-shop/`,
   and iterate on spacing, weight and colour until they read as the same
   design.

Synthetic taps do not work in this simulator setup, so interactive state is
verified by forcing it — render with a product pre-favourited, a non-empty
cart, and the second thumbnail selected, then screenshot those.

A `tsc --noEmit` pass must be clean before the work is called done.

## Out of scope

Search filtering, checkout, auth, persistence, real Cart/Favourites/Message/
Account/Setting screens, and Android-specific tuning. The four uncomped drawer
destinations stay placeholders.

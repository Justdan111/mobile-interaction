# Design verification notes

Screenshot pass over every screen in both appearances, compared against
`.design/comps/`. Captures live in `.design/task18-verification/{dark,light}/`,
with the per-task evidence in the sibling `task*-verification/` directories.

The comps are referenced here by **filename**, never by number. The spec's
numbering does not match the files' order, and during Task 11 two reviewers and
the controller all reasoned from "comp 6" without opening it and reached the
wrong conclusion. Open the file.

| Screen | Comp | Verdict |
|---|---|---|
| Splash | `07.20.03` | Matches — wordmark, centred, fades in. |
| Onboarding | `07.17.50` | Matches — headline, subhead, halftone art, segmented progress, Next, Skip. |
| Home | `07.18.00` | Matches — greeting, search, art-card rail, project cards. |
| My projects → Calendar | `07.18.11` | Matches, with the deliberate departures below. |
| Chats → Teams | `07.18.39` | Matches — tile, name, member count, sender chip, preview, timestamp, badges. |
| Chats row swiped | `07.18.55` | Matches — blue mute, red exit. Read ticks are a straight unread binary. |
| Chat thread | `07.19.10` | Matches — grouped bubbles, avatar on the group's last bubble, voice notes, composer. |
| Team detail | `07.19.21` | Matches, with the departures below. |
| Profile | `07.20.38` | Matches, with the departures below. |

## Deliberate departures

Each of these is a considered decision, not an oversight.

**The calendar grid is correct where the comp is not.** The comp's August 2023
puts the 1st on a Wednesday (it was a Tuesday) and stops at the 30th (August has
31 days). The plan called this out and instructed us to build a correct grid and
let the marks carry the visual match. The calendar is also live: it opens on the
real current month with the real current date marked, so it will never
reproduce the comp's specific month.

**Avatars and art are procedural, never photographic.** The comps show stock
photography for people; the spec's Out of Scope section says outright "Real
photography. Avatars and art are procedural." Every avatar, team tile and art
card is generated from a seeded halftone field.

**The team-detail notification toggle reads on where the comp shows off.** It
is seeded from that team's own `muted` field — the same field the chats list's
swipe-to-mute action reads — rather than a hardcoded literal, so the two
surfaces cannot contradict each other. The spec mandates only that the toggle
"set local state only" and specifies no initial value.

**The calendar keeps both month arrows.** The comp draws only a forward chevron
beside the month heading. A calendar you cannot page backwards in is worse, and
the spec does not mandate one direction, so both arrows ship.

**The proposals tab has no comp.** The nine comps cover onboarding, home,
calendar, chats, chat thread, team detail and profile. Proposals was built
against the spec's prose instead.

## Defects found by this pass that unit tests could not

Listed because they are the argument for doing a screenshot pass at all.

1. **Voice-note duration was illegible on your own messages.** `muted` grey on
   the accent-filled bubble is about 1.1:1. Every other colour in `VoiceNote`
   is a prop precisely because the bubble fill differs between own and other
   messages; the duration was the one left hardcoded. Now `durationColor`, with
   `MESSAGE_ON_ACCENT_MUTED_COLOR` shared with the timestamp beside it.
2. **A joined calendar range showed a seam.** Seven `flex: 1` columns leave a
   fractional remainder, and a dark hairline opened between two filled cells —
   splitting the single pill the spec requires a multi-day range to read as.
   Joined cells now overlap by half a point.
3. **A white status-bar clock on the pale profile plate.** The root layout sets
   the bar from the theme; the profile header is light in both themes. Scoped
   to focus and handed back on blur.
4. **An invisible ghost-button outline.** `hairline` is tuned to separate rows
   on `card`; the only ghost button in the app sits on `chip`, where it is the
   same colour.

All four are the same defect class: **a foreground drawn on a surface it cannot
be read against.** It has now appeared seven times across this build — the
focused tab icon, the art-card caption, the voice-note play icon, the waveform
bars, and the four above. `__tests__/screens/profile.test.tsx` and
`__tests__/components/VoiceNote.test.tsx` now assert contrast ratios directly,
which is the first coverage that fails on the *class* rather than on one
instance of it.

## The glass tab bar

`isLiquidGlassAvailable()` returns false under Expo Go, because
`expo-glass-effect` ships no config plugin and its native module is therefore
never linked there (see the comment at the top of `lib/glass.ts`). **Every
screenshot in this pass is consequently the blur fallback**, and the tab bar is
legible against every screen in both appearances. The true glass path needs a
dev build; Task 7 verified it separately by forcing the branch, and
`__tests__/tabs/GlassTabBar.glass-branch.test.tsx` covers it.

Reduce Transparency could not be exercised: `xcrun simctl ui` exposes
`appearance` and `increase_contrast` but no reduce-transparency option, and
synthetic taps do not work in this workspace, so the Settings toggle is out of
reach. The risk is low — with glass unavailable the app already renders the
opaque fallback these captures show, and where glass *is* available iOS applies
Reduce Transparency to the material itself.

## Cold start

After `npx expo start --clear`, the app ran splash → onboarding from scratch,
observed on device. The return path — a second launch skipping onboarding — is
covered by tests rather than by the device, because completing onboarding needs
a tap this workspace cannot synthesise: `splash.test.tsx` asserts routing in
both directions plus the storage-read-rejects fallback, and
`onboarding.test.tsx` asserts that Skip persists the flag and routes to the
tabs.

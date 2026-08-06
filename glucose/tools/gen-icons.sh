#!/bin/bash
set -euo pipefail

# Regenerates the Glucose app icon set. Requires rsvg-convert (brew install librsvg).
# Run from anywhere:  bash tools/gen-icons.sh
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/assets"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"

# The glucose trace: flat baseline, post-meal rise, crest, recovery.
# Two cuts of the same curve. The bleed version runs off both edges so the area
# wash under it never shows a seam; the mark version keeps its round caps inside
# the canvas for standalone use on the splash and adaptive icons.
BLEED="M -60 664 C 60 660 180 672 300 668 C 390 666 424 540 500 440 C 564 356 604 320 664 336 C 734 354 764 490 824 540 C 900 604 1000 620 1084 616"
MARK="M 132 660 C 210 656 256 668 320 666 C 400 664 440 540 516 440 C 580 356 620 320 680 336 C 750 354 780 490 840 540 C 872 562 888 570 908 574"

defs() {
cat <<'EOF'
  <defs>
    <linearGradient id="trace" x1="112" y1="660" x2="912" y2="336" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#5A4780"/>
      <stop offset="0.45" stop-color="#A07FD4"/>
      <stop offset="1" stop-color="#D8B4F0"/>
    </linearGradient>
    <linearGradient id="wash" x1="0" y1="320" x2="0" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#A07FD4" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#A07FD4" stop-opacity="0"/>
    </linearGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
  </defs>
EOF
}

# $1 path, $2 crest x, $3 crest y, $4 stroke paint, $5 node paint, $6 "wash"|"nowash"
mark() {
  local d="$1" cx="$2" cy="$3" stroke="$4" node="$5" wash="$6"
  [ "$wash" = "wash" ] && printf '    <path d="%s L 1084 1084 L -60 1084 Z" fill="url(#wash)"/>\n' "$d"
  cat <<EOF
    <path d="$d" fill="none" stroke="$stroke" stroke-width="52"
          stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" opacity="0.7"/>
    <path d="$d" fill="none" stroke="$stroke" stroke-width="52"
          stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="$cx" cy="$cy" r="74" fill="$node" opacity="0.22" filter="url(#glow)"/>
    <circle cx="$cx" cy="$cy" r="38" fill="$node"/>
EOF
}

# --- icon.png: full-bleed void black, trace running edge to edge ---
{
  echo '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">'
  defs
  echo '  <rect width="1024" height="1024" fill="#000000"/>'
  mark "$BLEED" 664 336 "url(#trace)" "#D8B4F0" wash
  echo '</svg>'
} > "$TMP/icon.svg"

# --- splash-icon.png: transparent, contained mark on the launch screen ---
{
  echo '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">'
  defs
  echo '  <g transform="translate(512,512) scale(0.78) translate(-512,-512)">'
  mark "$MARK" 680 336 "url(#trace)" "#D8B4F0" nowash
  echo '  </g></svg>'
} > "$TMP/splash-icon.svg"

# --- android adaptive foreground: contained in the centre safe zone ---
{
  echo '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">'
  defs
  echo '  <g transform="translate(512,512) scale(0.62) translate(-512,-512)">'
  mark "$MARK" 680 336 "url(#trace)" "#D8B4F0" nowash
  echo '  </g></svg>'
} > "$TMP/android-icon-foreground.svg"

# --- android adaptive background: solid void ---
cat > "$TMP/android-icon-background.svg" <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#000000"/>
</svg>
EOF

# --- android monochrome: flat white mark in the safe zone ---
{
  echo '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">'
  defs
  echo '  <g transform="translate(512,512) scale(0.62) translate(-512,-512)">'
  mark "$MARK" 680 336 "#FFFFFF" "#FFFFFF" nowash
  echo '  </g></svg>'
} > "$TMP/android-icon-monochrome.svg"

# Canonical location is assets/images (Expo's default template layout, and what
# app.json points at). The assets/ root keeps a mirrored copy on purpose - see
# assets/README.md: Expo Go re-requests icons from whichever dev server holds the
# port it cached, so sibling projects' icon paths land here and must resolve.
mkdir -p "$OUT/images"

for name in icon splash-icon android-icon-foreground android-icon-background android-icon-monochrome; do
  rsvg-convert -w 1024 -h 1024 "$TMP/$name.svg" -o "$OUT/images/$name.png"
done
rsvg-convert -w 48 -h 48 "$TMP/icon.svg" -o "$OUT/images/favicon.png"

cp "$OUT"/images/*.png "$OUT/"

echo "--- generated ---"
for f in "$OUT"/images/*.png; do
  printf '%s  ' "$(basename "$f")"
  sips -g pixelWidth -g pixelHeight "$f" 2>/dev/null | awk '/pixel/{printf "%s ", $2} END{print ""}'
done

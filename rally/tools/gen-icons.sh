#!/usr/bin/env bash
# Generate the app icon set from one source mark.
#
# Everything is drawn here rather than hand-assembled, so a change to the mark
# reflows the whole set: launcher icon, Android adaptive layers, splash and
# favicon. Re-run after editing the geometry in tools/gen-icons.py.
#
# Usage: tools/gen-icons.sh   (needs the .venv from tools/make-art.py)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PY="$ROOT/.venv/bin/python"

if [ ! -x "$PY" ]; then
  echo "ERROR: $PY missing. Create it first:" >&2
  echo "  python3 -m venv .venv && .venv/bin/pip install numpy pillow" >&2
  exit 1
fi

mkdir -p "$ROOT/assets/images"
"$PY" "$ROOT/tools/gen-icons.py"
echo "done. icons in assets/images/"

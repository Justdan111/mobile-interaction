#!/usr/bin/env bash
# Download every source photograph listed in tools/photos.tsv.
#
# Re-runnable: an already-downloaded file is skipped, so adding one row and
# re-running fetches only the new photo.
#
# Usage: tools/fetch-photos.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/assets/img"
TSV="$ROOT/tools/photos.tsv"

mkdir -p "$OUT"

while IFS=$'\t' read -r slug url _page; do
  [ -z "${slug:-}" ] && continue
  case "$slug" in \#*) continue ;; esac

  dest="$OUT/$slug.jpg"
  if [ -f "$dest" ]; then
    echo "skip  $slug"
    continue
  fi

  echo "fetch $slug"
  curl -fsSL "$url" -o "$dest"

  # A 404 served as an HTML error page still exits 0 under some proxies, so
  # confirm we actually got a JPEG before letting it into the pipeline.
  if ! file "$dest" | grep -qi 'JPEG'; then
    echo "ERROR: $slug did not download as a JPEG" >&2
    rm -f "$dest"
    exit 1
  fi
done < "$TSV"

echo "done. $(ls -1 "$OUT"/*.jpg 2>/dev/null | wc -l | tr -d ' ') photos in assets/img/"

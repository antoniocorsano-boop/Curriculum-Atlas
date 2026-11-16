#!/usr/bin/env bash
# Offline-first, pinned archive. No trust in a cache hit or mirror identity alone.
set -euo pipefail
: "${RUNNER_TEMP:?}" "${GITHUB_ENV:?}"
version=4.2.23
digest=bea0eb3146be13eae6225409a117b215184f41b7f79e799f97cb3abb8f6dc404
bytes=350707672
file="blender-$version-linux-x64.tar.xz"
cache="$RUNNER_TEMP/atlas-blender-cache"
evidence="$RUNNER_TEMP/atlas-c3"
mkdir -p "$cache" "$evidence"
exec > >(tee "$evidence/bootstrap.log") 2>&1
archive="$cache/$file"
valid() {
  [[ -f "$1" && ! -L "$1" ]] &&
  [[ "$(stat -c %s "$1")" == "$bytes" ]] &&
  printf '%s  %s\n' "$digest" "$1" | sha256sum --strict --check
}
source=cache
if [[ -e "$archive" ]]; then
  valid "$archive" || { echo "INVALID CACHE: reject; rotate cache key after investigation"; exit 1; }
else
  source=
  # Official distribution and mirrors listed by Blender's infrastructure project.
  for base in https://download.blender.org/release/Blender4.2 https://mirror.clarkson.edu/blender/release/Blender4.2 https://mirror.dotsrc.org/blender/release/Blender4.2; do
    echo "Trying approved distribution source: $base"
    rm -f "$archive.part"
    if curl --fail --show-error --silent --location --retry 2 --retry-delay 3 --connect-timeout 15 --max-time 180 --proto '=https' --proto-redir '=https' --output "$archive.part" "$base/$file"; then
      if valid "$archive.part"; then
        mv "$archive.part" "$archive"
        source="$base"
        break
      else
        echo "Rejected archive: size or digest mismatch"
      fi
    fi
    rm -f "$archive.part"
  done
  [[ -n "$source" ]] || { echo "BLOCKED: all approved sources failed; no production"; exit 1; }
fi
valid "$archive"
printf '%s  %s\n' "$digest" "$file" > "$evidence/blender-distribution.sha256"
printf '%s\n' "$source" > "$evidence/blender-source.txt"
# Never cache an extracted executable; re-extract only verified bytes.
mkdir -p "$RUNNER_TEMP/atlas-blender"
tar -xJf "$archive" -C "$RUNNER_TEMP/atlas-blender"
bin="$RUNNER_TEMP/atlas-blender/blender-$version-linux-x64/blender"
test -x "$bin"
"$bin" --version | tee "$evidence/blender-version.log"
echo "BLENDER_BIN=$bin" >> "$GITHUB_ENV"
echo "BLENDER_VERSION=$version" >> "$GITHUB_ENV"

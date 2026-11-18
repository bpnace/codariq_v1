#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SOURCE_DIR=${1:-"$SCRIPT_DIR/../strato-original"}
STAGE_DIR="$SCRIPT_DIR/stage"
DEST_DIR="$STAGE_DIR/site"
TEMP_DIR="$STAGE_DIR/.site-staging.$$"

if [ ! -d "$SOURCE_DIR" ]; then
    printf 'Snapshot directory not found: %s\n' "$SOURCE_DIR" >&2
    exit 1
fi

SNAPSHOT_FILES='
index.html
impressum.html
datenschutz.html
style.css
game.js
contact.js
favicon.ico
favicon-16x16.png
favicon-32x32.png
android-chrome-192x192.png
android-chrome-512x512.png
apple-touch-icon.png
manifest.json
webhook-proxy.php
'

ASSET_FILES='
clarity-consent.js
clarity-consent.css
'

for file in $SNAPSHOT_FILES; do
    if [ ! -f "$SOURCE_DIR/$file" ]; then
        printf 'Required snapshot file is missing: %s\n' "$file" >&2
        exit 1
    fi
done

for file in $ASSET_FILES; do
    if [ ! -f "$SCRIPT_DIR/assets/$file" ]; then
        printf 'Required Clarity asset is missing: %s\n' "$SCRIPT_DIR/assets/$file" >&2
        exit 1
    fi
done
if [ ! -f "$SCRIPT_DIR/assets/apply-clarity-overlay.py" ]; then
    printf 'Required Clarity overlay script is missing.\n' >&2
    exit 1
fi

mkdir -p "$STAGE_DIR"
rm -rf "$TEMP_DIR"
mkdir "$TEMP_DIR"
trap 'rm -rf "$TEMP_DIR"' EXIT HUP INT TERM

for file in $SNAPSHOT_FILES; do
    cp "$SOURCE_DIR/$file" "$TEMP_DIR/$file"
done
for file in $ASSET_FILES; do
    cp "$SCRIPT_DIR/assets/$file" "$TEMP_DIR/$file"
done

python3 - "$TEMP_DIR/webhook-proxy.php" <<'PY'
from pathlib import Path
import sys

proxy = Path(sys.argv[1])
source = b"$configFile = __DIR__ . '/webhook-proxy.config.php';"
replacement = b"$configFile = '/var/www/private/webhook-proxy.config.php';"
contents = proxy.read_bytes()
if contents.count(source) != 1:
    raise SystemExit("Expected exactly one webhook configuration path in the copied proxy.")
proxy.write_bytes(contents.replace(source, replacement, 1))
PY

python3 "$SCRIPT_DIR/assets/apply-clarity-overlay.py" "$TEMP_DIR"

rm -rf "$DEST_DIR"
mv "$TEMP_DIR" "$DEST_DIR"
trap - EXIT HUP INT TERM
printf 'Staged %s public runtime files in %s\n' "$(printf '%s\n' "$SNAPSHOT_FILES $ASSET_FILES" | awk 'NF { count++ } END { print count }')" "$DEST_DIR"

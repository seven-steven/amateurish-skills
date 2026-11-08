#!/usr/bin/env bash
# Install the publish-to-wxmp skill into an agent skills directory.
# Usage: ./install.sh [target-skill-dir]
#   target defaults to ~/.agents/skills/publish-to-wxmp
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-$HOME/.agents/skills/publish-to-wxmp}"

mkdir -p "$(dirname "$TARGET")"
if [ -e "$TARGET" ] && [ ! -L "$TARGET" ]; then
  echo "refusing to overwrite existing directory: $TARGET" >&2
  exit 1
fi
ln -sfn "$REPO_ROOT/skill" "$TARGET"

# runtime state + config
mkdir -p "$REPO_ROOT/skill/.bin"
if [ ! -f "$REPO_ROOT/skill/.bin/config.json" ]; then
  cp "$REPO_ROOT/skill/config.example.json" "$REPO_ROOT/skill/.bin/config.json"
  echo "config: $REPO_ROOT/skill/.bin/config.json (fill api_base)"
fi

echo "installed: $TARGET -> $REPO_ROOT/skill"
echo "next: edit .bin/config.json (api_base), export WXMP_API_TOKEN, then: npx tsx $REPO_ROOT/skill/scripts/wxpush.mts doctor"

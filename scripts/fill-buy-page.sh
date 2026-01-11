#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

node scripts/seed-buy-content.mjs --write --force
node scripts/normalize-tools.mjs --write
npm run build

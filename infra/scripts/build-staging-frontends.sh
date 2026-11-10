#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
API_URL="${VITE_API_URL:-https://staging-api.nesthub.sionaglobal.com}"

echo "Building frontend with VITE_API_URL=$API_URL"
cd "$ROOT/frontend"
npm ci
VITE_API_URL="$API_URL" npm run build

echo "Building tenant-portal with VITE_API_URL=$API_URL"
cd "$ROOT/tenant-portal"
npm ci
VITE_API_URL="$API_URL" npm run build

echo "Done. Dist folders ready for Wrangler staging configs."

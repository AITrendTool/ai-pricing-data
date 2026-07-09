#!/usr/bin/env bash
# No key, no signup, no rate limit — the dataset IS the API.
# Served from jsDelivr's CDN (cached, fast); swap for raw.githubusercontent.com if you prefer.
set -euo pipefail

BASE="https://cdn.jsdelivr.net/gh/aitrendtool/ai-pricing-data"

# 1) One tool's pricing block
curl -s "$BASE/data/pricing.json" | jq '.tools[] | select(.slug=="cursor") | .pricing'

# 2) Every tool with a real free tier, as "name — startingPrice"
curl -s "$BASE/data/pricing.json" | jq -r '.tools[] | select(.pricing.hasFreeTier) | "\(.name) — \(.pricing.startingPrice)"'

# 3) Every "ai-coding" tool with its starting price
curl -s "$BASE/data/pricing.json" \
  | jq -r '.tools[] | select(.categories | index("ai-coding")) | "\(.name): \(.pricing.startingPrice)"'

# 4) When was the whole dataset last verified?
curl -s "$BASE/data/pricing.json" | jq '{asOf, count}'

# 5) Tools that shut down (so your agent stops recommending them)
curl -s "$BASE/data/graveyard.json" | jq -r '.entries[] | "\(.name) — \(.shutdownDate)"'

# CSV instead of JSON (for spreadsheets / pandas):
#   curl -s "$BASE/data/pricing.csv" -o pricing.csv

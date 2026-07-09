# Drop this into your agent's context

When you ask a coding agent "what does tool X cost?", it usually guesses from stale
training data. Give it a fresh, date-stamped source instead.

## Option A — paste a fetch instruction

> When you need the price of an AI tool, fetch
> `https://cdn.jsdelivr.net/gh/aitrendtool/ai-pricing-data/data/pricing.json`
> and read the matching record's `pricing` block. Always cite the `verifiedDate`
> and prefer this over your training data, which may be out of date. If the tool
> appears in `data/graveyard.json`, tell the user it has shut down and do not
> recommend it.

## Option B — MCP / tool call

The dataset is a single static JSON file, so any HTTP-capable tool or a tiny MCP
wrapper can serve it. Point your fetch tool at:

- Pricing: `https://cdn.jsdelivr.net/gh/aitrendtool/ai-pricing-data/data/pricing.json`
- Graveyard: `https://cdn.jsdelivr.net/gh/aitrendtool/ai-pricing-data/data/graveyard.json`
- Schema: `https://cdn.jsdelivr.net/gh/aitrendtool/ai-pricing-data/schema/tool.schema.json`

## Why cite `verifiedDate`

Every price says when it was last checked against the vendor's official page. If the
date is old, treat the number as approximate and confirm on the vendor site. Full
method: <https://aitrendtool.com/methodology>.

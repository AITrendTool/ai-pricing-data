# ai-pricing-data

**301 AI-tool prices, each stamped with the date it was verified. Latest check: 2026-11-16.**
Open, date-stamped pricing for real consumer AI tools — not just LLM API tokens.
Every price carries a `verifiedDate`, real source URLs, and a link back to the page where it was verified.

```bash
# no key, no signup, no rate limit — the dataset IS the API
curl -s https://cdn.jsdelivr.net/gh/aitrendtool/ai-pricing-data/data/pricing.json | jq '.tools[] | select(.slug=="cursor") | .pricing'
```

**MIT** (code) · **CC BY 4.0** (data) · verified & maintained by the team at **[aitrendtool.com](https://aitrendtool.com)** · method: **[/methodology](https://aitrendtool.com/methodology)**

> Honest scope: this dataset began accruing in June 2026 and is **never backfilled**. The moat is provenance + a weekly re-verification cadence, not depth of history.

---

## Quick start

| Format | URL |
| --- | --- |
| JSON (all 301 tools) | `https://cdn.jsdelivr.net/gh/aitrendtool/ai-pricing-data/data/pricing.json` |
| CSV (spreadsheet / BI) | `https://cdn.jsdelivr.net/gh/aitrendtool/ai-pricing-data/data/pricing.csv` |
| JSON Schema | `https://cdn.jsdelivr.net/gh/aitrendtool/ai-pricing-data/schema/tool.schema.json` |
| Graveyard (dead tools) | `https://cdn.jsdelivr.net/gh/aitrendtool/ai-pricing-data/data/graveyard.json` |
| This week's changes | `https://cdn.jsdelivr.net/gh/aitrendtool/ai-pricing-data/data/price-changes.json` |

Drop it into your agent's context — see [`examples/agent-context.md`](examples/agent-context.md).

## A sample (most recently verified)

| Tool | Model | Free tier | Starting price | Verified |
| --- | --- | :---: | --- | --- |
| [Adobe Firefly](https://aitrendtool.com/tools/adobe-firefly) | freemium | ✅ | $9.99/mo | 2026-11-16 |
| [Adobe Podcast](https://aitrendtool.com/tools/adobe-podcast) | freemium | ✅ | $0 | 2026-11-16 |
| [Augment Code](https://aitrendtool.com/tools/augment-code) | usage-based | — | $20/mo | 2026-11-16 |
| [Auto-Respond](https://aitrendtool.com/tools/auto-respond) | paid | — | $19/mo | 2026-11-16 |
| [Boomy](https://aitrendtool.com/tools/boomy) | freemium | ✅ | $9.99/mo | 2026-11-16 |
| [Braintrust](https://aitrendtool.com/tools/braintrust) | freemium | ✅ | $0 | 2026-11-16 |
| [Bria AI](https://aitrendtool.com/tools/bria-ai) | usage-based | ✅ | $0 | 2026-11-16 |
| [CapCut](https://aitrendtool.com/tools/capcut) | freemium | ✅ | $19.99/mo | 2026-11-16 |
| [Captions](https://aitrendtool.com/tools/captions) | freemium | ✅ | $9.99/mo (iOS app) | 2026-11-16 |
| [Coda](https://aitrendtool.com/tools/coda) | freemium | ✅ | $0 | 2026-11-16 |
| [Creatify](https://aitrendtool.com/tools/creatify) | freemium | ✅ | $15/mo | 2026-11-16 |
| [Crush](https://aitrendtool.com/tools/crush) | freemium | ✅ | $10/mo | 2026-11-16 |
| [Devin](https://aitrendtool.com/tools/devin) | freemium | ✅ | $20/mo | 2026-11-16 |
| [Dia](https://aitrendtool.com/tools/dia) | freemium | ✅ | $10/mo | 2026-11-16 |
| [Elicit](https://aitrendtool.com/tools/elicit) | freemium | ✅ | $49/mo | 2026-11-16 |

→ full table of 301 tools in [`data/pricing.json`](data/pricing.json). Every record links back to its verification page on aitrendtool.com.

## This week's price changes

- Abacus.AI: added ($10/mo)
- Activepieces: added ($0)
- Ada: added (Custom)
- Adobe Podcast: added ($0)
- Amazon Q Developer: added ($19/mo)
- Anyword: added ($49/mo)
- Apify: added ($29/mo)
- Arcade: added ($25/mo)
- Argil: added ($39/mo)
- Async: added ($14.99/mo)
- Auto-Respond: added ($19/mo)
- Base44: added ($16/mo)
- Baseten: added ($0)
- Beatoven.ai: added ($6/mo)
- Blackbox AI: added ($10/mo)
- Boomy: added ($9.99/mo)
- Botpress: added ($150/mo)
- Braintrust: added ($0)
- Bria AI: added ($0)
- Browserbase: added ($20/mo)

## Killed by AI — the graveyard

13 discontinued AI tools with shutdown dates + evidence links → [`data/graveyard.json`](data/graveyard.json)

Framed for agents: so your coding assistant stops recommending tools that shut down months ago. Each entry carries a real `shutdownDate` and an `evidenceUrl`.

## The data

Each tool record (see [`schema/tool.schema.json`](schema/tool.schema.json)):

```jsonc
{
  "slug": "cursor",
  "name": "Cursor",
  "website": "https://cursor.com",
  "categories": ["ai-coding"],
  "pricing": {
    "model": "freemium",           // free | freemium | paid | open-source | usage-based | contact
    "hasFreeTier": true,
    "startingPrice": "$20/mo",
    "tiers": [ { "name": "Pro", "price": "$20/mo", "period": "month", "highlights": ["..."] } ],
    "verifiedDate": "2026-11-16"   // ISO date this price was last checked against the official page
  },
  "platforms": ["desktop"],
  "hasAPI": false,
  "status": "active",
  "sources": ["https://cursor.com/pricing"],
  "aitrendtoolUrl": "https://aitrendtool.com/tools/cursor"
}
```

Editorial content (verdicts, pros/cons, use-cases, FAQ) is **not** in this dataset — it lives on [aitrendtool.com](https://aitrendtool.com). This repo is pricing **facts** only.

## How prices are verified

Each price is checked by hand against the tool's official pricing page and stamped with the date it was checked. Full method, cadence, and what `verifiedDate` means: **[aitrendtool.com/methodology](https://aitrendtool.com/methodology)**.

## Freshness guarantee (and how it's enforced)

The dates above are not a promise — they are checked. CI ([`.github/workflows/regenerate.yml`](.github/workflows/regenerate.yml)) runs `scripts/validate.mjs`, which **fails the build** while any published price is staler than the 45-day window. So the header can't silently become a lie.

## License & attribution

- **Code** (`scripts/`): [MIT](LICENSE).
- **Data** (`data/`, `schema/`): [CC BY 4.0](data/LICENSE). Attribution = a link to **https://aitrendtool.com/methodology**. Every record also carries its own `aitrendtoolUrl`, so credit survives forks, CSV exports, and copy-paste into an agent's context.

## About

Built and maintained by the **AITrendTool** team — an independent AI-tools directory with hand-verified pricing. This repository is the project's canonical open dataset. No pay-to-list, no fake stars, no fabricated reviews.

<sub>Auto-generated from the aitrendtool content collection — do not edit README.md or files under data/ by hand.</sub>

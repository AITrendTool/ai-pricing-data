# ai-pricing-data

**All 169 AI-tool prices verified as of 2026-07-08.**
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
| JSON (all 169 tools) | `https://cdn.jsdelivr.net/gh/aitrendtool/ai-pricing-data/data/pricing.json` |
| CSV (spreadsheet / BI) | `https://cdn.jsdelivr.net/gh/aitrendtool/ai-pricing-data/data/pricing.csv` |
| JSON Schema | `https://cdn.jsdelivr.net/gh/aitrendtool/ai-pricing-data/schema/tool.schema.json` |
| Graveyard (dead tools) | `https://cdn.jsdelivr.net/gh/aitrendtool/ai-pricing-data/data/graveyard.json` |
| This week's changes | `https://cdn.jsdelivr.net/gh/aitrendtool/ai-pricing-data/data/price-changes.json` |

Drop it into your agent's context — see [`examples/agent-context.md`](examples/agent-context.md).

## A sample (most recently verified)

| Tool | Model | Free tier | Starting price | Verified |
| --- | --- | :---: | --- | --- |
| [Beautiful.ai](https://aitrendtool.com/tools/beautiful-ai) | paid | — | $12/mo | 2026-07-08 |
| [Colossyan](https://aitrendtool.com/tools/colossyan) | freemium | ✅ | $59/mo | 2026-07-08 |
| [Dia](https://aitrendtool.com/tools/dia) | freemium | ✅ | $20/mo | 2026-07-08 |
| [Fin](https://aitrendtool.com/tools/fin) | usage-based | — | $0.99/outcome | 2026-07-08 |
| [Greptile](https://aitrendtool.com/tools/greptile) | freemium | ✅ | $30/mo | 2026-07-08 |
| [Originality.ai](https://aitrendtool.com/tools/originality-ai) | usage-based | — | $14.95/mo | 2026-07-08 |
| [ProWritingAid](https://aitrendtool.com/tools/prowritingaid) | freemium | ✅ | $30/mo | 2026-07-08 |
| [Remini](https://aitrendtool.com/tools/remini) | freemium | ✅ | $6.99/week | 2026-07-08 |
| [Replika](https://aitrendtool.com/tools/replika) | freemium | ✅ | $19.99/mo | 2026-07-08 |
| [Voicemod](https://aitrendtool.com/tools/voicemod) | freemium | ✅ | $0 | 2026-07-08 |
| [Clay](https://aitrendtool.com/tools/clay) | freemium | ✅ | $167/mo | 2026-07-06 |
| [DeepL](https://aitrendtool.com/tools/deepl) | freemium | ✅ | $8.74/mo | 2026-07-06 |
| [fal](https://aitrendtool.com/tools/fal) | usage-based | — | $0.02/megapixel | 2026-07-06 |
| [Filmora](https://aitrendtool.com/tools/filmora) | freemium | ✅ | $49.99/yr | 2026-07-06 |
| [GPTZero](https://aitrendtool.com/tools/gptzero) | freemium | ✅ | $8.33/mo | 2026-07-06 |

→ full table of 169 tools in [`data/pricing.json`](data/pricing.json). Every record links back to its verification page on aitrendtool.com.

## This week's price changes

_Baseline snapshot — the weekly price-change diff appears here after the next re-verification pass._

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
    "verifiedDate": "2026-07-08"   // ISO date this price was last checked against the official page
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

The "verified as of" date above is not a promise — it's enforced. CI ([`.github/workflows/regenerate.yml`](.github/workflows/regenerate.yml)) runs `scripts/validate.mjs`, which **fails the build** if any published price goes staler than the methodology window. So this header can't silently become a lie.

## License & attribution

- **Code** (`scripts/`): [MIT](LICENSE).
- **Data** (`data/`, `schema/`): [CC BY 4.0](data/LICENSE). Attribution = a link to **https://aitrendtool.com/methodology**. Every record also carries its own `aitrendtoolUrl`, so credit survives forks, CSV exports, and copy-paste into an agent's context.

## About

Built and maintained by the **AITrendTool** team — an independent AI-tools directory with hand-verified pricing. This repository is the project's canonical open dataset. No pay-to-list, no fake stars, no fabricated reviews.

<sub>Auto-generated from the aitrendtool content collection — do not edit README.md or files under data/ by hand.</sub>

#!/usr/bin/env node
// Regenerate README.md entirely from the committed dataset. Dependency-free, so it
// runs in the public repo's CI without installing anything. Never hand-edit README.md
// — edit this template instead.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data');
const read = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null);

const ds = read(join(DATA, 'pricing.json'));
if (!ds) { console.error('data/pricing.json missing — run `npm run export` first.'); process.exit(1); }
const changes = read(join(DATA, 'price-changes.json'));
const grave = read(join(DATA, 'graveyard.json'));

const RAW = 'https://cdn.jsdelivr.net/gh/aitrendtool/ai-pricing-data';
const md = (s) => String(s).replace(/\|/g, '\\|');

// A small sample table: the most-recently-verified tools (freshness on display).
const sample = [...ds.tools]
  .sort((a, b) => b.pricing.verifiedDate.localeCompare(a.pricing.verifiedDate) || a.name.localeCompare(b.name))
  .slice(0, 15);
const sampleTable = [
  '| Tool | Model | Free tier | Starting price | Verified |',
  '| --- | --- | :---: | --- | --- |',
  ...sample.map((t) =>
    `| [${md(t.name)}](${t.aitrendtoolUrl}) | ${t.pricing.model} | ${t.pricing.hasFreeTier ? '✅' : '—'} | ${md(t.pricing.startingPrice)} | ${t.pricing.verifiedDate} |`),
].join('\n');

let changesBlock;
if (!changes || changes.baseline) {
  changesBlock = '_Baseline snapshot — the weekly price-change diff appears here after the next re-verification pass._';
} else if (!changes.count) {
  changesBlock = `_No price changes since ${changes.since ?? 'the last snapshot'}._`;
} else {
  const label = (c) => {
    if (c.type === 'price') return `${md(c.name)}: \`${md(c.from)}\` → \`${md(c.to)}\``;
    if (c.type === 'model') return `${md(c.name)}: pricing model ${c.from} → ${c.to}`;
    if (c.type === 'free-tier') return `${md(c.name)}: free tier ${c.from ? 'added' : 'removed'}`;
    if (c.type === 'added') return `${md(c.name)}: added (${md(c.to)})`;
    if (c.type === 'removed') return `${md(c.name)}: removed`;
    return md(c.name);
  };
  changesBlock = changes.changes.slice(0, 20).map((c) => `- ${label(c)}`).join('\n');
}

const graveLine = grave
  ? `${grave.count} discontinued AI tools with shutdown dates + evidence links → [\`data/graveyard.json\`](data/graveyard.json)`
  : '';

const out = `# ai-pricing-data

**All ${ds.count} AI-tool prices verified as of ${ds.asOf}.**
Open, date-stamped pricing for real consumer AI tools — not just LLM API tokens.
Every price carries a \`verifiedDate\`, real source URLs, and a link back to the page where it was verified.

\`\`\`bash
# no key, no signup, no rate limit — the dataset IS the API
curl -s ${RAW}/data/pricing.json | jq '.tools[] | select(.slug=="cursor") | .pricing'
\`\`\`

**MIT** (code) · **CC BY 4.0** (data) · verified & maintained by the team at **[aitrendtool.com](https://aitrendtool.com)** · method: **[/methodology](https://aitrendtool.com/methodology)**

> Honest scope: this dataset began accruing in June 2026 and is **never backfilled**. The moat is provenance + a weekly re-verification cadence, not depth of history.

---

## Quick start

| Format | URL |
| --- | --- |
| JSON (all ${ds.count} tools) | \`${RAW}/data/pricing.json\` |
| CSV (spreadsheet / BI) | \`${RAW}/data/pricing.csv\` |
| JSON Schema | \`${RAW}/schema/tool.schema.json\` |
| Graveyard (dead tools) | \`${RAW}/data/graveyard.json\` |
| This week's changes | \`${RAW}/data/price-changes.json\` |

Drop it into your agent's context — see [\`examples/agent-context.md\`](examples/agent-context.md).

## A sample (most recently verified)

${sampleTable}

→ full table of ${ds.count} tools in [\`data/pricing.json\`](data/pricing.json). Every record links back to its verification page on aitrendtool.com.

## This week's price changes

${changesBlock}

## Killed by AI — the graveyard

${graveLine}

Framed for agents: so your coding assistant stops recommending tools that shut down months ago. Each entry carries a real \`shutdownDate\` and an \`evidenceUrl\`.

## The data

Each tool record (see [\`schema/tool.schema.json\`](schema/tool.schema.json)):

\`\`\`jsonc
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
    "verifiedDate": "${ds.asOf}"   // ISO date this price was last checked against the official page
  },
  "platforms": ["desktop"],
  "hasAPI": false,
  "status": "active",
  "sources": ["https://cursor.com/pricing"],
  "aitrendtoolUrl": "https://aitrendtool.com/tools/cursor"
}
\`\`\`

Editorial content (verdicts, pros/cons, use-cases, FAQ) is **not** in this dataset — it lives on [aitrendtool.com](https://aitrendtool.com). This repo is pricing **facts** only.

## How prices are verified

Each price is checked by hand against the tool's official pricing page and stamped with the date it was checked. Full method, cadence, and what \`verifiedDate\` means: **[aitrendtool.com/methodology](https://aitrendtool.com/methodology)**.

## Freshness guarantee (and how it's enforced)

The "verified as of" date above is not a promise — it's enforced. CI ([\`.github/workflows/regenerate.yml\`](.github/workflows/regenerate.yml)) runs \`scripts/validate.mjs\`, which **fails the build** if any published price goes staler than the methodology window. So this header can't silently become a lie.

## License & attribution

- **Code** (\`scripts/\`): [MIT](LICENSE).
- **Data** (\`data/\`, \`schema/\`): [CC BY 4.0](data/LICENSE). Attribution = a link to **https://aitrendtool.com/methodology**. Every record also carries its own \`aitrendtoolUrl\`, so credit survives forks, CSV exports, and copy-paste into an agent's context.

## About

Built and maintained by the **AITrendTool** team — an independent AI-tools directory with hand-verified pricing. This repository is the project's canonical open dataset. No pay-to-list, no fake stars, no fabricated reviews.

<sub>Auto-generated from the aitrendtool content collection — do not edit README.md or files under data/ by hand.</sub>
`;

writeFileSync(join(ROOT, 'README.md'), out);
console.log(`Rendered README.md (${ds.count} tools, asOf ${ds.asOf}).`);

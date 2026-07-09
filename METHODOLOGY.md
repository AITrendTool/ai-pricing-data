# Methodology

This dataset is a machine-readable export of the pricing data published on
**[aitrendtool.com](https://aitrendtool.com)**. The canonical, always-current
methodology lives at **<https://aitrendtool.com/methodology>** — this file is a
short mirror of the parts that matter for consuming the data.

## What "verified" means

Every tool carries a `pricing.verifiedDate` (ISO date). On that date, the tool's
starting price and tier structure were checked **by hand against the tool's own
official pricing page** (linked in `sources`). We record what the vendor published,
not an estimate.

## What's in scope

- **Only published tools.** A tool appears here only if it is live and indexed on
  aitrendtool.com (internally: `confidence >= 0.5` and `status` is `active` or
  `beta`). Drafts and low-confidence entries are excluded.
- **Pricing facts only.** `model`, `hasFreeTier`, `startingPrice`, `tiers`,
  `platforms`, `hasAPI`, `status`, `verifiedDate`, `sources`. Editorial content
  (verdicts, pros/cons, use-cases, FAQ) is **not** exported; it stays on the site.
- **Prices are facts.** A price is not copyrightable; the writing about it is, and
  that writing is deliberately kept on aitrendtool.com.

## Freshness & history

- The dataset began accruing in **June 2026** and is **never backfilled**. We do not
  invent historical prices we didn't verify at the time.
- `data/history/<date>.json` holds append-only snapshots, written only when a price
  actually changed. `data/price-changes.json` is the diff since the previous export.
- `scripts/validate.mjs` runs in CI and **fails the build** if any published price is
  staler than the freshness window, so the "verified as of" date can't quietly rot.

## The graveyard

`data/graveyard.json` lists AI tools that have shut down, with a real `shutdownDate`
and an `evidenceUrl`. Only completed shutdowns are included (announced-but-not-yet-dead
tools are held back until the shutdown date passes).

## Corrections

Found a wrong price? Open an issue, or see the public corrections log at
<https://aitrendtool.com/corrections>.

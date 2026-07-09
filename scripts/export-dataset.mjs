#!/usr/bin/env node
// Export the public AI-pricing dataset from the aitrendtool content collection.
//
// Reads each tool's markdown frontmatter, keeps only PUBLISHED tools (confidence
// >= 0.5 and status active/beta — i.e. exactly what is already indexed on the live
// site), and projects each to PRICING-FACT fields only. Editorial prose (verdict,
// pros/cons, use-cases, money-making ideas, FAQ) is intentionally NOT exported — it
// stays on aitrendtool.com. Prices are facts; the writing is the reason to visit.
//
// This is a one-way build artifact: the source of truth lives in the (private) site
// repo. Nothing here is hand-edited. Configure the source location with env vars:
//   SOURCE_DIR   tools markdown dir   (default ../aitrendtool/site/src/content/tools)
//   GRAVEYARD    graveyard.json path  (default ../aitrendtool/data/graveyard.json)
//
// Requires devDependencies (yaml, zod). Run from the repo root: `npm run export`.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { z } from 'zod';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = process.env.SOURCE_DIR || join(ROOT, '..', 'aitrendtool', 'site', 'src', 'content', 'tools');
const GRAVEYARD = process.env.GRAVEYARD || join(ROOT, '..', 'aitrendtool', 'data', 'graveyard.json');
const SITE = 'https://aitrendtool.com';
const ATTRIBUTION = 'AITrendTool.com — CC BY 4.0 — https://aitrendtool.com/methodology';

// ---- published record shape (a deliberate subset of the site's internal schema) ----
const tier = z.object({
  name: z.string(),
  price: z.string(),
  period: z.string().default('month'),
  highlights: z.array(z.string()).default([]),
});
const publishedTool = z.object({
  slug: z.string(),
  name: z.string(),
  tagline: z.string(),
  website: z.string().url(),
  categories: z.array(z.string()),
  pricing: z.object({
    model: z.enum(['free', 'freemium', 'paid', 'open-source', 'usage-based', 'contact']),
    hasFreeTier: z.boolean(),
    startingPrice: z.string(),
    tiers: z.array(tier).default([]),
    verifiedDate: z.string(),
  }),
  platforms: z.array(z.string()),
  hasAPI: z.boolean().default(false),
  status: z.string(),
  sources: z.array(z.string().url()),
  aitrendtoolUrl: z.string().url(),
});

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  return m ? YAML.parse(m[1]) : null;
}

// ---- read + filter + project ----
if (!existsSync(SOURCE_DIR)) {
  console.error(`Source dir not found: ${SOURCE_DIR}\nSet SOURCE_DIR to the tools markdown directory.`);
  process.exit(1);
}
const files = readdirSync(SOURCE_DIR).filter((f) => f.endsWith('.md'));
const tools = [];
const skipped = [];
for (const file of files) {
  const slug = basename(file, '.md');
  const d = frontmatter(readFileSync(join(SOURCE_DIR, file), 'utf8'));
  if (!d) { skipped.push([slug, 'no frontmatter']); continue; }
  const confidence = d.confidence ?? 0.8;
  const status = d.status ?? 'active';
  if (confidence < 0.5) { skipped.push([slug, `draft (confidence ${confidence})`]); continue; }
  if (status !== 'active' && status !== 'beta') { skipped.push([slug, `status ${status}`]); continue; }
  const rec = {
    slug,
    name: d.name,
    tagline: d.tagline,
    website: d.website,
    categories: d.categories ?? [],
    pricing: {
      model: d.pricing?.model,
      hasFreeTier: d.pricing?.hasFreeTier,
      startingPrice: d.pricing?.startingPrice,
      tiers: (d.pricing?.tiers ?? []).map((t) => ({
        name: t.name, price: t.price, period: t.period ?? 'month', highlights: t.highlights ?? [],
      })),
      verifiedDate: d.pricing?.verifiedDate,
    },
    platforms: d.platforms ?? [],
    hasAPI: d.hasAPI ?? false,
    status,
    sources: d.sources ?? [],
    aitrendtoolUrl: `${SITE}/tools/${slug}`,
  };
  const parsed = publishedTool.safeParse(rec);
  if (!parsed.success) {
    skipped.push([slug, 'schema: ' + parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')]);
    continue;
  }
  tools.push(parsed.data);
}
tools.sort((a, b) => a.name.localeCompare(b.name));

if (!tools.length) { console.error('No publishable tools found — aborting.'); process.exit(1); }

const asOf = tools.reduce((m, t) => (t.pricing.verifiedDate > m ? t.pricing.verifiedDate : m), '0000-00-00');
const generatedAt = new Date().toISOString();

// ---- ensure output dirs ----
const DATA = join(ROOT, 'data');
mkdirSync(join(DATA, 'history'), { recursive: true });
mkdirSync(join(ROOT, 'schema'), { recursive: true });

// ---- weekly price-changes diff vs the previously committed pricing.json ----
const pricingPath = join(DATA, 'pricing.json');
let prev = null;
if (existsSync(pricingPath)) {
  try { prev = JSON.parse(readFileSync(pricingPath, 'utf8')); } catch { /* treat as baseline */ }
}
const changes = [];
if (prev && Array.isArray(prev.tools)) {
  const prevBy = new Map(prev.tools.map((t) => [t.slug, t]));
  const newSlugs = new Set(tools.map((t) => t.slug));
  for (const t of tools) {
    const p = prevBy.get(t.slug);
    if (!p) { changes.push({ slug: t.slug, name: t.name, type: 'added', to: t.pricing.startingPrice }); continue; }
    if (p.pricing.startingPrice !== t.pricing.startingPrice)
      changes.push({ slug: t.slug, name: t.name, type: 'price', from: p.pricing.startingPrice, to: t.pricing.startingPrice });
    if (p.pricing.model !== t.pricing.model)
      changes.push({ slug: t.slug, name: t.name, type: 'model', from: p.pricing.model, to: t.pricing.model });
    if (p.pricing.hasFreeTier !== t.pricing.hasFreeTier)
      changes.push({ slug: t.slug, name: t.name, type: 'free-tier', from: p.pricing.hasFreeTier, to: t.pricing.hasFreeTier });
  }
  for (const p of prev.tools) if (!newSlugs.has(p.slug))
    changes.push({ slug: p.slug, name: p.name, type: 'removed', from: p.pricing.startingPrice });
}
const baseline = !prev;
writeFileSync(join(DATA, 'price-changes.json'), JSON.stringify({
  generatedAt, asOf, baseline, since: prev?.asOf ?? null, count: changes.length, changes,
}, null, 2) + '\n');

// ---- append-only history snapshot (only when something actually changed) ----
if (baseline || changes.length) {
  const snapshot = {
    asOf, generatedAt,
    prices: Object.fromEntries(tools.map((t) => [t.slug, t.pricing.startingPrice])),
  };
  writeFileSync(join(DATA, 'history', `${asOf}.json`), JSON.stringify(snapshot, null, 2) + '\n');
}

// ---- pricing.json ----
writeFileSync(pricingPath, JSON.stringify({
  name: 'ai-pricing-data',
  description: 'Hand-verified pricing for AI tools listed on aitrendtool.com. Every price carries a verifiedDate.',
  homepage: SITE,
  methodology: `${SITE}/methodology`,
  license: 'CC-BY-4.0',
  attribution: ATTRIBUTION,
  asOf,
  generatedAt,
  count: tools.length,
  tools,
}, null, 2) + '\n');

// ---- pricing.csv (flat, one row per tool; tiers stay in the JSON) ----
const csvEsc = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const cols = ['slug', 'name', 'model', 'hasFreeTier', 'startingPrice', 'platforms', 'hasAPI', 'status', 'category', 'verifiedDate', 'website', 'aitrendtoolUrl'];
const rows = [cols.join(',')];
for (const t of tools) rows.push([
  t.slug, t.name, t.pricing.model, t.pricing.hasFreeTier, t.pricing.startingPrice,
  t.platforms.join('|'), t.hasAPI, t.status, t.categories[0] ?? '', t.pricing.verifiedDate, t.website, t.aitrendtoolUrl,
].map(csvEsc).join(','));
writeFileSync(join(DATA, 'pricing.csv'), rows.join('\n') + '\n');

// ---- graveyard.json (facts subset; completed shutdowns only) ----
let graveCount = 0;
if (existsSync(GRAVEYARD)) {
  const g = JSON.parse(readFileSync(GRAVEYARD, 'utf8'));
  const completed = (g.entries ?? [])
    .filter((e) => e.shutdownDate <= g.lastUpdated)
    .sort((a, b) => b.shutdownDate.localeCompare(a.shutdownDate))
    .map((e) => ({
      slug: e.slug, name: e.name, category: e.category, whatItDid: e.whatItDid,
      shutdownDate: e.shutdownDate, evidenceUrl: e.evidenceUrl, evidenceSource: e.evidenceSource, verifiedDate: e.verifiedDate,
    }));
  graveCount = completed.length;
  writeFileSync(join(DATA, 'graveyard.json'), JSON.stringify({
    name: 'ai-graveyard',
    description: 'Discontinued AI tools, with shutdown dates and evidence links — so agents stop recommending tools that no longer exist.',
    homepage: `${SITE}/stats/ai-graveyard`,
    license: 'CC-BY-4.0',
    attribution: ATTRIBUTION,
    lastUpdated: g.lastUpdated,
    count: completed.length,
    entries: completed,
  }, null, 2) + '\n');
}

// ---- schema/tool.schema.json (generated from the published Zod schema) ----
const jsonSchema = z.toJSONSchema(publishedTool);
jsonSchema.$id = 'https://raw.githubusercontent.com/aitrendtool/ai-pricing-data/main/schema/tool.schema.json';
jsonSchema.title = 'AITrendTool verified AI-tool pricing record';
writeFileSync(join(ROOT, 'schema', 'tool.schema.json'), JSON.stringify(jsonSchema, null, 2) + '\n');

console.log(`Exported ${tools.length} tools (asOf ${asOf}) + ${graveCount} graveyard entries; skipped ${skipped.length}.`);
console.log(`Changes vs previous: ${baseline ? 'baseline (first export)' : changes.length}.`);
if (skipped.length) console.log('Skipped: ' + skipped.map((s) => s.join(' — ')).join(', '));

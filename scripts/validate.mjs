#!/usr/bin/env node
// Dependency-free CI gate. Fails (exit 1) if the dataset is malformed OR if any
// published price is staler than the freshness window — this is what keeps the
// README's "verified as of <date>" claim from silently becoming a lie.
//
//   FRESHNESS_DAYS   max age of any verifiedDate before CI fails (default 45)

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FRESHNESS_DAYS = Number(process.env.FRESHNESS_DAYS || 45);
const p = join(ROOT, 'data', 'pricing.json');

if (!existsSync(p)) { console.error('FAIL: data/pricing.json missing.'); process.exit(1); }
const ds = JSON.parse(readFileSync(p, 'utf8'));
const errors = [];

if (!Array.isArray(ds.tools) || ds.tools.length === 0) errors.push('no tools in dataset');
if (ds.count !== ds.tools?.length) errors.push(`count (${ds.count}) != tools.length (${ds.tools?.length})`);

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const cutoff = new Date(Date.now() - FRESHNESS_DAYS * 86400_000);
const seen = new Set();
let stale = 0;

for (const t of ds.tools ?? []) {
  const where = t.slug || t.name || '(unknown)';
  if (!t.slug) errors.push(`${where}: missing slug`);
  if (seen.has(t.slug)) errors.push(`${where}: duplicate slug`);
  seen.add(t.slug);
  for (const f of ['name', 'website']) if (!t[f]) errors.push(`${where}: missing ${f}`);
  const v = t.pricing?.verifiedDate;
  if (!v || !isoDate.test(v)) { errors.push(`${where}: missing/invalid verifiedDate`); continue; }
  if (!t.pricing.startingPrice) errors.push(`${where}: missing startingPrice`);
  if (new Date(v) < cutoff) stale++;
}

if (stale > 0) errors.push(`${stale} tool(s) staler than ${FRESHNESS_DAYS} days — re-run the verification pass and re-export.`);

if (errors.length) {
  console.error(`FAIL (${errors.length}):\n` + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log(`OK: ${ds.tools.length} tools, all verified within ${FRESHNESS_DAYS} days (asOf ${ds.asOf}).`);

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const TOOLS_DIR = path.join(ROOT, 'src', 'content', 'tools');

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return { write: args.has('--write'), dryRun: args.has('--dry-run') || !args.has('--write') };
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function toYamlScalar(value) {
  if (value === undefined) return undefined;
  if (value === null) return 'null';
  if (value instanceof Date) return JSON.stringify(value.toISOString().slice(0, 10));
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (typeof value !== 'string') return JSON.stringify(value);
  if (value === '') return "''";
  if (/^\d{4}-\d{2}(-\d{2})?$/.test(value)) return JSON.stringify(value);
  const safePlain = /^[a-zA-Z0-9_./-]+$/.test(value);
  return safePlain ? value : JSON.stringify(value);
}

function renderYamlKeyValue(key, value, indent) {
  const pad = '  '.repeat(indent);
  if (value === undefined) return [];

  if (value instanceof Date) {
    return [`${pad}${key}: ${toYamlScalar(value)}`];
  }

  if (Array.isArray(value)) {
    const filtered = value.filter((item) => item !== undefined);
    if (filtered.length === 0) return [`${pad}${key}: []`];
    const lines = [`${pad}${key}:`];
    for (const item of filtered) {
      if (item instanceof Date) {
        lines.push(`${pad}  - ${toYamlScalar(item)}`);
        continue;
      }
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const entries = Object.entries(item).filter(([, v]) => v !== undefined);
        if (entries.length === 0) {
          lines.push(`${pad}  - {}`);
          continue;
        }
        lines.push(`${pad}  -`);
        for (const [childKey, childValue] of entries) {
          lines.push(...renderYamlKeyValue(childKey, childValue, indent + 2));
        }
        continue;
      }
      const scalar = toYamlScalar(item);
      if (scalar === undefined) continue;
      lines.push(`${pad}  - ${scalar}`);
    }
    return lines;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return [`${pad}${key}: {}`];
    const lines = [`${pad}${key}:`];
    for (const [childKey, childValue] of entries) {
      lines.push(...renderYamlKeyValue(childKey, childValue, indent + 1));
    }
    return lines;
  }

  return [`${pad}${key}: ${toYamlScalar(value)}`];
}

function renderFrontmatterOrdered(data) {
  const order = [
    'slug',
    'title',
    'description',
    'logo',
    'website',
    'productType',
    'category',
    'targetUsers',
    'notFor',
    'capabilities',
    'useCases',
    'pros',
    'cons',
    'onboardingTime',
    'dependencies',
    'externalSystems',
    'externalSystemIntegrations',
    'mcpServers',
    'mcpServerExamples',
    'pricing',
    'purchase',
    'privacy',
    'relatedTools',
    'relatedTutorials',
    'relatedCompares',
    'updatedAt',
    'version',
    'featured',
    'affiliateLink',
    'affiliateDisclosure',
    'seoTitle',
    'seoDescription',
    'keywords',
  ];

  const lines = ['---'];
  for (const key of order) {
    if (!(key in data)) continue;
    lines.push(...renderYamlKeyValue(key, data[key], 0));
  }
  for (const [key, value] of Object.entries(data)) {
    if (order.includes(key)) continue;
    lines.push(...renderYamlKeyValue(key, value, 0));
  }
  lines.push('---');
  return lines.join('\n');
}

function normalizeToolFrontmatter(data) {
  const website = isNonEmptyString(data.website) ? data.website.trim() : undefined;
  const updatedAt = isNonEmptyString(data.updatedAt) ? data.updatedAt : undefined;
  const title = isNonEmptyString(data.title) ? data.title.trim() : undefined;

  const purchase = (data.purchase && typeof data.purchase === 'object') ? { ...data.purchase } : {};
  if (!isNonEmptyString(purchase.officialUrl) && website) purchase.officialUrl = website;
  if (!isNonEmptyString(purchase.updatedAt) && updatedAt) purchase.updatedAt = updatedAt;
  if (!Array.isArray(purchase.sources) || purchase.sources.length === 0) {
    if (isNonEmptyString(purchase.officialUrl)) {
      const label = title ? `${title} 官方入口/定价页` : '官方入口/定价页';
      purchase.sources = [{ label, url: purchase.officialUrl }];
    }
  }

  const privacy = (data.privacy && typeof data.privacy === 'object') ? { ...data.privacy } : undefined;
  if (privacy && !isNonEmptyString(privacy.updatedAt) && updatedAt) privacy.updatedAt = updatedAt;

  return { ...data, purchase, ...(privacy ? { privacy } : {}) };
}

function main() {
  const { write, dryRun } = parseArgs(process.argv);
  if (!fs.existsSync(TOOLS_DIR)) {
    console.error(`tools dir not found: ${TOOLS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(TOOLS_DIR).filter((f) => f.endsWith('.mdx'));
  let updated = 0;
  let unchanged = 0;

  for (const file of files) {
    const filePath = path.join(TOOLS_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(raw);
    const nextData = normalizeToolFrontmatter(parsed.data ?? {});

    const nextFrontmatter = renderFrontmatterOrdered(nextData);
    const nextRaw = `${nextFrontmatter}\n\n${(parsed.content ?? '').replace(/^\\s+/, '')}`;

    if (nextRaw === raw) {
      unchanged += 1;
      continue;
    }
    updated += 1;
    if (!dryRun) fs.writeFileSync(filePath, nextRaw, 'utf8');
  }

  console.log(JSON.stringify({ ok: true, write, dryRun, total: files.length, updated, unchanged }, null, 2));
}

main();

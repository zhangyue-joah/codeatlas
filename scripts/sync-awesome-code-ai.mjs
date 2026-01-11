import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const SEED_PATH = path.join(ROOT, 'scripts', 'tools.seed.json');
const TOOLS_DIR = path.join(ROOT, 'src', 'content', 'tools');
const SOURCE_REPO = 'sourcegraph/awesome-code-ai';
const SOURCE_URL = `https://github.com/${SOURCE_REPO}`;

function normalizeName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizeForCompare(value) {
  const norm = normalizeName(value);
  if (!norm) return '';
  const vendors = new Set(['google', 'github', 'amazon', 'sourcegraph', 'gitlab', 'jetbrains', 'openai', 'anthropic']);
  const parts = norm.split(' ');
  if (parts.length >= 2 && vendors.has(parts[0])) return parts.slice(1).join(' ');
  return norm;
}

function canonicalizeCandidate(candidate) {
  // Treat sub-surface entries as the same product to avoid duplicating pages.
  // Example: "Amazon Q Developer CLI" or "Amazon Q Developer (/review)" → "Amazon Q Developer"
  if (/^amazon q developer\b/i.test(candidate.name)) {
    return { ...candidate, name: 'Amazon Q Developer' };
  }
  return candidate;
}

function isStrictAiCodingProduct(candidate) {
  const text = `${candidate.section || ''} ${candidate.name || ''} ${candidate.desc || ''}`.toLowerCase();

  // Obvious non-coding or service-like entries
  const denyPhrases = [
    'us census',
    'census data',
    'census',
    'social media',
    'prompt',
    'tech experts',
    'customer support',
    'support and workflows',
  ];
  if (denyPhrases.some((phrase) => text.includes(phrase))) return false;

  // Must indicate developer/SDLC relevance
  const allowKeywords = [
    'code',
    'coding',
    'repo',
    'repository',
    'pull request',
    'pr',
    'review',
    'debug',
    'bug',
    'developer',
    'ide',
    'editor',
    'vscode',
    'vs code',
    'git',
    'github',
    'ci',
    'test',
    'refactor',
  ];
  return allowKeywords.some((keyword) => text.includes(keyword));
}

function slugify(value) {
  const norm = normalizeName(value);
  return norm
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function safeJsonParse(jsonText) {
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    throw new Error(`JSON 解析失败：${error instanceof Error ? error.message : String(error)}`);
  }
}

function readSeed() {
  const raw = fs.readFileSync(SEED_PATH, 'utf8');
  const data = safeJsonParse(raw);
  if (!Array.isArray(data)) throw new Error('scripts/tools.seed.json 必须为数组');
  return data;
}

function writeSeed(next) {
  fs.writeFileSync(SEED_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
}

function timeoutSignal(ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, cancel: () => clearTimeout(timer) };
}

async function fetchRawReadme() {
  const { signal, cancel } = timeoutSignal(20_000);
  try {
    const res = await fetch(`https://api.github.com/repos/${SOURCE_REPO}/readme`, {
      headers: { Accept: 'application/vnd.github.raw' },
      signal,
    });
    if (!res.ok) throw new Error(`GitHub readme 拉取失败：${res.status} ${res.statusText}`);
    return await res.text();
  } finally {
    cancel();
  }
}

function parseAwesomeMarkdown(markdown) {
  const lines = markdown.split('\n');
  let currentSection = null;
  const items = [];

  for (const line of lines) {
    const sectionMatch = line.match(/^##\s+(.+?)\s*$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      continue;
    }

    const match = line.match(/^\s*-\s+\[([^\]]+)\]\(([^)]+)\)\s*(?:-\s*(.+))?\s*$/);
    if (!match) continue;

    const name = match[1].trim();
    const url = match[2].trim();
    const desc = (match[3] || '').trim();
    items.push({ section: currentSection, name, url, desc });
  }

  return items;
}

function sectionToDefaults(section) {
  // 只把能映射到站点现有枚举体系的条目纳入自动同步
  if (section === 'Code completion tools') {
    return {
      productType: ['ide-extension'],
      category: ['code-completion'],
      capabilities: ['repo-context', 'skills-plugins', 'read-only'],
    };
  }
  if (section === 'Code assistants and search') {
    return {
      productType: ['web-app'],
      category: ['repo-chat'],
      capabilities: ['repo-context', 'read-only'],
    };
  }
  if (section === 'Code review') {
    return {
      productType: ['web-app'],
      category: ['code-review'],
      capabilities: ['repo-context', 'external-system', 'read-only'],
    };
  }
  if (section === 'ChatGPT in your editor') {
    return {
      productType: ['ide-extension'],
      category: ['repo-chat'],
      capabilities: ['read-only'],
    };
  }
  // 其它分组（如模型、refactoring、自然语言编译器等）不自动导入，避免产品边界过宽
  return null;
}

function existingIndex(seed) {
  const bySlug = new Map();
  const byWebsite = new Map();
  const byNormName = new Map();

  for (const item of seed) {
    if (item?.slug) bySlug.set(item.slug, item);
    if (item?.website) byWebsite.set(String(item.website), item);
    if (item?.title) byNormName.set(normalizeName(item.title), item);
    if (Array.isArray(item?.keywords)) {
      for (const kw of item.keywords) {
        const norm = normalizeName(kw);
        if (norm) byNormName.set(norm, item);
      }
    }
  }

  return { bySlug, byWebsite, byNormName };
}

function extendIndexFromContent(index) {
  if (!fs.existsSync(TOOLS_DIR)) return index;
  const files = fs.readdirSync(TOOLS_DIR).filter((file) => file.endsWith('.mdx'));
  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '');
    index.bySlug.set(slug, { slug, source: 'content' });

    const filePath = path.join(TOOLS_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(raw);
    if (data?.title) index.byNormName.set(normalizeName(data.title), { slug, source: 'content' });
    if (Array.isArray(data?.keywords)) {
      for (const kw of data.keywords) {
        const norm = normalizeName(kw);
        if (norm) index.byNormName.set(norm, { slug, source: 'content' });
      }
    }
    if (data?.website) index.byWebsite.set(String(data.website), { slug, source: 'content' });
  }
  return index;
}

function shouldSkipCandidate(candidate, index) {
  const norm = normalizeName(candidate.name);
  const normAlt = normalizeForCompare(candidate.name);
  if (!norm) return true;
  if (index.byWebsite.has(candidate.url)) return true;
  if (index.byNormName.has(norm) || (normAlt && index.byNormName.has(normAlt))) return true;

  // 非“产品级”或极其局部的插件/脚本，默认跳过（仍可手动加到 seed）
  const skipNameFragments = [
    'obsidian',
    'nvim',
    'neovim',
    'emacs',
    'org mode',
    'bash',
    'autocomplete sh',
  ];
  if (skipNameFragments.some((frag) => norm.includes(frag))) return true;

  return false;
}

function toSeedEntry(candidate, defaults) {
  const title = candidate.name;
  const slug = slugify(title);
  if (!slug) return null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;

  const description = candidate.desc || '来自 GitHub curated list 的 AI 编程相关工具（建议后续补齐官方定价/隐私等信息）。';

  return {
    slug,
    title,
    website: candidate.url,
    description,
    productType: defaults.productType,
    category: defaults.category,
    capabilities: defaults.capabilities,
    keywords: [title, 'AI 编程'],
  };
}

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return { apply: args.has('--apply'), strict: args.has('--strict') };
}

async function main() {
  const { apply, strict } = parseArgs(process.argv);
  const seed = readSeed();
  const index = extendIndexFromContent(existingIndex(seed));

  const markdown = await fetchRawReadme();
  const candidates = parseAwesomeMarkdown(markdown);

  const accepted = [];
  const ignored = [];

  for (const rawCandidate of candidates) {
    const candidate = canonicalizeCandidate(rawCandidate);
    const defaults = sectionToDefaults(candidate.section);
    if (!defaults) {
      ignored.push({ ...candidate, reason: 'section_not_supported' });
      continue;
    }
    if (strict && !isStrictAiCodingProduct(candidate)) {
      ignored.push({ ...candidate, reason: 'not_ai_coding_product' });
      continue;
    }
    if (shouldSkipCandidate(candidate, index)) {
      ignored.push({ ...candidate, reason: 'duplicate_or_not_product' });
      continue;
    }

    const entry = toSeedEntry(candidate, defaults);
    if (!entry) {
      ignored.push({ ...candidate, reason: 'slugify_failed' });
      continue;
    }
    if (index.bySlug.has(entry.slug)) {
      ignored.push({ ...candidate, reason: 'slug_exists' });
      continue;
    }

    accepted.push(entry);
    index.bySlug.set(entry.slug, entry);
    index.byWebsite.set(entry.website, entry);
    index.byNormName.set(normalizeName(entry.title), entry);
  }

  if (apply && accepted.length > 0) {
    const next = [...seed, ...accepted];
    writeSeed(next);
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        ok: true,
        source: SOURCE_URL,
        apply,
        strict,
        seedCount: seed.length,
        accepted: accepted.length,
        acceptedSlugs: accepted.map((x) => x.slug),
        ignored: ignored.length,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});

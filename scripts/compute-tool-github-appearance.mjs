import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const TOOLS_DIR = path.join(ROOT, 'src', 'content', 'tools');
const OUT_PATH = path.join(ROOT, 'src', 'config', 'toolPopularity.ts');
const CACHE_PATH = path.join(ROOT, 'scripts', '.github-search-cache.json');

const GITHUB_SEARCH_URL = 'https://github.com/search';
const REQUEST_TIMEOUT_MS = 45_000;
const REQUEST_DELAY_MS = 3_000;
const MAX_RETRIES = 5;

const args = process.argv.slice(2);
const SHOULD_REFRESH = args.includes('--refresh');
const ONLY_SLUGS = (() => {
  const idx = args.findIndex((item) => item === '--only');
  if (idx === -1) return null;
  const raw = String(args[idx + 1] || '').trim();
  if (!raw) return null;
  const slugs = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return slugs.length > 0 ? new Set(slugs) : null;
})();
const MAX_ITEMS = (() => {
  const idx = args.findIndex((item) => item === '--max');
  if (idx === -1) return null;
  const value = Number(args[idx + 1]);
  return Number.isFinite(value) && value > 0 ? value : null;
})();

const EXTRA_SEARCH_QUERIES = {
  aider: ['aider.chat'],
  cursor: ['cursor.com'],
  qodo: ['codiumai'],
  continue: ['continue.dev'],
  cosine: ['cosine.sh'],
  lovable: ['lovable.dev'],
  trae: ['trae.ai'],
  bito: ['bito.ai'],
  kiro: ['kiro.dev'],
  'atlassian-rovo': ['rovo dev'],
  magic: ['magic.dev'],
  'github-copilot': ['github copilot'],
  'github-copilot-cli': ['copilot cli'],
  'amazon-q-developer': ['amazon q developer', 'codewhisperer'],
  'openai-codex': ['openai codex', 'codex cli'],
  'claude-code': ['claude code'],
  'gemini-code-assist': ['gemini code assist'],
  devin: ['cognition devin', 'devin ai'],
  sweep: ['sweep ai github'],
  pieces: ['pieces.app'],
  warp: ['warp.dev'],
  'zed-ai': ['zed.dev ai'],
  'tongyi-lingma': ['通义灵码', 'lingma.aliyun.com'],
  'baidu-comate': ['百度 comate', 'comate.baidu.com'],
};

function normalizeHost(raw) {
  try {
    const url = new URL(raw);
    return url.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

function normalizeUrlForQuery(raw) {
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = url.pathname && url.pathname !== '/' ? url.pathname.replace(/\/+$/, '') : '';
    return `${host}${pathname}`;
  } catch {
    return '';
  }
}

function normalizeText(raw) {
  return String(raw || '').toLowerCase().trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readCache() {
  try {
    const raw = fs.readFileSync(CACHE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { countsByQuery: {} };
    const countsByQuery = parsed.countsByQuery && typeof parsed.countsByQuery === 'object' ? parsed.countsByQuery : {};
    return { countsByQuery };
  } catch {
    return { countsByQuery: {} };
  }
}

function writeCache(cache) {
  fs.writeFileSync(
    CACHE_PATH,
    JSON.stringify(
      {
        ...cache,
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );
}

async function fetchGitHubRepoSearchCount(query) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
    try {
      const url = new URL(GITHUB_SEARCH_URL);
      url.searchParams.set('q', query);
      url.searchParams.set('type', 'repositories');

      const res = await fetch(url, {
        headers: { 'user-agent': 'codeatlas-bot' },
        signal: ctrl.signal,
      });

      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('retry-after'));
        const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 30_000 * attempt;
        console.warn(`GitHub search rate-limited (429). Waiting ${Math.round(waitMs / 1000)}s then retrying: ${query}`);
        await sleep(waitMs);
        continue;
      }

      if (!res.ok) {
        throw new Error(`GitHub search failed (${res.status}): ${query}`);
      }

      const text = await res.text();
      const match = text.match(/"result_count":(\d+)/);
      if (!match) return 0;
      return Number(match[1]);
    } catch (err) {
      if (err && typeof err === 'object' && err.name === 'AbortError') {
        const waitMs = 5_000 * attempt;
        console.warn(`GitHub search timed out. Waiting ${Math.round(waitMs / 1000)}s then retrying: ${query}`);
        await sleep(waitMs);
        continue;
      }
      const causeCode =
        err && typeof err === 'object'
          ? (err.cause && typeof err.cause === 'object' ? err.cause.code : err.code)
          : undefined;
      const transientCodes = new Set(['UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_SOCKET', 'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN']);
      if (typeof causeCode === 'string' && transientCodes.has(causeCode)) {
        const waitMs = 5_000 * attempt;
        console.warn(`GitHub search network error (${causeCode}). Waiting ${Math.round(waitMs / 1000)}s then retrying: ${query}`);
        await sleep(waitMs);
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error(`GitHub search exceeded retry limit: ${query}`);
}

function pickToolSearchQuery({ slug, data }, hostCounts) {
  const extra = EXTRA_SEARCH_QUERIES[slug];
  if (Array.isArray(extra) && extra.length > 0) return String(extra[0]);

  const website = String(data.website || '');
  const host = normalizeHost(website);

  const hostCount = host && hostCounts ? (hostCounts.get(host) ?? 0) : 0;

  const titleCandidate = String(data.titleEn || data.title || '').trim();
  const title = titleCandidate && titleCandidate.length >= 3 ? titleCandidate : '';

  // For shared vendor domains (e.g. jetbrains.com, replit.com), prefer the product name for better specificity.
  if (host && host !== 'github.com' && hostCount > 1) {
    if (title) return title;
    const officialUrlRaw = String((data.purchase && data.purchase.officialUrl) || '');
    const officialQuery = officialUrlRaw ? normalizeUrlForQuery(officialUrlRaw) : '';
    if (officialQuery) return officialQuery;
  }

  // Prefer a unique website domain to avoid ambiguous names (e.g. "aider" == "help" in French).
  if (host && host !== 'github.com' && hostCount <= 1) return host;

  if (title) return title;
  if (host && host !== 'github.com') return host;

  return slug;
}

function readAllTools() {
  const files = fs.readdirSync(TOOLS_DIR).filter((f) => f.endsWith('.mdx')).sort();
  return files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, '');
    const { data } = matter(fs.readFileSync(path.join(TOOLS_DIR, filename), 'utf8'));
    return { slug, data };
  });
}

function renderOutput(mapping, meta) {
  return `// Generated by scripts/compute-tool-github-appearance.mjs
// Source: GitHub repository search (result_count)
// Generated at: ${meta.generatedAt}

export const TOOL_GITHUB_APPEARANCE_SCORE: Record<string, number> = ${JSON.stringify(mapping, null, 2)};

export function getToolGithubAppearanceScore(slug: string): number {
  return TOOL_GITHUB_APPEARANCE_SCORE[slug] ?? 0;
}
`;
}

async function main() {
  const toolsAll = readAllTools();
  const tools = typeof MAX_ITEMS === 'number' ? toolsAll.slice(0, MAX_ITEMS) : toolsAll;
  const hostCounts = new Map();
  for (const tool of toolsAll) {
    const host = normalizeHost(String(tool.data.website || ''));
    if (!host || host === 'github.com') continue;
    hostCounts.set(host, (hostCounts.get(host) ?? 0) + 1);
  }
  const cache = readCache();
  cache.countsByQuery ??= {};
  const scoreBySlug = {};
  const failedQueries = [];
  for (const tool of tools) {
    const query = pickToolSearchQuery(tool, hostCounts);
    const shouldRefresh = SHOULD_REFRESH && (!ONLY_SLUGS || ONLY_SLUGS.has(tool.slug));
    let didRequest = false;
    if (!shouldRefresh && typeof cache.countsByQuery[query] === 'number') {
      scoreBySlug[tool.slug] = cache.countsByQuery[query];
    } else {
      try {
        didRequest = true;
        const count = await fetchGitHubRepoSearchCount(query);
        cache.countsByQuery[query] = count;
        scoreBySlug[tool.slug] = count;
        writeCache(cache);
      } catch (err) {
        const cached = cache.countsByQuery[query];
        if (typeof cached === 'number') {
          console.warn(`GitHub search failed; falling back to cache for query: ${query}`);
          scoreBySlug[tool.slug] = cached;
        } else {
          console.warn(`GitHub search failed; no cache available. Using 0 for query: ${query}`);
          scoreBySlug[tool.slug] = 0;
        }
        failedQueries.push({ slug: tool.slug, query, error: String(err && err.message ? err.message : err) });
      }
    }
    if (didRequest) await sleep(REQUEST_DELAY_MS);
  }

  const sorted = Object.entries(scoreBySlug).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const mapping = Object.fromEntries(sorted);

  fs.writeFileSync(
    OUT_PATH,
    renderOutput(mapping, {
      generatedAt: new Date().toISOString(),
    })
  );

  const top = sorted.slice(0, 20);
  console.log('Top 20 by GitHub appearance score:');
  for (const [slug, score] of top) console.log(`${String(score).padStart(2, ' ')}  ${slug}`);

  if (failedQueries.length > 0) {
    console.warn(`\nWarning: ${failedQueries.length} queries failed (used cache/0).`);
    for (const item of failedQueries.slice(0, 20)) {
      console.warn(`- ${item.slug}: ${item.query}`);
    }
    if (failedQueries.length > 20) console.warn(`...and ${failedQueries.length - 20} more`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

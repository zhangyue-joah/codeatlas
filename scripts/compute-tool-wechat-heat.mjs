import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const TOOLS_DIR = path.join(ROOT, 'src', 'content', 'tools');
const OUT_PATH = path.join(ROOT, 'src', 'config', 'toolWeChatHeat.ts');
const REPORT_PATH = path.join(ROOT, 'docs', 'wechat-heat-report.md');
const CACHE_PATH = path.join(ROOT, 'scripts', '.wechat-search-cache.json');

const WEIXIN_SOGOU_SEARCH_URL = 'https://weixin.sogou.com/weixin';
const REQUEST_TIMEOUT_MS = 35_000;
const REQUEST_DELAY_MS = 1_200;
const MAX_RETRIES = 5;
const HEAT_PRECISION_EXPONENT = 2;

const args = process.argv.slice(2);
const SHOULD_REFRESH = args.includes('--refresh');
const SHOULD_WRITE_REPORT = !args.includes('--no-report');
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
  continue: ['continue.dev AI 编程', 'continue.dev VSCode', 'continuedev AI 编程'],
  codium: ['PR-Agent AI 编程', 'Qodo AI 编程'],
  'codium-pr-agent': ['PR-Agent AI 编程', 'Qodo AI 编程'],
  'sourcegraph-cody': ['Sourcegraph Cody AI 编程', 'Cody Sourcegraph AI 编程'],
  'sourcegraph-amp': ['Sourcegraph Amp AI 编程', 'Amp Sourcegraph AI 编程'],
  // "CodeGPT" is easily tokenized into "code" + "gpt" and causes massive false positives on Sogou,
  // so we use quoted query to better approximate product mentions.
  codegpt: ['"CodeGPT"', '"CodeGPT" VSCode', '"CodeGPT" 插件'],
  'github-copilot': ['GitHub Copilot AI 编程'],
  'github-copilot-cli': ['GitHub Copilot CLI AI 编程'],
  'openai-codex': ['OpenAI Codex AI 编程', 'Codex CLI AI 编程'],
  'atlassian-rovo': ['Rovo Dev AI 编程', 'Atlassian Rovo AI 编程'],
  magic: ['Magic.dev AI 编程', 'Magic AI 编程'],
  'gemini-cli': ['Gemini CLI AI 编程', 'Gemini CLI 编程'],
  'jetbrains-ai-assistant': ['JetBrains AI Assistant AI 编程'],
  'jetbrains-junie': ['JetBrains Junie AI 编程', 'Junie JetBrains AI 编程'],
  'vercel-v0': ['v0 by Vercel AI 编程', 'Vercel v0 AI 编程'],
  tabby: ['TabbyML AI 编程', 'Tabby AI 编程'],
  warp: ['Warp Terminal AI 编程', 'Warp AI 编程'],
  'visual-studio-intellicode': ['Visual Studio IntelliCode AI 编程', 'IntelliCode AI 编程'],
  'tongyi-lingma': ['通义灵码 AI 编程', '灵码 AI 编程'],
  'baidu-comate': ['百度 Comate AI 编程', 'Baidu Comate AI 编程'],
  marscode: ['豆包 MarsCode AI 编程', 'MarsCode AI 编程'],
};

const MINED_CANDIDATE_SEED_QUERIES = [
  'AI 编程 工具',
  'AI 编程 IDE',
  'AI 代码助手',
  'AI 编程 助手',
  'AI IDE',
  'AI 代码生成',
];

const TOKEN_STOPLIST = new Set([
  'AI',
  'IDE',
  'AIGC',
  'GPT',
  'RAG',
  'API',
  'SDK',
  'CLI',
  'PR',
  'SOP',
  'JS',
  'TS',
  'SQL',
  'HTTP',
  'HTTPS',
  'Mac',
  'Windows',
  'Linux',
  'VS',
  'VSCode',
  'VSCODE',
  'Code',
  'Coding',
  'Agent',
  'Agents',
  'Tool',
  'Tools',
]);

const VENDOR_ROOT_DOMAINS = new Set([
  'amazon.com',
  'anthropic.com',
  'atlassian.com',
  'github.com',
  'gitlab.com',
  'google.com',
  'jetbrains.com',
  'microsoft.com',
  'openai.com',
]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readCache() {
  try {
    const raw = fs.readFileSync(CACHE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { countsByQuery: {}, snapshotsByQuery: {} };
    const countsByQuery = parsed.countsByQuery && typeof parsed.countsByQuery === 'object' ? parsed.countsByQuery : {};
    const snapshotsByQuery =
      parsed.snapshotsByQuery && typeof parsed.snapshotsByQuery === 'object' ? parsed.snapshotsByQuery : {};
    return { countsByQuery, snapshotsByQuery };
  } catch {
    return { countsByQuery: {}, snapshotsByQuery: {} };
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

function stripHtml(raw) {
  return String(raw || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeQueryTitle(value) {
  return String(value || '')
    .replace(/["']/g, '')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const GENERIC_WEBSITE_HOSTS = new Set([
  'github.com',
  'www.github.com',
  'gitlab.com',
  'www.gitlab.com',
  'docs.github.com',
  'docs.gitlab.com',
  'bitbucket.org',
  'www.bitbucket.org',
  'marketplace.visualstudio.com',
  'open-vsx.org',
  'www.open-vsx.org',
  'npmjs.com',
  'www.npmjs.com',
  'pypi.org',
  'www.pypi.org',
]);

function getWebsiteParts(website) {
  if (!website) return null;
  try {
    const parsed = new URL(String(website));
    const host = String(parsed.host || '').toLowerCase();
    const pathname = String(parsed.pathname || '');
    const segments = pathname
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean);
    return { host, segments };
  } catch {
    return null;
  }
}

function buildDomainRegex(host) {
  if (!host) return null;
  const normalizedHost = String(host).toLowerCase().replace(/^www\./, '');
  const parts = normalizedHost.split('.').filter(Boolean);
  if (parts.length < 2) return null;
  const pattern = parts.map(escapeRegExp).join('\\s*\\.\\s*');
  return new RegExp(pattern, 'i');
}

function buildRepoNameRegex(name) {
  const token = String(name || '').trim();
  if (!token) return null;
  // Example: shell_gpt / shell-gpt / shellgpt
  const normalized = token.replace(/[^A-Za-z0-9]+/g, '');
  const flexible = escapeRegExp(token).replace(/[_-]/g, '[_-]?');
  return new RegExp(`(?:${escapeRegExp(normalized)}|${flexible})`, 'i');
}

function buildNamePhraseRegex(name) {
  const raw = String(name || '').trim();
  if (!raw) return null;
  // Treat domain-like names (e.g. Gru.ai / Bolt.new / Magic.dev) as strict dot matches.
  if (/[A-Za-z0-9]\s*\.\s*[A-Za-z0-9]/.test(raw)) {
    const cleaned = raw.toLowerCase().replace(/[^a-z0-9.]+/g, '');
    const domainRe = buildDomainRegex(cleaned);
    if (domainRe) return domainRe;
  }
  if (/[\u4e00-\u9fff]/.test(raw)) {
    return new RegExp(escapeRegExp(raw), 'i');
  }
  const tokens = raw
    .split(/[^A-Za-z0-9]+/g)
    .map((t) => t.trim())
    .filter(Boolean);
  if (tokens.length === 0) return null;
  if (tokens.length === 1) return new RegExp(escapeRegExp(tokens[0]), 'i');
  return new RegExp(tokens.map(escapeRegExp).join('[\\s._-]*'), 'i');
}

function readAllTools() {
  const files = fs.readdirSync(TOOLS_DIR).filter((f) => f.endsWith('.mdx')).sort();
  return files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, '');
    const { data } = matter(fs.readFileSync(path.join(TOOLS_DIR, filename), 'utf8'));
    return { slug, data };
  });
}

function getToolBaseTitle({ slug, data }) {
  const title = normalizeQueryTitle(data.titleZh || data.titleEn || data.title || slug);
  return title || slug;
}

function getToolSearchQueryCandidates({ slug, data }) {
  const candidates = [];
  const extra = EXTRA_SEARCH_QUERIES[slug];
  if (Array.isArray(extra) && extra.length > 0) candidates.push(...extra.map(String));

  const title = getToolBaseTitle({ slug, data });
  candidates.push(`${title} AI 编程`);

  const seen = new Set();
  return candidates
    .map((q) => String(q || '').trim())
    .filter(Boolean)
    .filter((q) => {
      const key = q.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function getPseudoRegistrableDomain(host) {
  const normalized = String(host || '').toLowerCase().replace(/^www\./, '');
  const parts = normalized.split('.').filter(Boolean);
  if (parts.length <= 2) return normalized;
  return parts.slice(-2).join('.');
}

function getSafeWebsiteDomainForMatching(website) {
  const websiteParts = getWebsiteParts(website);
  if (!websiteParts) return null;
  const host = websiteParts.host.replace(/^www\./, '');
  if (!host) return null;
  if (GENERIC_WEBSITE_HOSTS.has(host)) return null;
  const root = getPseudoRegistrableDomain(host);
  if (GENERIC_WEBSITE_HOSTS.has(root)) return null;
  if (VENDOR_ROOT_DOMAINS.has(root)) return null;
  return host;
}

function buildToolMatchRules({ slug, data }) {
  const primary = [];
  const secondary = [];

  const titleRaw = String(data.titleZh || data.titleEn || data.title || slug);
  const matchTitle = titleRaw
    .replace(/["']/g, '')
    .replace(/[()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const titleRe = buildNamePhraseRegex(matchTitle);
  if (titleRe) primary.push(titleRe);

  const domain = getSafeWebsiteDomainForMatching(data.website);
  if (domain) {
    const domainRe = buildDomainRegex(domain);
    if (domainRe) secondary.push(domainRe);
  }

  return { primary, secondary };
}

function parseWeChatSearchSnapshot(html) {
  const noResult = /(noresult|没有找到)/i.test(html);

  const countMatch = html.match(/resultbarnum:([0-9,]+)/);
  if (countMatch) {
    const count = Number(countMatch[1].replace(/,/g, ''));
    return { count, items: extractWeChatSearchItems(html) };
  }

  const fallback = html.match(/找到约\\s*([0-9,]+)\\s*条结果/);
  if (fallback) {
    const count = Number(fallback[1].replace(/,/g, ''));
    return { count, items: extractWeChatSearchItems(html) };
  }

  if (noResult) return { count: 0, items: [] };

  const items = extractWeChatSearchItems(html);
  return { count: null, items };
}

function extractWeChatSearchItems(html) {
  const titleRe = /id="sogou_vr_11002601_title_(\d+)"[^>]*>([\s\S]*?)<\/a>/g;
  const summaryRe = /id="sogou_vr_11002601_summary_(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  const titles = new Map();
  const summaries = new Map();

  let m;
  while ((m = titleRe.exec(html))) {
    titles.set(m[1], stripHtml(m[2]));
  }
  while ((m = summaryRe.exec(html))) {
    summaries.set(m[1], stripHtml(m[2]));
  }

  const items = [];
  for (const [idx, title] of titles.entries()) {
    items.push({
      idx: Number(idx),
      title,
      summary: summaries.get(idx) || '',
    });
  }

  items.sort((a, b) => a.idx - b.idx);
  return items.map(({ title, summary }) => ({ title, summary }));
}

async function fetchWeChatSearchSnapshot(query) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
    try {
      const url = new URL(WEIXIN_SOGOU_SEARCH_URL);
      url.searchParams.set('type', '2');
      url.searchParams.set('query', query);

      const res = await fetch(url, {
        headers: { 'user-agent': 'Mozilla/5.0 (codeatlas-bot)' },
        signal: ctrl.signal,
      });

      if (!res.ok) throw new Error(`Weixin Sogou search failed (${res.status})`);

      const text = await res.text();
      if (/(antispider|验证码|请输入验证码|安全验证)/i.test(text)) {
        throw new Error('Weixin Sogou triggered anti-spider verification');
      }

      return parseWeChatSearchSnapshot(text);
    } catch (err) {
      if (err && typeof err === 'object' && err.name === 'AbortError') {
        const waitMs = 3_000 * attempt;
        console.warn(`Weixin Sogou search timed out. Waiting ${Math.round(waitMs / 1000)}s then retrying: ${query}`);
        await sleep(waitMs);
        continue;
      }
      const causeCode =
        err && typeof err === 'object'
          ? (err.cause && typeof err.cause === 'object' ? err.cause.code : err.code)
          : undefined;
      const transientCodes = new Set(['UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_SOCKET', 'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN']);
      if (typeof causeCode === 'string' && transientCodes.has(causeCode)) {
        const waitMs = 3_000 * attempt;
        console.warn(`Weixin Sogou network error (${causeCode}). Waiting ${Math.round(waitMs / 1000)}s then retrying: ${query}`);
        await sleep(waitMs);
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error(`Weixin Sogou search exceeded retry limit: ${query}`);
}

function renderOutput(mapping, meta) {
  return `// Generated by scripts/compute-tool-wechat-heat.mjs
// Source: weixin.sogou.com (article search result count)
// Query strategy: best-of N queries, with a relevance penalty based on first-page hits
// Generated at: ${meta.generatedAt}

export const TOOL_WECHAT_HEAT_SCORE: Record<string, number> = ${JSON.stringify(mapping, null, 2)};

export function getToolWeChatHeatScore(slug: string): number {
  return TOOL_WECHAT_HEAT_SCORE[slug] ?? 0;
}
`;
}

function matchesAny(text, regexes) {
  const value = String(text || '');
  return regexes.some((re) => re.test(value));
}

function scoreSnapshot({ snapshot, matchRules }) {
  const items = Array.isArray(snapshot.items) ? snapshot.items : [];
  if (items.length === 0) {
    const raw = typeof snapshot.count === 'number' ? snapshot.count : 0;
    return { rawCount: raw, countUsed: raw, hits: 0, total: 0, precision: 0, adjusted: 0, matchBasis: 'none' };
  }

  const combinedTexts = items.map((item) => `${item.title || ''} ${item.summary || ''}`);
  const primaryHits =
    matchRules.primary.length > 0
      ? combinedTexts.filter((text) => matchesAny(text, matchRules.primary)).length
      : 0;
  const secondaryHits = combinedTexts.filter((text) => matchesAny(text, matchRules.secondary)).length;

  const hits = matchRules.primary.length > 0 && primaryHits > 0 ? primaryHits : secondaryHits;
  const matchBasis = matchRules.primary.length > 0 && primaryHits > 0 ? 'primary' : 'secondary';
  const precision = hits / items.length;

  const rawCount = typeof snapshot.count === 'number' ? snapshot.count : null;
  const countUsed = typeof rawCount === 'number' ? rawCount : items.length;
  const adjusted = Math.round(countUsed * Math.pow(precision, HEAT_PRECISION_EXPONENT));

  return { rawCount: rawCount ?? 0, countUsed, hits, total: items.length, precision, adjusted, matchBasis };
}

async function mineCandidates({ cache, existingTitles }) {
  const tokenCounts = new Map();
  const tokenSources = new Map();

  for (const seedQuery of MINED_CANDIDATE_SEED_QUERIES) {
    const url = new URL(WEIXIN_SOGOU_SEARCH_URL);
    url.searchParams.set('type', '2');
    url.searchParams.set('query', seedQuery);

    const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (codeatlas-bot)' } });
    if (!res.ok) continue;
    const html = await res.text();
    if (/(antispider|验证码|请输入验证码|安全验证)/i.test(html)) continue;

    const titles = [];
    const re = /id="sogou_vr_11002601_title_\d+"[^>]*>([\s\S]*?)<\/a>/g;
    let m;
    while ((m = re.exec(html))) {
      titles.push(stripHtml(m[1]));
    }

    for (const rawTitle of titles) {
      const words = rawTitle.match(/[A-Za-z][A-Za-z0-9+._-]{2,}/g) || [];
      for (const word of words) {
        if (TOKEN_STOPLIST.has(word) || TOKEN_STOPLIST.has(word.toUpperCase())) continue;
        const normalized = word;
        tokenCounts.set(normalized, (tokenCounts.get(normalized) ?? 0) + 1);
        if (!tokenSources.has(normalized)) tokenSources.set(normalized, new Set());
        tokenSources.get(normalized).add(seedQuery);
      }
    }
  }

  const rankedTokens = [...tokenCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 80)
    .map(([token]) => token);

  const missing = rankedTokens.filter((token) => {
    const lower = token.toLowerCase();
    for (const title of existingTitles) {
      if (title.toLowerCase().includes(lower)) return false;
    }
    return true;
  });

  const candidates = [];
  for (const token of missing.slice(0, 20)) {
    const query = `${token} AI 编程`;
    let score = null;
    if (typeof cache.countsByQuery[query] === 'number') {
      score = cache.countsByQuery[query];
    } else {
      try {
        const snapshot = await fetchWeChatSearchSnapshot(query);
        score = typeof snapshot.count === 'number' ? snapshot.count : 0;
        cache.countsByQuery[query] = score;
        writeCache(cache);
        await sleep(REQUEST_DELAY_MS);
      } catch {
        score = 0;
      }
    }
    candidates.push({
      name: token,
      score,
      sources: [...(tokenSources.get(token) ?? [])],
    });
  }

  return candidates.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

async function main() {
  const toolsAll = readAllTools();
  const tools = typeof MAX_ITEMS === 'number' ? toolsAll.slice(0, MAX_ITEMS) : toolsAll;
  const titleBySlug = new Map(
    toolsAll.map((tool) => [tool.slug, String(tool.data.titleZh || tool.data.titleEn || tool.data.title || tool.slug)])
  );
  const existingTitles = toolsAll.map((tool) => String(tool.data.titleZh || tool.data.titleEn || tool.data.title || tool.slug));

  const cache = readCache();
  cache.countsByQuery ??= {};
  cache.snapshotsByQuery ??= {};
  const scoreBySlug = {};
  const queryBySlug = {};
  const detailBySlug = {};
  const failed = [];

  for (const tool of tools) {
    const shouldRefresh = SHOULD_REFRESH && (!ONLY_SLUGS || ONLY_SLUGS.has(tool.slug));
    const restrictNetwork = ONLY_SLUGS && !ONLY_SLUGS.has(tool.slug);
    const candidates = getToolSearchQueryCandidates(tool);
    const matchRules = buildToolMatchRules(tool);

    let best = null;
    for (const query of candidates) {
      try {
        const cachedSnapshot = cache.snapshotsByQuery[query];
        const canReuseSnapshot =
          !shouldRefresh &&
          cachedSnapshot &&
          typeof cachedSnapshot === 'object' &&
          Array.isArray(cachedSnapshot.items) &&
          ('count' in cachedSnapshot);

        let didRequest = false;
        let snapshot;
        if (canReuseSnapshot) {
          snapshot = cachedSnapshot;
        } else if (restrictNetwork) {
          const cachedCount = cache.countsByQuery[query];
          const fallbackCount = typeof cachedCount === 'number' ? cachedCount : 0;
          const record = {
            query,
            rawCount: fallbackCount,
            countUsed: fallbackCount,
            hits: 0,
            total: 0,
            precision: 0,
            adjusted: fallbackCount,
            matchBasis: 'none',
          };
          if (
            !best ||
            record.adjusted > best.adjusted ||
            (record.adjusted === best.adjusted && record.rawCount > best.rawCount)
          ) {
            best = record;
          }
          continue;
        } else {
          didRequest = true;
          snapshot = await fetchWeChatSearchSnapshot(query);
          cache.snapshotsByQuery[query] = {
            count: snapshot.count,
            items: snapshot.items,
            fetchedAt: new Date().toISOString(),
          };
          cache.countsByQuery[query] = typeof snapshot.count === 'number' ? snapshot.count : 0;
          writeCache(cache);
        }

        const scored = scoreSnapshot({ snapshot, matchRules });
        const record = { query, ...scored };
        if (
          !best ||
          record.adjusted > best.adjusted ||
          (record.adjusted === best.adjusted && record.hits > best.hits) ||
          (record.adjusted === best.adjusted && record.hits === best.hits && record.precision > best.precision) ||
          (record.adjusted === best.adjusted &&
            record.hits === best.hits &&
            record.precision === best.precision &&
            record.rawCount > best.rawCount)
        ) {
          best = record;
        }

        if (didRequest) await sleep(REQUEST_DELAY_MS);
      } catch (err) {
        failed.push({ slug: tool.slug, query, error: String(err && err.message ? err.message : err) });
      }
    }

    if (best && best.adjusted === 0) {
      const domain = getSafeWebsiteDomainForMatching(tool.data.website);
      const fallbackQueries = [];
      if (domain) {
        fallbackQueries.push(`${domain} AI 编程`, domain);
      }

      const seenFallback = new Set(candidates.map((q) => q.toLowerCase()));
      for (const query of fallbackQueries) {
        const key = query.toLowerCase();
        if (seenFallback.has(key)) continue;
        seenFallback.add(key);

        try {
          const cachedSnapshot = cache.snapshotsByQuery[query];
          const canReuseSnapshot =
            !shouldRefresh &&
            cachedSnapshot &&
            typeof cachedSnapshot === 'object' &&
            Array.isArray(cachedSnapshot.items) &&
            ('count' in cachedSnapshot);

          let didRequest = false;
          let snapshot;
          if (canReuseSnapshot) {
            snapshot = cachedSnapshot;
          } else if (restrictNetwork) {
            const cachedCount = cache.countsByQuery[query];
            const fallbackCount = typeof cachedCount === 'number' ? cachedCount : 0;
            const record = {
              query,
              rawCount: fallbackCount,
              countUsed: fallbackCount,
              hits: 0,
              total: 0,
              precision: 0,
              adjusted: fallbackCount,
              matchBasis: 'none',
            };
            if (
              record.adjusted > best.adjusted ||
              (record.adjusted === best.adjusted && record.hits > best.hits) ||
              (record.adjusted === best.adjusted && record.hits === best.hits && record.precision > best.precision) ||
              (record.adjusted === best.adjusted &&
                record.hits === best.hits &&
                record.precision === best.precision &&
                record.rawCount > best.rawCount)
            ) {
              best = record;
            }
            continue;
          } else {
            didRequest = true;
            snapshot = await fetchWeChatSearchSnapshot(query);
            cache.snapshotsByQuery[query] = {
              count: snapshot.count,
              items: snapshot.items,
              fetchedAt: new Date().toISOString(),
            };
            cache.countsByQuery[query] = typeof snapshot.count === 'number' ? snapshot.count : 0;
            writeCache(cache);
          }

          const scored = scoreSnapshot({ snapshot, matchRules });
          const record = { query, ...scored };
          if (
            record.adjusted > best.adjusted ||
            (record.adjusted === best.adjusted && record.hits > best.hits) ||
            (record.adjusted === best.adjusted && record.hits === best.hits && record.precision > best.precision) ||
            (record.adjusted === best.adjusted &&
              record.hits === best.hits &&
              record.precision === best.precision &&
              record.rawCount > best.rawCount)
          ) {
            best = record;
          }

          if (didRequest) await sleep(REQUEST_DELAY_MS);
        } catch (err) {
          failed.push({ slug: tool.slug, query, error: String(err && err.message ? err.message : err) });
        }
      }
    }

    if (!best) {
      const fallbackQuery = candidates[0] || `${getToolBaseTitle(tool)} AI 编程`;
      queryBySlug[tool.slug] = fallbackQuery;
      scoreBySlug[tool.slug] = 0;
      detailBySlug[tool.slug] = { query: fallbackQuery, rawCount: 0, adjusted: 0, hits: 0, total: 0, precision: 0 };
      continue;
    }

    queryBySlug[tool.slug] = best.query;
    scoreBySlug[tool.slug] = best.adjusted;
    detailBySlug[tool.slug] = best;
  }

  const sorted = Object.entries(scoreBySlug).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const mapping = Object.fromEntries(sorted);

  fs.writeFileSync(
    OUT_PATH,
    renderOutput(mapping, {
      generatedAt: new Date().toISOString(),
    })
  );

  console.log('Top 20 by WeChat heat (Sogou):');
  for (const [slug, score] of sorted.slice(0, 20)) {
    console.log(`${String(score).padStart(6, ' ')}  ${slug}`);
  }

  if (SHOULD_WRITE_REPORT) {
    const candidates = await mineCandidates({ cache, existingTitles });
    const md = [];
    md.push('# 微信公众号热度报告（自动生成）');
    md.push('');
    md.push(`- Generated at: ${new Date().toISOString()}`);
    md.push('- Data source: https://weixin.sogou.com/weixin (type=2)');
    md.push('- Heat proxy: 搜索结果数（找到约 N 条结果），仅作相对排序参考，可能随时间波动。');
    md.push(`- Adjustment: 热度 = 结果数 × (首屏命中率 ^ ${HEAT_PRECISION_EXPONENT})，用于降低通用词/拆词带来的误差。`);
    md.push('- Query: 对每个工具尝试多个候选 query，选择“调整后热度”最高的一个。');
    md.push('');
    md.push('## Top 30（按热度降序）');
    md.push('');
    md.push('| Rank | Slug | Title | Heat | Raw | Hit | Precision | Basis | Query |');
    md.push('| ---: | --- | --- | ---: | ---: | ---: | ---: | --- | --- |');
    for (const [idx, [slug, score]] of sorted.slice(0, 30).entries()) {
      const title = titleBySlug.get(slug) ?? slug;
      const query = queryBySlug[slug] ?? '';
      const detail = detailBySlug[slug];
      const raw = detail && typeof detail.rawCount === 'number' ? detail.rawCount : 0;
      const hit = detail && typeof detail.hits === 'number' ? `${detail.hits}/${detail.total}` : '0/0';
      const precision = detail && typeof detail.precision === 'number' ? detail.precision.toFixed(2) : '0.00';
      const basis = detail && typeof detail.matchBasis === 'string' ? detail.matchBasis : '-';
      md.push(`| ${idx + 1} | ${slug} | ${title} | ${score} | ${raw} | ${hit} | ${precision} | ${basis} | ${query} |`);
    }

    md.push('');
    md.push('## 疑似缺失候选（从通用关键词结果里挖掘）');
    md.push('');
    md.push('| Name | Heat | Sources |');
    md.push('| --- | ---: | --- |');
    for (const item of candidates.slice(0, 30)) {
      md.push(`| ${item.name} | ${item.score} | ${item.sources.join(' / ') || '-'} |`);
    }

    if (failed.length > 0) {
      md.push('');
      md.push('## 失败/降级');
      md.push('');
      md.push(`- ${failed.length} queries failed (used cache/0).`);
      md.push('');
      md.push('| Slug | Query | Error |');
      md.push('| --- | --- | --- |');
      for (const item of failed.slice(0, 50)) {
        md.push(`| ${item.slug} | ${item.query} | ${stripHtml(item.error)} |`);
      }
    }

    fs.writeFileSync(REPORT_PATH, `${md.join('\n')}\n`, 'utf8');
    console.log(`Report written: ${path.relative(ROOT, REPORT_PATH)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

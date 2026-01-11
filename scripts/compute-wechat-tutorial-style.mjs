import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_PATH = path.join(ROOT, 'docs', 'wechat-tutorial-style-research.md');
const CACHE_PATH = path.join(ROOT, 'scripts', '.wechat-tutorial-style-cache.json');

const WEIXIN_SOGOU_SEARCH_URL = 'https://weixin.sogou.com/weixin';
const REQUEST_TIMEOUT_MS = 35_000;
const REQUEST_DELAY_MS = 1_200;
const MAX_RETRIES = 5;

const QUERIES = [
  { id: 'cursor', query: 'Cursor 教程' },
  { id: 'cursor-rules', query: 'Cursor Rules .cursorrules 教程' },
  { id: 'cline', query: 'Cline 教程' },
  { id: 'mcp', query: 'MCP 教程' },
  { id: 'claude-code', query: 'Claude Code 教程' },
  { id: 'codex-cli', query: 'Codex CLI 教程' },
  { id: 'litellm', query: 'LiteLLM 教程' },
  { id: 'langfuse', query: 'Langfuse 教程' },
  { id: 'pr-agent', query: 'PR-Agent 教程' },
];

const PHRASES = [
  '保姆级',
  '手把手',
  '从0到1',
  '从 0 到 1',
  '一文搞定',
  '一文',
  '实战',
  '入门',
  '安装',
  '配置',
  '教程',
  '指南',
  '避坑',
  '踩坑',
  '合集',
  '清单',
  '最全',
  '干货',
  '速成',
  '分钟',
  '免费',
  '激活',
  '充值',
  '代充',
  '共享',
  '重置',
];

const args = process.argv.slice(2);
const SHOULD_REFRESH = args.includes('--refresh');
const MAX_ITEMS = (() => {
  const idx = args.findIndex((item) => item === '--max');
  if (idx === -1) return 8;
  const value = Number(args[idx + 1]);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 8;
})();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function readCache() {
  try {
    const raw = fs.readFileSync(CACHE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { byQuery: {} };
    const byQuery = parsed.byQuery && typeof parsed.byQuery === 'object' ? parsed.byQuery : {};
    return { byQuery };
  } catch {
    return { byQuery: {} };
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
    ),
    'utf8'
  );
}

async function fetchWeChatSearchHtml(query) {
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
      return text;
    } catch (err) {
      if (err && typeof err === 'object' && err.name === 'AbortError') {
        const waitMs = 3_000 * attempt;
        console.warn(`Weixin Sogou search timed out. Waiting ${Math.round(waitMs / 1000)}s then retrying: ${query}`);
        await sleep(waitMs);
        continue;
      }
      const causeCode =
        err && typeof err === 'object'
          ? err.cause && typeof err.cause === 'object'
            ? err.cause.code
            : err.code
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

function parseSearchResult(html) {
  const countMatch = html.match(/resultbarnum:([0-9,]+)/);
  const countFallback = html.match(/找到约\s*([0-9,]+)\s*条结果/);
  const count =
    (countMatch && Number(countMatch[1].replace(/,/g, ''))) ||
    (countFallback && Number(countFallback[1].replace(/,/g, ''))) ||
    0;

  const items = [];
  const re = /<li\s+id="sogou_vr_11002601_box_\d+"[\s\S]*?<\/li>/g;
  let m;
  while ((m = re.exec(html))) {
    const block = m[0];
    const titleMatch = block.match(/id="sogou_vr_11002601_title_\d+"[^>]*>([\s\S]*?)<\/a>/);
    const accountMatch = block.match(/<span\s+class="all-time-y2">([\s\S]*?)<\/span>/);
    const timeMatch = block.match(/timeConvert\('([0-9]+)'\)/);
    const title = titleMatch ? stripHtml(titleMatch[1]) : '';
    const account = accountMatch ? stripHtml(accountMatch[1]) : '';
    const timestampSec = timeMatch ? Number(timeMatch[1]) : null;
    const publishedAt = typeof timestampSec === 'number' && Number.isFinite(timestampSec) ? new Date(timestampSec * 1000) : null;

    if (!title) continue;
    items.push({
      title,
      account: account || '-',
      timestampSec,
      date: publishedAt ? publishedAt.toISOString().slice(0, 10) : '-',
    });
  }

  return { count, items };
}

function countPhrases(titles) {
  const stats = new Map(PHRASES.map((p) => [p, 0]));
  for (const title of titles) {
    for (const phrase of PHRASES) {
      if (title.includes(phrase)) stats.set(phrase, (stats.get(phrase) ?? 0) + 1);
    }
  }
  return [...stats.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function renderMarkdown({ generatedAt, results, phraseStats }) {
  const md = [];
  md.push('# 微信公众号教程写法调研（自动生成）');
  md.push('');
  md.push(`- Generated at: ${generatedAt}`);
  md.push('- Data source: https://weixin.sogou.com/weixin (type=2)');
  md.push('- Notes: 仅抓取搜索结果页的标题/账号/发布时间与结果数，用于“风格与选题趋势”参考。');
  md.push('');

  md.push('## 高频标题元素（样本统计）');
  md.push('');
  md.push('| Phrase | Count |');
  md.push('| --- | ---: |');
  for (const [phrase, count] of phraseStats) {
    if (count <= 0) continue;
    md.push(`| ${phrase} | ${count} |`);
  }

  md.push('');
  md.push('## 样本标题（按查询）');
  md.push('');

  for (const { id, query, count, items } of results) {
    md.push(`### ${id}: ${query}`);
    md.push('');
    md.push(`- 结果数（热度代理）：${count}`);
    md.push('');
    md.push('| # | Title | Account | Date |');
    md.push('| ---: | --- | --- | --- |');
    for (const [idx, item] of items.entries()) {
      md.push(`| ${idx + 1} | ${item.title} | ${item.account} | ${item.date} |`);
    }
    md.push('');
  }

  md.push('## 观察要点（人工归纳，供写作使用）');
  md.push('');
  md.push('- 标题更偏“结果导向”：常用「X 分钟/从 0 到 1/保姆级/一文搞定/避坑」来承诺收益与降低不确定性。');
  md.push('- 正文更偏“可执行”：先给目标/适用人群/准备清单，再给分步操作与截图，最后给避坑/FAQ/复盘。');
  md.push('- 高频选题集中在：安装配置、规则体系（Rules/约束）、MCP 接入清单、网关与可观测（LiteLLM/Langfuse）。');
  md.push('- 噪声也很多：代充/激活/共享 Key/重置等灰产内容不要写成教程，应以风险提示/合规说明替代。');
  md.push('');

  return `${md.join('\n')}\n`;
}

async function main() {
  const cache = readCache();
  cache.byQuery ??= {};

  const results = [];
  for (const item of QUERIES) {
    const cached = cache.byQuery[item.query];
    if (!SHOULD_REFRESH && cached && typeof cached === 'object' && Array.isArray(cached.items) && typeof cached.count === 'number') {
      results.push({ ...item, count: cached.count, items: cached.items.slice(0, MAX_ITEMS) });
      continue;
    }

    const html = await fetchWeChatSearchHtml(item.query);
    const parsed = parseSearchResult(html);
    const normalized = {
      count: parsed.count,
      items: parsed.items.slice(0, MAX_ITEMS),
      updatedAt: new Date().toISOString(),
    };
    cache.byQuery[item.query] = normalized;
    writeCache(cache);
    results.push({ ...item, count: normalized.count, items: normalized.items });
    await sleep(REQUEST_DELAY_MS);
  }

  const allTitles = results.flatMap((r) => r.items.map((x) => x.title));
  const phraseStats = countPhrases(allTitles);

  const markdown = renderMarkdown({
    generatedAt: new Date().toISOString(),
    results,
    phraseStats,
  });
  fs.writeFileSync(OUT_PATH, markdown, 'utf8');
  console.log(`Report written: ${path.relative(ROOT, OUT_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

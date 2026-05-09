import fs from 'node:fs';
import path from 'node:path';
import { setGlobalDispatcher, EnvHttpProxyAgent } from 'undici';
import { fetchVercelTrafficSummary } from './fetch-vercel-traffic.mjs';

const proxyEnv =
  process.env.HTTPS_PROXY ||
  process.env.HTTP_PROXY ||
  process.env.ALL_PROXY ||
  process.env.https_proxy ||
  process.env.http_proxy ||
  process.env.all_proxy;

if (proxyEnv) {
  try {
    const dispatcher = new EnvHttpProxyAgent();
    setGlobalDispatcher(dispatcher);
    console.log('[daily-report] Using proxy from environment for HTTP requests.');
  } catch (err) {
    console.error('[daily-report] Failed to enable proxy via EnvHttpProxyAgent:', err);
  }
}

const ROOT = process.cwd();
const TOOLS_DIR = path.join(ROOT, 'src', 'content', 'tools');
const TUTORIALS_DIR = path.join(ROOT, 'src', 'content', 'tutorials');
const TEMPLATES_DIR = path.join(ROOT, 'src', 'content', 'templates');
const SCOREBOARD_JSON = path.join(ROOT, 'docs', 'content-scoreboard.json');

function safeReadJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[daily-report] Failed to read JSON:', filePath, err);
    return null;
  }
}

function countMdx(dirPath) {
  try {
    return fs.readdirSync(dirPath).filter((f) => f.endsWith('.mdx')).length;
  } catch {
    return 0;
  }
}

function collectContentStats() {
  const tools = countMdx(TOOLS_DIR);
  const tutorials = countMdx(TUTORIALS_DIR);
  const templates = countMdx(TEMPLATES_DIR);
  return { tools, tutorials, templates };
}

function pickTopTools(scoreboard, limit = 3) {
  if (!scoreboard || !scoreboard.items || !Array.isArray(scoreboard.items.hotTools)) return [];
  return scoreboard.items.hotTools.slice(0, limit).map((item) => ({
    slug: item.slug,
    title: item.title,
    score: item.combinedScore ?? item.wechatScore ?? 0,
  }));
}

function pickPlanFromScoreboard(scoreboard, limit = 3) {
  if (!scoreboard || !scoreboard.items) return { stale: [], noTutorials: [], noTemplates: [] };
  const stale = (scoreboard.items.staleHotTools || []).slice(0, limit);
  const noTutorials = (scoreboard.items.hotWithoutTutorials || []).slice(0, limit);
  const noTemplates = (scoreboard.items.hotWithoutTemplates || []).slice(0, limit);
  return { stale, noTutorials, noTemplates };
}

async function fetchAutomationMergedPRs() {
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  if (!repo || !token) {
    console.error('[daily-report] Missing GITHUB_REPOSITORY or GITHUB_TOKEN');
    return [];
  }
  const url = new URL(`https://api.github.com/repos/${repo}/pulls`);
  url.searchParams.set('state', 'closed');
  url.searchParams.set('per_page', '50');
  url.searchParams.set('sort', 'updated');
  url.searchParams.set('direction', 'desc');

  const res = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
      'user-agent': 'codeatlas-daily-report',
    },
  });

  if (!res.ok) {
    console.error('[daily-report] Failed to fetch PRs:', res.status, await res.text());
    return [];
  }

  const data = await res.json();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return (Array.isArray(data) ? data : [])
    .filter((pr) => pr.merged_at)
    .filter((pr) => new Date(pr.merged_at) >= since)
    .filter((pr) => Array.isArray(pr.labels) && pr.labels.some((label) => label.name === 'automation'))
    .map((pr) => ({
      number: pr.number,
      title: pr.title,
      html_url: pr.html_url,
      mergedAt: pr.merged_at,
    }));
}

function buildMessage({ stats, topTools, mergedPrs, plan, traffic }) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const lines = [];

  lines.push(`CodeAtlas 自动运营日报 (${dateStr})`);
  lines.push('');

  // 站点概况
  lines.push('【站点概况】');
  lines.push(`- 工具：${stats.tools} 个`);
  lines.push(`- 教程：${stats.tutorials} 篇`);
  lines.push(`- 模板：${stats.templates} 个`);
  if (topTools.length > 0) {
    const topText = topTools.map((t, idx) => `${idx + 1}. ${t.title} (/tools/${t.slug})`).join('； ');
    lines.push(`- 热度 Top${topTools.length}：${topText}`);
  } else {
    lines.push('- 热度 Top：暂无数据（等待 content-scoreboard 生成）');
  }
  lines.push('');

  // 访问概况（Vercel 日志）
  lines.push('【访问概况（Vercel 日志）】');
  if (!traffic) {
    lines.push('- 暂无访问日志数据（可能最近 24 小时没有请求，或 vercel CLI 未登录）。');
  } else {
    lines.push(`- 过去 24 小时请求数：${traffic.totalRequests}`);
    lines.push(`- 错误率：${(traffic.errorRate * 100).toFixed(2)}%`);
    if (traffic.topPaths && traffic.topPaths.length > 0) {
      const topPathsText = traffic.topPaths
        .map((item, idx) => `${idx + 1}. ${item.path}（${item.count} 次）`)
        .join('； ');
      lines.push(`- Top 页面：${topPathsText}`);
    } else {
      lines.push('- Top 页面：暂无数据');
    }
  }
  lines.push('');

  // 今天已做（自动合并的 automation PR）
  lines.push('【今天已做（自动化 PR）】');
  if (mergedPrs.length === 0) {
    lines.push('- 过去 24 小时没有自动合并的 automation PR。');
  } else {
    mergedPrs.forEach((pr) => {
      lines.push(`- #${pr.number} ${pr.title}`);
    });
  }
  lines.push('');

  // 接下来计划（来自内容看板）
  lines.push('【接下来计划（基于内容看板）】');
  if (!plan || (!plan.stale.length && !plan.noTutorials.length && !plan.noTemplates.length)) {
    lines.push('- 暂无内容看板数据，可手动运行 `npm run content:scoreboard` 或等待周任务。');
  } else {
    if (plan.stale.length > 0) {
      lines.push('- 优先复查（高热度但久未更新）：');
      plan.stale.forEach((item, idx) => {
        lines.push(`  ${idx + 1}. ${item.title} (/tools/${item.slug})`);
      });
    }
    if (plan.noTutorials.length > 0) {
      lines.push('- 补教程（高热度但没有教程）：');
      plan.noTutorials.forEach((item, idx) => {
        lines.push(`  ${idx + 1}. ${item.title} (/tools/${item.slug})`);
      });
    }
    if (plan.noTemplates.length > 0) {
      lines.push('- 补模板（高热度但没有模板）：');
      plan.noTemplates.forEach((item, idx) => {
        lines.push(`  ${idx + 1}. ${item.title} (/tools/${item.slug})`);
      });
    }
  }

  lines.push('');
  lines.push('（本消息由 CodeAtlas 自动生成并通过自动化任务推送， 逻辑可在仓库 scripts/daily-telegram-report.mjs 中调整。）');

  return lines.join('\n');
}

async function resolveTelegramChatId(token) {
  try {
    const url = `https://api.telegram.org/bot${token}/getUpdates`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error('[daily-report] Failed to fetch Telegram updates:', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    if (!data.ok || !Array.isArray(data.result) || data.result.length === 0) {
      console.error('[daily-report] No Telegram updates found to infer chat id.');
      return null;
    }
    const last = data.result[data.result.length - 1];
    const chat =
      (last.message && last.message.chat) ||
      (last.channel_post && last.channel_post.chat) ||
      (last.my_chat_member && last.my_chat_member.chat) ||
      null;
    if (!chat || typeof chat.id === 'undefined') {
      console.error('[daily-report] Telegram chat id not found in updates.');
      return null;
    }
    console.log('[daily-report] Inferred TELEGRAM_CHAT_ID from updates:', chat.id);
    return chat.id;
  } catch (err) {
    console.error('[daily-report] Failed to infer TELEGRAM_CHAT_ID from updates:', err);
    return null;
  }
}

async function sendToTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  let chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token) {
    console.error('[daily-report] Missing TELEGRAM_BOT_TOKEN, skip sending.');
    return;
  }

  if (!chatId) {
    chatId = await resolveTelegramChatId(token);
    if (!chatId) {
      console.error('[daily-report] TELEGRAM_CHAT_ID not set and could not be inferred from updates, skip sending.');
      return;
    }
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  });

  if (!res.ok) {
    console.error('[daily-report] Failed to send Telegram message:', res.status, await res.text());
  } else {
    console.log('[daily-report] Telegram message sent.');
  }
}

async function main() {
  const stats = collectContentStats();
  const scoreboard = safeReadJson(SCOREBOARD_JSON);
  const topTools = pickTopTools(scoreboard, 3);
  const plan = pickPlanFromScoreboard(scoreboard, 3);
  const mergedPrs = await fetchAutomationMergedPRs();
  let traffic = null;
  try {
    traffic = await fetchVercelTrafficSummary();
  } catch (err) {
    console.error('[daily-report] Failed to fetch Vercel traffic summary:', err);
  }

  const text = buildMessage({ stats, topTools, mergedPrs, plan, traffic });
  console.log(text);
  await sendToTelegram(text);
}

main().catch((err) => {
  console.error('[daily-report] Unexpected error:', err);
  process.exitCode = 1;
});

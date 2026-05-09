import fs from 'node:fs';
import path from 'node:path';

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

function buildMessage({ stats, topTools, mergedPrs, plan }) {
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
  lines.push('（本消息由 CodeAtlas 自动生成并通过 GitHub Actions 推送，如有需要可在仓库调整脚本和计划逻辑。）');

  return lines.join('\n');
}

async function sendToTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('[daily-report] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID, skip sending.');
    return;
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

  const text = buildMessage({ stats, topTools, mergedPrs, plan });
  console.log(text);
  await sendToTelegram(text);
}

main().catch((err) => {
  console.error('[daily-report] Unexpected error:', err);
  process.exitCode = 1;
});

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const TOOLS_DIR = path.join(ROOT, 'src', 'content', 'tools');
const DOCS_DIR = path.join(ROOT, 'docs');
const TOOL_POPULARITY_PATH = path.join(ROOT, 'src', 'config', 'toolPopularity.ts');
const TOOL_WECHAT_HEAT_PATH = path.join(ROOT, 'src', 'config', 'toolWeChatHeat.ts');
const OUT_JSON_PATH = path.join(DOCS_DIR, 'content-scoreboard.json');
const OUT_MD_PATH = path.join(DOCS_DIR, 'content-scoreboard.md');

// 只看前 N 个「高热度」工具
const HOT_LIMIT = 50;
// 超过多少天未更新视为「需要复查」
const STALE_AFTER_DAYS = 60;

function stripQuotes(value) {
  return String(value ?? '').replace(/^['"]|['"]$/g, '');
}

function readTsRecord(filePath, exportName) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const pattern = new RegExp(`export const ${exportName}:[^=]*=\\s*(\\{[\\s\\S]*?\\})\\s*;`);
  const match = raw.match(pattern);
  if (!match) return {};
  const jsonLike = match[1];
  try {
    return JSON.parse(jsonLike);
  } catch (err) {
    console.warn(`[content-scoreboard] Failed to parse ${exportName} from`, filePath, err);
    return {};
  }
}

function readGithubPopularity() {
  // NOTE: src/config/toolPopularity.ts 中常量为纯 JSON 对象（双引号键），可直接 JSON.parse
  return readTsRecord(TOOL_POPULARITY_PATH, 'TOOL_GITHUB_APPEARANCE_SCORE');
}

function readWechatHeat() {
  // NOTE: src/config/toolWeChatHeat.ts 中常量为纯 JSON 对象（双引号键），可直接 JSON.parse
  return readTsRecord(TOOL_WECHAT_HEAT_PATH, 'TOOL_WECHAT_HEAT_SCORE');
}

function readAllTools() {
  const files = fs.readdirSync(TOOLS_DIR).filter((f) => f.endsWith('.mdx')).sort();
  return files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, '');
    const { data } = matter(fs.readFileSync(path.join(TOOLS_DIR, filename), 'utf8'));
    const relatedTutorials = Array.isArray(data.relatedTutorials)
      ? data.relatedTutorials.map((x) => String(x))
      : [];
    const relatedTemplates = Array.isArray(data.relatedTemplates)
      ? data.relatedTemplates.map((x) => String(x))
      : [];

    return {
      slug,
      title: stripQuotes(data.titleZh || data.titleEn || data.title || slug),
      updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
      relatedTutorials,
      relatedTemplates,
    };
  });
}

function computeDaysSince(dateStr, now = new Date()) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function buildScoreboard() {
  const tools = readAllTools();
  const githubMap = readGithubPopularity();
  const wechatMap = readWechatHeat();
  const githubValues = Object.values(githubMap).filter((v) => typeof v === 'number');
  const wechatValues = Object.values(wechatMap).filter((v) => typeof v === 'number');
  const maxGithub = githubValues.length ? Math.max(...githubValues) : 0;
  const maxWechat = wechatValues.length ? Math.max(...wechatValues) : 0;
  const now = new Date();

  const toolsWithScores = tools
    .map((tool) => {
      const githubScore = typeof githubMap[tool.slug] === 'number' ? githubMap[tool.slug] : 0;
      const wechatScore = typeof wechatMap[tool.slug] === 'number' ? wechatMap[tool.slug] : 0;
      const normalizedGithub = maxGithub > 0 ? githubScore / maxGithub : 0;
      const normalizedWechat = maxWechat > 0 ? wechatScore / maxWechat : 0;
      // 中文开发者优先：微信热度 60%，GitHub 热度 40%
      const combinedScoreRaw = normalizedGithub * 0.4 + normalizedWechat * 0.6;
      const combinedScore = Number(combinedScoreRaw.toFixed(4));
      const daysSinceUpdate = computeDaysSince(tool.updatedAt, now);

      return {
        slug: tool.slug,
        title: tool.title,
        updatedAt: tool.updatedAt ?? null,
        daysSinceUpdate,
        githubScore,
        wechatScore,
        combinedScore,
        relatedTutorials: tool.relatedTutorials,
        relatedTemplates: tool.relatedTemplates,
        tutorialCount: tool.relatedTutorials.length,
        templateCount: tool.relatedTemplates.length,
      };
    })
    .sort((a, b) => {
      if (b.combinedScore !== a.combinedScore) return b.combinedScore - a.combinedScore;
      return a.slug.localeCompare(b.slug);
    });

  const hotTools = toolsWithScores.filter((item) => item.githubScore > 0 || item.wechatScore > 0).slice(0, HOT_LIMIT);
  const staleHotTools = hotTools.filter(
    (item) => item.daysSinceUpdate === null || item.daysSinceUpdate > STALE_AFTER_DAYS
  );
  const hotWithoutTutorials = hotTools.filter((item) => item.tutorialCount === 0);
  const hotWithoutTemplates = hotTools.filter((item) => item.templateCount === 0);

  return {
    generatedAt: now.toISOString(),
    hotLimit: HOT_LIMIT,
    staleAfterDays: STALE_AFTER_DAYS,
    totals: {
      tools: toolsWithScores.length,
      hotTools: hotTools.length,
      staleHotTools: staleHotTools.length,
      hotWithoutTutorials: hotWithoutTutorials.length,
      hotWithoutTemplates: hotWithoutTemplates.length,
    },
    items: {
      tools: toolsWithScores,
      hotTools,
      staleHotTools,
      hotWithoutTutorials,
      hotWithoutTemplates,
    },
  };
}

function renderMarkdown(scoreboard) {
  const { generatedAt, hotLimit, staleAfterDays, totals, items } = scoreboard;
  const { hotTools, staleHotTools, hotWithoutTutorials, hotWithoutTemplates } = items;

  const md = [];
  md.push('# 内容健康看板（自动生成）');
  md.push('');
  md.push(`- Generated at: ${generatedAt}`);
  md.push(
    '- Data: src/content/tools/*.mdx + src/config/toolPopularity.ts + src/config/toolWeChatHeat.ts'
  );
  md.push('- Heat: 组合热度 = GitHub 热度（40%） + 微信热度（60%），仅作优先级参考。');
  md.push(`- Scope: 仅统计前 ${hotLimit} 个高热度工具（至少在 GitHub 或微信上有曝光）。`);
  md.push(`- Stale: updatedAt 超过 ${staleAfterDays} 天视为“需要复查”。`);
  md.push('');

  md.push('## 1. 高热度但长时间未更新的工具');
  md.push('');
  md.push('说明：建议优先复查这些工具的事实页（价格、隐私、适用版本、关联内容）。');
  md.push('');
  md.push(
    '| Rank | Tool | Score | GitHub | WeChat | Days since update | UpdatedAt | Tutorials | Templates |'
  );
  md.push('| ---: | --- | ---: | ---: | ---: | ---: | --- | ---: | ---: |');
  if (staleHotTools.length === 0) {
    md.push('| - | （暂无） | - | - | - | - | - | - | - |');
  } else {
    staleHotTools.forEach((item, index) => {
      const score = item.combinedScore.toFixed(3);
      const days = item.daysSinceUpdate ?? '-';
      const updated = item.updatedAt ?? '-';
      md.push(
        `| ${index + 1} | ${item.title} (/tools/${item.slug}) | ${score} | ${item.githubScore} | ${item.wechatScore} | ${days} | ${updated} | ${item.tutorialCount} | ${item.templateCount} |`
      );
    });
  }

  md.push('');
  md.push('## 2. 高热度但没有教程的工具');
  md.push('');
  md.push('说明：建议至少补 1 篇「getting-started」入门 SOP，跑通一次最小闭环。');
  md.push('');
  md.push('| Rank | Tool | Score | GitHub | WeChat | UpdatedAt | Templates |');
  md.push('| ---: | --- | ---: | ---: | ---: | --- | ---: |');
  if (hotWithoutTutorials.length === 0) {
    md.push('| - | （暂无） | - | - | - | - | - |');
  } else {
    hotWithoutTutorials.forEach((item, index) => {
      const score = item.combinedScore.toFixed(3);
      const updated = item.updatedAt ?? '-';
      md.push(
        `| ${index + 1} | ${item.title} (/tools/${item.slug}) | ${score} | ${item.githubScore} | ${item.wechatScore} | ${updated} | ${item.templateCount} |`
      );
    });
  }

  md.push('');
  md.push('## 3. 高热度但没有模板的工具');
  md.push('');
  md.push('说明：建议补 1-2 个关键模板（Rules/Prompts/配置片段），降低复用成本。');
  md.push('');
  md.push('| Rank | Tool | Score | GitHub | WeChat | UpdatedAt | Tutorials |');
  md.push('| ---: | --- | ---: | ---: | ---: | --- | ---: |');
  if (hotWithoutTemplates.length === 0) {
    md.push('| - | （暂无） | - | - | - | - | - |');
  } else {
    hotWithoutTemplates.forEach((item, index) => {
      const score = item.combinedScore.toFixed(3);
      const updated = item.updatedAt ?? '-';
      md.push(
        `| ${index + 1} | ${item.title} (/tools/${item.slug}) | ${score} | ${item.githubScore} | ${item.wechatScore} | ${updated} | ${item.tutorialCount} |`
      );
    });
  }

  md.push('');
  md.push('## 4. 使用建议');
  md.push('');
  md.push('- 每周看一次本报告，先从「1. 高热度且久未更新」里挑 1-3 个工具做内容复查。');
  md.push('- 对「2. 没有教程」的工具，优先补 getting-started 教程，其次是典型任务 SOP。');
  md.push('- 对「3. 没有模板」的工具，优先补「项目规则 / PR Review / 常用提示词」类模板。');
  md.push('- 维护内容时，优先操作热度高的工具，冷门工具可以降低频率或标注为「低优先级」。');
  md.push('');

  md.push('---');
  md.push('（本页由 scripts/content-scoreboard.mjs 自动生成，如需调整规则请修改脚本后重新运行。）');
  md.push('');

  return `${md.join('\n')}\n`;
}

async function main() {
  const scoreboard = buildScoreboard();

  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }

  fs.writeFileSync(OUT_JSON_PATH, JSON.stringify(scoreboard, null, 2), 'utf8');
  fs.writeFileSync(OUT_MD_PATH, renderMarkdown(scoreboard), 'utf8');

  console.log('[content-scoreboard] JSON written:', path.relative(ROOT, OUT_JSON_PATH));
  console.log('[content-scoreboard] Markdown written:', path.relative(ROOT, OUT_MD_PATH));
}

main().catch((err) => {
  console.error('[content-scoreboard] Failed:', err);
  process.exitCode = 1;
});

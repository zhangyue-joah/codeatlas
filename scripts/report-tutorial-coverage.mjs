import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const TOOLS_DIR = path.join(ROOT, 'src', 'content', 'tools');
const TUTORIALS_DIR = path.join(ROOT, 'src', 'content', 'tutorials');
const WECHAT_HEAT_PATH = path.join(ROOT, 'src', 'config', 'toolWeChatHeat.ts');
const OUT_PATH = path.join(ROOT, 'docs', 'tutorials-coverage-report.md');

const args = process.argv.slice(2);
const SHOULD_DEBUG = args.includes('--debug');

function stripQuotes(value) {
  return String(value || '').replace(/^['"]|['"]$/g, '');
}

function readHeatMapping() {
  const raw = fs.readFileSync(WECHAT_HEAT_PATH, 'utf8');
  const match = raw.match(/export const TOOL_WECHAT_HEAT_SCORE:[^=]*=\s*(\{[\s\S]*?\})\s*;?/);
  if (!match) return {};
  try {
    return JSON.parse(match[1]);
  } catch {
    return {};
  }
}

function readAllTutorials() {
  const files = fs.readdirSync(TUTORIALS_DIR).filter((f) => f.endsWith('.mdx')).sort();
  return files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, '');
    const { data } = matter(fs.readFileSync(path.join(TUTORIALS_DIR, filename), 'utf8'));
    return {
      slug,
      relatedTools: Array.isArray(data.relatedTools) ? data.relatedTools.map(String) : [],
      title: String(data.title || slug),
      type: String(data.type || ''),
    };
  });
}

function readAllTools() {
  const files = fs.readdirSync(TOOLS_DIR).filter((f) => f.endsWith('.mdx')).sort();
  return files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, '');
    const { data } = matter(fs.readFileSync(path.join(TOOLS_DIR, filename), 'utf8'));
    return {
      slug,
      title: stripQuotes(data.titleZh || data.titleEn || data.title || slug),
      category: Array.isArray(data.category) ? data.category.map(String) : [],
    };
  });
}

function renderMarkdown({ generatedAt, topMissing, topCovered }) {
  const md = [];
  md.push('# 教程覆盖报告（自动生成）');
  md.push('');
  md.push(`- Generated at: ${generatedAt}`);
  md.push(`- Data: src/content/tools + src/content/tutorials + src/config/toolWeChatHeat.ts`);
  md.push('- Heat proxy: 微信公众号搜索结果数（Sogou），仅作“优先级参考”。');
  md.push('');

  md.push('## Top 30：高热度但缺少教程的工具');
  md.push('');
  md.push('| Rank | Tool | Heat | Tutorials | Categories |');
  md.push('| ---: | --- | ---: | ---: | --- |');
  for (const [idx, item] of topMissing.entries()) {
    md.push(`| ${idx + 1} | ${item.title} (/tools/${item.slug}) | ${item.heat} | ${item.tutorialCount} | ${item.category.join(', ') || '-'} |`);
  }

  md.push('');
  md.push('## Top 30：高热度且已有教程的工具');
  md.push('');
  md.push('| Rank | Tool | Heat | Tutorials | Example tutorials |');
  md.push('| ---: | --- | ---: | ---: | --- |');
  for (const [idx, item] of topCovered.entries()) {
    md.push(`| ${idx + 1} | ${item.title} (/tools/${item.slug}) | ${item.heat} | ${item.tutorialCount} | ${item.exampleTutorials.join(', ') || '-'} |`);
  }

  md.push('');
  md.push('## 建议补齐的教程类型（人工对照）');
  md.push('');
  md.push('- `getting-started`：高热度工具优先补 1 篇“跑通一次”');
  md.push('- `how-to`：围绕高频任务（写功能/改 Bug/补测试/PR Review/选型）补 1 篇“任务 SOP”');
  md.push('- `automation`：热门组合（MCP/网关/CI）补 1 篇“接入与权限护栏”');
  md.push('');

  return `${md.join('\n')}\n`;
}

async function main() {
  const heat = readHeatMapping();
  const tools = readAllTools();
  const tutorials = readAllTutorials();

  if (SHOULD_DEBUG) {
    console.log(`[debug] heat keys: ${Object.keys(heat).length}`);
    console.log(`[debug] tools: ${tools.length}, tutorials: ${tutorials.length}`);
  }

  const tutorialsByTool = new Map();
  for (const t of tutorials) {
    for (const toolSlug of t.relatedTools) {
      if (!tutorialsByTool.has(toolSlug)) tutorialsByTool.set(toolSlug, []);
      tutorialsByTool.get(toolSlug).push(t.slug);
    }
  }

  const ranked = tools
    .map((tool) => {
      const relatedTutorials = tutorialsByTool.get(tool.slug) || [];
      const tutorialCount = relatedTutorials.length;
      const exampleTutorials = relatedTutorials.slice(0, 3);
      return {
        ...tool,
        heat: typeof heat[tool.slug] === 'number' ? heat[tool.slug] : 0,
        tutorialCount,
        exampleTutorials,
      };
    })
    .sort((a, b) => b.heat - a.heat || a.slug.localeCompare(b.slug));

  const topMissing = ranked.filter((item) => item.heat > 0 && item.tutorialCount === 0).slice(0, 30);
  const topCovered = ranked.filter((item) => item.heat > 0 && item.tutorialCount > 0).slice(0, 30);

  if (SHOULD_DEBUG) {
    console.log(`[debug] missing: ${topMissing.length}, covered: ${topCovered.length}`);
    console.log('[debug] top missing sample:', topMissing.slice(0, 5).map((x) => `${x.slug}:${x.heat}`));
    console.log('[debug] top covered sample:', topCovered.slice(0, 5).map((x) => `${x.slug}:${x.heat}(${x.tutorialCount})`));
  }

  fs.writeFileSync(
    OUT_PATH,
    renderMarkdown({
      generatedAt: new Date().toISOString(),
      topMissing,
      topCovered,
    }),
    'utf8'
  );
  console.log(`Report written: ${path.relative(ROOT, OUT_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

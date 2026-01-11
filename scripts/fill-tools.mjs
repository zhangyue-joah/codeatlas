import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const TOOLS_DIR = path.join(ROOT, 'src', 'content', 'tools');
const LOGOS_DIR = path.join(ROOT, 'public', 'logos');
const DEFAULT_LOGO_PUBLIC_PATH = '/logos/default.svg';
const SEED_PATH = path.join(ROOT, 'scripts', 'tools.seed.json');

function isoDateToday() {
  return new Date().toISOString().slice(0, 10);
}

function isoYearMonth() {
  return new Date().toISOString().slice(0, 7);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function toYamlScalar(value) {
  if (value === undefined) return undefined;
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (typeof value !== 'string') return JSON.stringify(value);
  if (value === '') return "''";
  // 防止 YAML 把形如 2025-12-28 / 2025-12 解析为 Date 类型（gray-matter 会返回 Date 而不是 string）
  if (/^\d{4}-\d{2}(-\d{2})?$/.test(value)) return JSON.stringify(value);
  const safePlain = /^[a-zA-Z0-9_./-]+$/.test(value);
  return safePlain ? value : JSON.stringify(value);
}

function renderYamlKeyValue(key, value, indent) {
  const pad = '  '.repeat(indent);
  if (value === undefined) return [];

  if (Array.isArray(value)) {
    const filtered = value.filter((item) => item !== undefined);
    if (filtered.length === 0) return [`${pad}${key}: []`];
    const lines = [`${pad}${key}:`];
    for (const item of filtered) {
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

function renderFrontmatter(frontmatterEntries) {
  const lines = ['---'];
  for (const [key, value] of frontmatterEntries) {
    lines.push(...renderYamlKeyValue(key, value, 0));
  }
  lines.push('---');
  return lines.join('\n');
}

function normalizeTool(seed) {
  const updatedAt = seed.updatedAt ?? isoDateToday();
  const version = seed.version ?? isoYearMonth();
  const title = seed.title?.trim();
  const slug = seed.slug?.trim();
  const website = seed.website?.trim();
  const description = seed.description?.trim();

  if (!slug) throw new Error('seed.slug 缺失');
  if (!title) throw new Error(`tools/${slug}: title 缺失`);
  if (!website) throw new Error(`tools/${slug}: website 缺失`);
  if (!description) throw new Error(`tools/${slug}: description 缺失`);

  const productType = Array.isArray(seed.productType) ? seed.productType : [];
  const category = Array.isArray(seed.category) ? seed.category : [];
  const capabilities = Array.isArray(seed.capabilities) ? seed.capabilities : [];

  const targetUsers = seed.targetUsers ?? ['前端', '后端', '全栈'];
  const notFor = seed.notFor ?? ['强内网/离线环境且无法合规接入的团队'];
  const useCases = seed.useCases ?? defaultUseCases(category);
  const pros = seed.pros ?? defaultPros(category);
  const cons = seed.cons ?? defaultCons(category);
  const dependencies = seed.dependencies ?? ['网络可用（按工具策略）', 'Git 基础操作'];

  const pricingModel = seed.pricing?.model ?? guessPricingModel(seed);
  const free = seed.pricing?.free ?? guessFreeTier(seed, pricingModel);

  const pricing = {
    model: pricingModel,
    free,
    startingPrice: seed.pricing?.startingPrice === undefined ? '' : String(seed.pricing.startingPrice),
    currency: seed.pricing?.currency ?? '',
    billingCycle: seed.pricing?.billingCycle ?? 'monthly',
    hasEducation: seed.pricing?.hasEducation ?? false,
    hasTeam: seed.pricing?.hasTeam ?? true,
    hasEnterprise: seed.pricing?.hasEnterprise ?? true,
    supportsInvoice: seed.pricing?.supportsInvoice ?? false,
    supportsContract: seed.pricing?.supportsContract ?? false,
  };

  const purchase = seed.purchase ?? { officialUrl: seed.purchase?.officialUrl ?? website };
  const privacy = {
    dataRetention: seed.privacy?.dataRetention ?? '以官方政策为准',
    localProcessing: seed.privacy?.localProcessing ?? false,
    enterpriseCompliance: seed.privacy?.enterpriseCompliance ?? [],
    policyUrl: seed.privacy?.policyUrl,
    updatedAt: seed.privacy?.updatedAt ?? updatedAt,
  };

  const keywords = seed.keywords ?? Array.from(new Set([title, 'AI 编程', ...category]));

  return {
    slug,
    title,
    description,
    logo: seed.logo ?? DEFAULT_LOGO_PUBLIC_PATH,
    website,
    productType,
    category,
    targetUsers,
    notFor,
    capabilities,
    useCases,
    pros,
    cons,
    onboardingTime: seed.onboardingTime ?? defaultOnboardingTime(productType),
    dependencies,
    externalSystems: seed.externalSystems,
    externalSystemIntegrations: seed.externalSystemIntegrations,
    mcpServers: seed.mcpServers,
    mcpServerExamples: seed.mcpServerExamples,
    pricing,
    purchase,
    privacy,
    relatedTools: seed.relatedTools ?? [],
    relatedTutorials: seed.relatedTutorials ?? [],
    relatedCompares: seed.relatedCompares ?? [],
    updatedAt,
    version,
    featured: seed.featured,
    affiliateLink: seed.affiliateLink,
    affiliateDisclosure: seed.affiliateDisclosure,
    seoTitle: seed.seoTitle,
    seoDescription: seed.seoDescription,
    keywords,
  };
}

function defaultOnboardingTime(productType) {
  if (productType.includes('cli')) return '20-40 分钟';
  if (productType.includes('ide')) return '30-60 分钟';
  if (productType.includes('ide-extension')) return '10-20 分钟';
  return '10-30 分钟';
}

function defaultUseCases(category) {
  if (category.includes('devops')) {
    return ['作为编程工具/Agent 的模型后端或聚合入口', '统一管理模型调用、权限与成本', '为团队接入提供更可控的工程化路径'];
  }
  if (category.includes('code-review')) {
    return ['PR Review：基于 diff 与上下文给建议', '风险提示：潜在 bug/安全问题/一致性问题（需人工复核）', '变更摘要：帮助团队快速理解改动'];
  }
  if (category.includes('testing')) {
    return ['生成/补齐单元测试与边界用例（需验证）', '基于现有测试定位回归与风险点', '质量门禁建议：把“可验证”作为默认交付'];
  }
  if (category.includes('agent-coding')) {
    return ['从需求到 PR：拆任务、写代码、补测试、整理提交信息', '复杂重构：小步改动 + 自动化回归检查', '脚手架/样板生成：快速落地可运行版本'];
  }
  if (category.includes('repo-chat')) {
    return ['仓库问答：快速定位相关模块与入口', '代码理解：解释调用链与关键逻辑', '方案建议：输出可执行的改动计划'];
  }
  return ['日常编码补全：函数/样板代码/常见模式快速生成', '代码理解辅助：读代码时给出解释与建议', '重构建议：提供更清晰/更安全的实现思路'];
}

function defaultPros(category) {
  if (category.includes('devops')) return ['统一入口，方便多工具复用', '更适合团队做权限、审计与成本治理', '可作为多模型策略的抽象层'];
  if (category.includes('agent-coding')) return ['更偏向“把事情做完”的闭环体验', '能把多步操作串成工作流', '适合复杂改动与重构场景'];
  if (category.includes('repo-chat')) return ['更适合大仓库/多模块的理解与定位', '上下文能力更强，回答更贴近代码', '适合团队协作与知识沉淀'];
  return ['集成成本低，上手快', '适合把 AI 当作日常底座能力', '覆盖常见开发场景'];
}

function defaultCons(category) {
  if (category.includes('devops')) return ['合规与数据策略需要结合具体模型/地区核对', '成本与性能取决于调用模式与模型选择', '需要团队做好密钥与权限管理'];
  if (category.includes('agent-coding')) return ['权限与执行能力强，团队使用需要明确边界与审核', '复杂任务仍需要人类把关与验收', '价格/能力随版本变化，需要定期核对'];
  return ['关键代码仍需测试/审查作为最终准入', '不同语言/项目的效果存在波动', '团队落地需要关注权限、审计与数据策略'];
}

function guessPricingModel(seed) {
  const slug = String(seed.slug || '');
  if (slug === 'continue' || slug === 'aider' || slug === 'swe-agent' || slug === 'openhands') return 'free';
  if (seed.category?.includes('devops')) return 'usage-based';
  return 'freemium';
}

function guessFreeTier(seed, model) {
  if (model === 'free') return true;
  const slug = String(seed.slug || '');
  if (slug === 'codeium' || slug === 'continue') return true;
  return false;
}

function buildBody(tool) {
  return [
    '',
    '## 补充说明（可选）',
    '',
    '- 可补充：实操流程、截图/GIF、与同类对比、团队落地注意事项、FAQ 等。',
    '- 建议写“可验证”的信息：具体步骤、命令、日志、验收标准。',
    '',
  ].join('\n');
}

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    overwrite: args.has('--overwrite'),
    dryRun: args.has('--dry-run'),
    regenerateBody: args.has('--regenerate-body'),
  };
}

function ensureDefaultLogo() {
  ensureDir(LOGOS_DIR);
  const defaultLogoFile = path.join(LOGOS_DIR, 'default.svg');
  if (fs.existsSync(defaultLogoFile)) return;
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">',
    '  <defs>',
    '    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">',
    '      <stop offset="0" stop-color="#0ea5e9" />',
    '      <stop offset="1" stop-color="#a855f7" />',
    '    </linearGradient>',
    '  </defs>',
    '  <rect x="10" y="10" width="108" height="108" rx="24" fill="url(#g)" />',
    '  <path d="M40 78V50c0-6.6 5.4-12 12-12h24c6.6 0 12 5.4 12 12v28c0 6.6-5.4 12-12 12H52c-6.6 0-12-5.4-12-12Z" fill="rgba(255,255,255,0.18)" />',
    '  <path d="M54 54h20M54 66h28M54 78h16" stroke="white" stroke-width="6" stroke-linecap="round" />',
    '</svg>',
    '',
  ].join('\n');
  fs.writeFileSync(defaultLogoFile, svg, 'utf8');
}

function main() {
  const { overwrite, dryRun, regenerateBody } = parseArgs(process.argv);
  ensureDir(TOOLS_DIR);
  ensureDefaultLogo();

  const seeds = readJson(SEED_PATH);
  if (!Array.isArray(seeds)) throw new Error('tools.seed.json 必须为数组');

  let created = 0;
  let skipped = 0;
  let updated = 0;

  for (const seed of seeds) {
    const tool = normalizeTool(seed);
    const filePath = path.join(TOOLS_DIR, `${tool.slug}.mdx`);
    const exists = fs.existsSync(filePath);
    if (exists && !overwrite) {
      skipped += 1;
      continue;
    }

    let body = buildBody(tool);
    if (exists && overwrite && !dryRun && !regenerateBody) {
      const existing = fs.readFileSync(filePath, 'utf8');
      const parsed = matter(existing);
      const preservedBody = typeof parsed.content === 'string' ? parsed.content : '';
      if (preservedBody.trim()) {
        body = preservedBody.startsWith('\n') ? preservedBody : `\n\n${preservedBody}`;
      }
    }

    const frontmatterEntries = [
      ['slug', tool.slug],
      ['title', tool.title],
      ['description', tool.description],
      ['logo', tool.logo],
      ['website', tool.website],
      ['productType', tool.productType],
      ['category', tool.category],
      ['targetUsers', tool.targetUsers],
      ['notFor', tool.notFor],
      ['capabilities', tool.capabilities],
      ['useCases', tool.useCases],
      ['pros', tool.pros],
      ['cons', tool.cons],
      ['onboardingTime', tool.onboardingTime],
      ['dependencies', tool.dependencies],
      ...(tool.externalSystems ? [['externalSystems', tool.externalSystems]] : []),
      ...(tool.externalSystemIntegrations ? [['externalSystemIntegrations', tool.externalSystemIntegrations]] : []),
      ...(tool.mcpServers ? [['mcpServers', tool.mcpServers]] : []),
      ...(tool.mcpServerExamples ? [['mcpServerExamples', tool.mcpServerExamples]] : []),
      ['pricing', tool.pricing],
      ...(tool.purchase ? [['purchase', tool.purchase]] : []),
      ['privacy', tool.privacy],
      ['relatedTools', tool.relatedTools],
      ['relatedTutorials', tool.relatedTutorials],
      ['relatedCompares', tool.relatedCompares],
      ['updatedAt', tool.updatedAt],
      ['version', tool.version],
      ...(tool.featured !== undefined ? [['featured', tool.featured]] : []),
      ...(tool.affiliateLink ? [['affiliateLink', tool.affiliateLink]] : []),
      ...(tool.affiliateDisclosure ? [['affiliateDisclosure', tool.affiliateDisclosure]] : []),
      ...(tool.seoTitle ? [['seoTitle', tool.seoTitle]] : []),
      ...(tool.seoDescription ? [['seoDescription', tool.seoDescription]] : []),
      ['keywords', tool.keywords],
    ];

    const mdx = `${renderFrontmatter(frontmatterEntries)}\n${body}`;
    if (!dryRun) fs.writeFileSync(filePath, mdx, 'utf8');
    if (!exists) created += 1;
    else updated += 1;
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      { ok: true, created, updated, skipped, overwrite, dryRun, regenerateBody, totalSeed: readJson(SEED_PATH).length },
      null,
      2
    )
  );
}

main();

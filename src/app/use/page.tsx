import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import type { Metadata } from 'next';
import { getRequestLanguage, tServer } from '@/i18n/server';
import { t } from '@/i18n/messages';

type TTaskScenario = {
  number: string;
  title: string;
  steps: string[];
  href: string;
  linkLabel: string;
};

export function generateMetadata(): Metadata {
  const language = getRequestLanguage();
  return {
    title: t(language, 'use.page.title'),
    description: t(language, 'use.page.desc'),
  };
}

export default function UsePage() {
  const language = getRequestLanguage();
  const isZh = language === 'zh';
  const scenarios = getTaskScenarios(isZh);

  return (
    <div>
      <PageHeader
        title={tServer('use.page.title')}
        description={tServer('use.page.desc')}
        align="center"
        density="compact"
        headline="description"
      />
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            className="lg:col-span-2"
            title={isZh ? '从任务开始' : 'Start from a task'}
            description={
              isZh
                ? '先说你要做什么，再选工具和教程：写功能、改 Bug、补测试、PR Review、选型和自动化。'
                : 'Start from your goal, then pick tools and guides: build features, fix bugs, add tests, do PR review, choose tools, and set up automation.'
            }
          >
            <div className="space-y-4">
              {scenarios.map((scenario) => (
                <ScenarioItem
                  key={scenario.number}
                  number={scenario.number}
                  title={scenario.title}
                  steps={scenario.steps}
                  href={scenario.href}
                  linkLabel={scenario.linkLabel}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title={isZh ? '站点内容结构' : 'Site structure'}
            description={
              isZh
                ? '如果你想按内容类型浏览（工具 / 教程 / 模板 / 定价），可以从这里进入。'
                : 'If you prefer to browse by content type (tools / guides / templates / pricing), start here.'
            }
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              <FeatureCard
                title={isZh ? '工具库' : 'Tools'}
                description={
                  isZh
                    ? '100+ AI 编程工具的事实页：适合谁、能力边界、价格与隐私。'
                    : '100+ AI coding tools with fit, boundaries, pricing, and privacy notes.'
                }
                href="/tools"
                linkLabel={isZh ? '浏览工具 →' : 'Browse tools →'}
              />
              <FeatureCard
                title={isZh ? '实操教程' : 'Guides'}
                description={
                  isZh
                    ? '按任务分类的 SOP 教程：写功能、改 Bug、补测试、PR Review。'
                    : 'SOP-style guides by task: build features, fix bugs, add tests, and do PR review.'
                }
                href="/tutorials"
                linkLabel={isZh ? '浏览教程 →' : 'Browse guides →'}
              />
              <FeatureCard
                title={isZh ? '模板与规则' : 'Templates & rules'}
                description={
                  isZh
                    ? '提示词、项目规则、配置片段，一键复制即可用在你的 AI 工具里。'
                    : 'Prompts, project rules, and config snippets—copy and paste into your AI tools.'
                }
                href="/templates"
                linkLabel={isZh ? '浏览模板 →' : 'Browse templates →'}
              />
              <FeatureCard
                title={isZh ? '定价与渠道' : 'Pricing & channels'}
                description={
                  isZh
                    ? '官方与第三方渠道价格对比，发票/合同等合规信息汇总。'
                    : 'Official vs third-party pricing, with invoice/contract and compliance notes.'
                }
                href="/buy"
                linkLabel={isZh ? '查看定价 →' : 'View pricing →'}
              />
            </div>
          </SectionCard>

          <SectionCard
            title={isZh ? '快捷功能' : 'Quick features'}
            description={isZh ? '这些小功能可以帮你更快找到合适的内容。' : 'Use these shortcuts to find the right content faster.'}
          >
            <div className="space-y-4">
              <QuickTip
                title={isZh ? '全站搜索' : 'Global search'}
                description={
                  isZh
                    ? '按 ⌘K（Mac）或 Ctrl+K（Windows）打开搜索框，输入工具名或任务关键词即可搜索工具、教程和模板。'
                    : 'Press ⌘K (Mac) or Ctrl+K (Windows) to open search, then type a tool or task keyword to search tools, guides, and templates.'
                }
                kbd="⌘K"
              />
              <QuickTip
                title={isZh ? '筛选与排序' : 'Filter & sort'}
                description={
                  isZh
                    ? '工具、教程和模板列表都有筛选器，可以按类型、难度、工具、能力等维度缩小范围。'
                    : 'Tool, guide, and template lists all have filters so you can narrow by type, difficulty, tools, and capabilities.'
                }
              />
              <QuickTip
                title={isZh ? '语言与主题' : 'Language & theme'}
                description={
                  isZh
                    ? '右上角可以切换中英文和深色/浅色模式，按自己的习惯浏览。'
                    : 'Use the top-right controls to switch language and dark/light mode.'
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            className="lg:col-span-2"
            title={isZh ? '内容与风险说明' : 'Content & risk notes'}
            description={
              isZh
                ? '在用本导航站做决策前，可以先看一眼这几条。'
                : 'Before you rely on this navigation to decide, quickly scan these notes.'
            }
          >
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>
                {isZh
                  ? '工具信息主要来自官方文档，我们会标注来源和更新时间，但价格和条款可能随时变化，请以官方为准。'
                  : 'Tool information comes mainly from official docs with sources and update dates, but pricing and terms may change—always verify with official sources.'}
              </li>
              <li>
                {isZh
                  ? '教程都经过实际验证，每篇都有验收标准和常见问题修复，用前可先看一眼验收标准。'
                  : 'Guides are tested in practice and ship with acceptance criteria and common fixes—check them before you follow a guide.'}
              </li>
              <li>
                {isZh
                  ? '购买链接仅用于跳转，不参与任何交易；涉及发票/合同/合规时，请按照你所在团队/公司的流程审批。'
                  : 'Purchase links only redirect; we do not process any payments. For invoices/contracts/compliance, follow your team or company approval process.'}
              </li>
              <li>
                {isZh
                  ? '如发现信息过时或错误，欢迎在 GitHub 仓库提 Issue 或 PR，我们会在内容迭代看板中优先处理。'
                  : 'If you find outdated or incorrect info, please open an issue or PR in the GitHub repo—we prioritise these via the content iteration scoreboard.'}
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function getTaskScenarios(isZh: boolean): TTaskScenario[] {
  if (isZh) {
    return [
      {
        number: '1',
        title: '写功能：从需求到可提交改动',
        steps: [
          '先选 1 个主力工具（如 Cursor / Claude Code / GitHub Copilot）',
          '在「教程」里按任务筛选，选择“写功能”相关教程',
          '根据教程里的验收标准，完成一次可提交的改动',
        ],
        href: '/tutorials?task=write',
        linkLabel: '查看写功能教程 →',
      },
      {
        number: '2',
        title: '改 Bug：用 AI 辅助排查和修复',
        steps: [
          '收集复现步骤和报错日志，保证问题可复现',
          '打开《AI 修 Bug 工作流》教程，按步骤让 AI 分析原因',
          '应用最小修复方案，并用项目里的测试/构建命令验证',
        ],
        href: '/tutorials/ai-bug-fixing-workflow',
        linkLabel: '打开修 Bug 工作流 →',
      },
      {
        number: '3',
        title: '补测试：提升回归保护',
        steps: [
          '明确要保护的模块/函数以及预期行为',
          '打开《AI 补测试工作流》教程，按 SOP 生成测试用例',
          '运行测试命令，记录结果并根据需要迭代用例',
        ],
        href: '/tutorials/ai-testing-workflow',
        linkLabel: '打开补测试工作流 →',
      },
      {
        number: '4',
        title: 'PR Review：用 AI 做辅助审查',
        steps: [
          '选择合适的 AI 工具（如 PR-Agent / CodeRabbit / Claude Code）',
          '复制 PR Review 模板，补齐 PR 链接、验收标准和验证命令',
          '按“必须改 / 建议改”分类处理，再决定是否合并',
        ],
        href: '/tutorials/ai-pr-review-workflow',
        linkLabel: '打开 PR Review 工作流 →',
      },
      {
        number: '5',
        title: '选工具：先看 AI 编程产品地图',
        steps: [
          '打开《AI 编程产品地图》，先整体了解主流工具分布',
          '结合你的任务和习惯，缩小到 1–3 个候选工具',
          '进入对应工具页，看“适合谁 / 能力边界 / 购买建议”',
        ],
        href: '/tutorials/ai-coding-product-map',
        linkLabel: '查看 AI 编程产品地图 →',
      },
      {
        number: '6',
        title: '模型渠道与自动化：选 API / 网关 / 自托管',
        steps: [
          '打开《LLM 渠道与网关》教程，确认你打算走哪种接入方式',
          '结合团队的发票/合同/合规需求，从「定价」页选择合适渠道',
          '再用 MCP/模板等方式，把选好的渠道接入到实际工作流',
        ],
        href: '/tutorials/llm-api-providers-and-gateways',
        linkLabel: '查看渠道与网关指南 →',
      },
    ];
  }

  return [
    {
      number: '1',
      title: 'Build features: from requirement to PR',
      steps: [
        'Pick one main tool (e.g. Cursor / Claude Code / GitHub Copilot)',
        'On the Guides page, filter by task and pick a "Build features" tutorial',
        'Follow the acceptance criteria in the guide and ship one small, reviewable change',
      ],
      href: '/tutorials?task=write',
      linkLabel: 'Browse feature guides →',
    },
    {
      number: '2',
      title: 'Fix bugs with AI assistance',
      steps: [
        'Collect repro steps and error logs so the bug is reproducible',
        'Open the "AI bug-fixing workflow" guide and follow it step by step',
        'Apply the minimal fix and run your project tests or build command to verify',
      ],
      href: '/tutorials/ai-bug-fixing-workflow',
      linkLabel: 'Open bug-fixing workflow →',
    },
    {
      number: '3',
      title: 'Add tests and strengthen regression safety',
      steps: [
        'Decide which module/function you want to protect with tests',
        'Open the "AI testing workflow" guide and generate test cases with AI',
        'Run your test command, record results, and iterate on cases if needed',
      ],
      href: '/tutorials/ai-testing-workflow',
      linkLabel: 'Open testing workflow →',
    },
    {
      number: '4',
      title: 'PR review with AI as a co-reviewer',
      steps: [
        'Pick an AI review tool (PR-Agent, CodeRabbit, Claude Code, etc.)',
        'Copy the PR review template and fill in the PR link, acceptance criteria, and verification command',
        'Process "must fix" vs "nice to have" items before deciding to merge',
      ],
      href: '/tutorials/ai-pr-review-workflow',
      linkLabel: 'Open PR review workflow →',
    },
    {
      number: '5',
      title: 'Choose tools using the AI coding product map',
      steps: [
        'Open the "AI coding product map" guide to see the overall landscape',
        'Narrow down to 1–3 candidate tools based on your task and preferences',
        'Open each tool page to check fit, boundaries, and buying suggestions',
      ],
      href: '/tutorials/ai-coding-product-map',
      linkLabel: 'Open AI coding product map →',
    },
    {
      number: '6',
      title: 'Pick model channels and automation: API, gateway, or self-hosted',
      steps: [
        'Open the "LLM API providers and gateways" guide to decide how you want to connect models',
        'Use the Pricing page to choose channels that match your invoicing/contract/compliance needs',
        'Wire the chosen channel into your workflow using MCP and templates where appropriate',
      ],
      href: '/tutorials/llm-api-providers-and-gateways',
      linkLabel: 'Open providers & gateways guide →',
    },
  ];
}

function FeatureCard({
  title,
  description,
  href,
  linkLabel,
}: {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="font-semibold text-card-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <Link href={href} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
        {linkLabel}
      </Link>
    </div>
  );
}

function ScenarioItem({
  number,
  title,
  steps,
  href,
  linkLabel,
}: {
  number: string;
  title: string;
  steps: string[];
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {number}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-foreground">{title}</h4>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <Link href={href} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            {linkLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}

function QuickTip({ title, description, kbd }: { title: string; description: string; kbd?: string }) {
  return (
    <div className="flex items-start gap-3">
      {kbd && (
        <kbd className="shrink-0 rounded border border-border bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
          {kbd}
        </kbd>
      )}
      <div className={kbd ? '' : 'pl-0'}>
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

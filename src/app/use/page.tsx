import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import type { Metadata } from 'next';
import { getRequestLanguage, tServer } from '@/i18n/server';
import { t } from '@/i18n/messages';

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
          {/* 网站是什么 */}
          <SectionCard
            className="lg:col-span-2"
            title={isZh ? '这个网站是什么' : 'What is CodeAtlas'}
            description={isZh ? 'CodeAtlas 帮你选对 AI 编程工具、学会怎么用、避免踩坑。' : 'CodeAtlas helps you pick the right AI coding tools, learn how to use them, and avoid pitfalls.'}
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                title={isZh ? '工具库' : 'Tools'}
                description={isZh ? '100+ AI 编程工具的事实页：适合谁、能力边界、定价。' : '100+ AI coding tools: fit, capabilities, pricing.'}
                href="/tools"
                linkLabel={isZh ? '浏览工具' : 'Browse tools'}
              />
              <FeatureCard
                title={isZh ? '教程' : 'Tutorials'}
                description={isZh ? '按任务分类的实操指南：写功能、改 Bug、补测试、PR Review。' : 'Task-based guides: write features, fix bugs, add tests, PR review.'}
                href="/tutorials"
                linkLabel={isZh ? '浏览教程' : 'Browse tutorials'}
              />
              <FeatureCard
                title={isZh ? '模板' : 'Templates'}
                description={isZh ? '提示词、规则、配置片段，一键复制即用。' : 'Prompts, rules, config snippets—copy and use.'}
                href="/templates"
                linkLabel={isZh ? '浏览模板' : 'Browse templates'}
              />
              <FeatureCard
                title={isZh ? '购买指南' : 'Pricing'}
                description={isZh ? '官方与第三方渠道价格对比，合规与风险提示。' : 'Official vs third-party pricing, compliance & risk notes.'}
                href="/buy"
                linkLabel={isZh ? '查看购买' : 'View pricing'}
              />
            </div>
          </SectionCard>

          {/* 典型使用场景 */}
          <SectionCard
            title={isZh ? '典型使用场景' : 'Typical use cases'}
            description={isZh ? '根据你的目标，选择最短路径。' : 'Pick the shortest path based on your goal.'}
          >
            <div className="space-y-4">
              <ScenarioItem
                number="1"
                title={isZh ? '我是新手，不知道选什么工具' : "I'm new, not sure which tool to pick"}
                steps={isZh
                  ? ['去「工具」页，按产品类型筛选', '看「适合谁」和「能力边界」', '选一个入门教程跑通一次']
                  : ['Go to Tools, filter by product type', 'Check "Best for" and "Capabilities"', 'Pick a getting-started tutorial']
                }
                href="/tools"
                linkLabel={isZh ? '去选工具 →' : 'Pick a tool →'}
              />
              <ScenarioItem
                number="2"
                title={isZh ? '我已经有工具，想学怎么用' : 'I have a tool, want to learn how to use it'}
                steps={isZh
                  ? ['去「教程」页，按工具或任务筛选', '跟着教程做一遍', '遇到问题看「常见失败 & 修复」']
                  : ['Go to Tutorials, filter by tool or task', 'Follow the tutorial step by step', 'Check "Common failures & fixes" if stuck']
                }
                href="/tutorials"
                linkLabel={isZh ? '去看教程 →' : 'Browse tutorials →'}
              />
              <ScenarioItem
                number="3"
                title={isZh ? '我想复制一个现成的配置/规则' : 'I want to copy a ready-made config/rule'}
                steps={isZh
                  ? ['去「模板」页，按类型筛选', '点击「一键复制」', '按说明填入变量']
                  : ['Go to Templates, filter by type', 'Click "Copy"', 'Fill in variables as instructed']
                }
                href="/templates"
                linkLabel={isZh ? '去找模板 →' : 'Find templates →'}
              />
            </div>
          </SectionCard>

          {/* 快捷功能 */}
          <SectionCard
            title={isZh ? '快捷功能' : 'Quick features'}
            description={isZh ? '提升效率的小技巧。' : 'Tips to boost your efficiency.'}
          >
            <div className="space-y-4">
              <QuickTip
                title={isZh ? '全站搜索' : 'Global search'}
                description={isZh
                  ? '按 ⌘K（Mac）或 Ctrl+K（Windows）打开搜索框，输入关键词即可搜索工具、教程、模板。'
                  : 'Press ⌘K (Mac) or Ctrl+K (Windows) to open search. Type keywords to find tools, tutorials, templates.'}
                kbd="⌘K"
              />
              <QuickTip
                title={isZh ? '筛选与排序' : 'Filter & sort'}
                description={isZh
                  ? '每个列表页都有筛选器，可以按类型、难度、工具等维度缩小范围。'
                  : 'Every list page has filters. Narrow down by type, difficulty, tool, etc.'}
              />
              <QuickTip
                title={isZh ? '语言切换' : 'Language toggle'}
                description={isZh
                  ? '点击右上角的语言按钮，可以切换中英文界面。'
                  : 'Click the language button in the top right to switch between Chinese and English.'}
              />
              <QuickTip
                title={isZh ? '深色模式' : 'Dark mode'}
                description={isZh
                  ? '点击右上角的主题按钮，可以切换深色/浅色模式。'
                  : 'Click the theme button in the top right to toggle dark/light mode.'}
              />
            </div>
          </SectionCard>

          {/* 内容更新 */}
          <SectionCard
            className="lg:col-span-2"
            title={isZh ? '内容说明' : 'Content notes'}
            description={isZh ? '关于本站内容的一些说明。' : 'Some notes about the content on this site.'}
          >
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>{isZh ? '所有工具信息均来自官方文档，并标注了来源和更新时间。' : 'All tool info comes from official docs, with sources and update dates noted.'}</li>
              <li>{isZh ? '教程内容经过实际验证，每篇都有验收标准和常见问题修复。' : 'Tutorials are tested in practice, each with acceptance criteria and common fixes.'}</li>
              <li>{isZh ? '购买链接仅跳转，本站不参与交易，请以官方信息为准。' : 'Purchase links are redirects only. We don\'t handle transactions—verify with official sources.'}</li>
              <li>{isZh ? '如发现信息过时或错误，欢迎反馈。' : 'If you find outdated or incorrect info, feedback is welcome.'}</li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, href, linkLabel }: { title: string; description: string; href: string; linkLabel: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4">
      <h3 className="font-semibold text-card-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <Link href={href} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
        {linkLabel} →
      </Link>
    </div>
  );
}

function ScenarioItem({ number, title, steps, href, linkLabel }: { number: string; title: string; steps: string[]; href: string; linkLabel: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {number}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-foreground">{title}</h4>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
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

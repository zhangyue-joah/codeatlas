import type { IToolFrontmatter } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { MdxRenderer } from '@/components/mdx/MdxRenderer';
import { getAllCompares, getAllTools, getAllTutorials } from '@/lib/content';
import { DetailLayout } from '@/components/layout/DetailLayout';
import { SectionCard } from '@/components/ui/SectionCard';
import { BackLink } from '@/components/ui/BackLink';
import { PageHeader } from '@/components/ui/PageHeader';
import { OnThisPageNav } from '@/components/ui/OnThisPageNav';
import { ToolActionButtons } from '@/components/tools/ToolActionPanel';
import { RelatedContentCards } from '@/components/content/RelatedContentCards';
import { ToolCapabilitySupport } from '@/components/tools/ToolCapabilitySupport';
import { ToolPurchaseCard } from '@/components/tools/ToolPurchaseCard';
import { formatDate } from '@/lib/utils';
import { getToolDisplayTitle } from '@/lib/toolDisplay';
import { formatToolStartingPrice } from '@/lib/toolPricing';
import { getRequestLanguage } from '@/i18n/server';
import { t } from '@/i18n/messages';
import { buildSearchHref } from '@/utils/query';
import {
  getToolCapabilityLabel,
  getToolCategoryLabel,
  getToolProductTypeLabel,
  getPricingModelLabel,
  getTutorialDifficultyLabel,
  getTutorialTypeLabel,
} from '@/i18n/labels';

interface IToolDetailViewProps {
  tool: IToolFrontmatter;
  content: string;
}

export function ToolDetailView({ tool, content }: IToolDetailViewProps) {
  const language = getRequestLanguage();
  const displayTitle = getToolDisplayTitle(tool, language);
  const hasRelated = tool.relatedTools.length + tool.relatedTutorials.length + tool.relatedCompares.length > 0;
  const introSource = buildToolIntroMdx(tool, language, content);
  const hasIntroContent = introSource.trim().length > 0;

  const onThisPageItems = [
    { href: '#quick-info' as const, label: language === 'en' ? 'Quick Info' : '快速了解' },
    ...(hasIntroContent ? [{ href: '#intro' as const, label: t(language, 'tool.detail.article.title') }] : []),
    { href: '#capability' as const, label: t(language, 'tool.capability.title') },
    { href: '#meta' as const, label: t(language, 'tool.detail.meta.title') },
    ...(hasRelated ? [{ href: '#related' as const, label: t(language, 'tool.detail.related.title') }] : []),
  ];

  return (
    <DetailLayout
      asidePlacement="left"
      asideVariant="narrow"
      main={
        <div className="space-y-8">
          {/* 头部：标题 + 描述 */}
          <PageHeader
            variant="inline"
            title={displayTitle}
            description={tool.description}
            updatedAt={tool.updatedAt}
            version={tool.version}
          />

          {/* 标签 + 操作按钮 */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <ToolBadges tool={tool} language={language} />
            <ToolActionButtons tool={tool} className="sm:ml-auto sm:flex-shrink-0" />
          </div>

          {/* 快速了解卡片 - 最重要的信息 */}
          <ToolQuickInfoCard id="quick-info" tool={tool} language={language} />

          {/* 详细介绍（仅在有内容时显示） */}
          {hasIntroContent && (
            <ToolIntroArticle id="intro" source={introSource} language={language} />
          )}

          {/* 能力支持 */}
          <ToolCapabilitySupport id="capability" tool={tool} language={language} />

          {/* 购买与隐私详情 */}
          <ToolMetaPanel id="meta" tool={tool} language={language} />

          {/* 相关内容 */}
          <ToolRelatedContent id="related" tool={tool} language={language} />
        </div>
      }
      aside={
        <div className="space-y-6 lg:sticky lg:top-24">
          <BackLink href="/tools" label={t(language, 'tool.detail.back')} />
          <OnThisPageNav title={t(language, 'tool.detail.onThisPage.title')} items={onThisPageItems} showTitle={false} />
        </div>
      }
    />
  );
}

/**
 * 快速了解卡片 - 用户最关心的 3 个问题一目了然
 */
function ToolQuickInfoCard({ id, tool, language }: { id?: string; tool: IToolFrontmatter; language: 'zh' | 'en' }) {
  const isZh = language !== 'en';

  // 定价信息
  const pricingModelLabel = getPricingModelLabel(language, tool.pricing.model);
  const startingPrice = formatToolStartingPrice(tool, language);
  const pricingText = startingPrice ? `${pricingModelLabel} · ${startingPrice}` : pricingModelLabel;

  // 隐私信息
  const processingLabel = tool.privacy.localProcessing
    ? (isZh ? '本地处理' : 'Local')
    : (isZh ? '云端处理' : 'Cloud');

  // 上手时间
  const onboardingTime = tool.onboardingTime || (isZh ? '约 5-15 分钟' : '~5-15 min');

  return (
    <div id={id} className="scroll-mt-24 rounded-2xl border border-primary/20 bg-primary/5 p-6">
      <div className="grid gap-6 sm:grid-cols-3">
        {/* 定价 */}
        <div className="text-center sm:text-left">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {isZh ? '定价' : 'Pricing'}
          </div>
          <div className="mt-1 text-lg font-semibold text-foreground">{pricingText}</div>
          {tool.pricing.free && (
            <Badge variant="success" size="sm" className="mt-2">
              {isZh ? '有免费层' : 'Free tier'}
            </Badge>
          )}
        </div>

        {/* 数据处理 */}
        <div className="text-center sm:text-left">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {isZh ? '数据处理' : 'Data'}
          </div>
          <div className="mt-1 text-lg font-semibold text-foreground">{processingLabel}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {tool.privacy.dataRetention || (isZh ? '详见隐私政策' : 'See privacy policy')}
          </div>
        </div>

        {/* 上手时间 */}
        <div className="text-center sm:text-left">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {isZh ? '上手时间' : 'Setup time'}
          </div>
          <div className="mt-1 text-lg font-semibold text-foreground">{onboardingTime}</div>
          {tool.dependencies.length > 0 && (
            <div className="mt-1 text-sm text-muted-foreground">
              {isZh ? '需要：' : 'Requires: '}{tool.dependencies.slice(0, 2).join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToolIntroArticle({
  id,
  source,
  language,
}: {
  id?: string;
  source: string;
  language: 'zh' | 'en';
}) {
  return (
    <SectionCard id={id} title={t(language, 'tool.detail.article.title')} description={t(language, 'tool.detail.article.desc')}>
      <MdxRenderer source={source} variant="inline" />
    </SectionCard>
  );
}

function ToolMetaPanel({ id, tool, language }: { id?: string; tool: IToolFrontmatter; language: 'zh' | 'en' }) {
  return (
    <SectionCard id={id} title={t(language, 'tool.detail.meta.title')} description={t(language, 'tool.detail.meta.desc')}>
      <div className="space-y-4">
        <ToolPurchaseCard id="pricing" tool={tool} language={language} collapsible defaultOpen={false} />
        <ToolPrivacyDisclosure id="privacy" tool={tool} language={language} defaultOpen={false} />
        <ToolOfficialInfoDisclosure id="sources" tool={tool} language={language} defaultOpen={false} />
      </div>
    </SectionCard>
  );
}

function ToolPrivacyDisclosure({
  tool,
  language,
  id,
  defaultOpen,
}: {
  tool: IToolFrontmatter;
  language: 'zh' | 'en';
  id?: string;
  defaultOpen?: boolean;
}) {
  const privacyUpdatedAt = tool.privacy.updatedAt ?? tool.updatedAt;
  const processingLabel = tool.privacy.localProcessing
    ? language === 'en'
      ? 'Local processing'
      : '本地处理'
    : language === 'en'
      ? 'Cloud processing'
      : '云端处理';
  const retention = tool.privacy.dataRetention || t(language, 'common.unknown');
  const summaryText = `${processingLabel} · ${retention}`;

  return (
    <details id={id} open={defaultOpen} className="group rounded-xl border border-border bg-card">
      <summary className="cursor-pointer list-none px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <DisclosureSummary title={t(language, 'tool.detail.privacy.title')} subtitle={summaryText} />
      </summary>
      <div className="px-5 pb-5">
        <dl className="grid gap-3 text-sm">
          <ToolFactRow
            label={t(language, 'tool.detail.privacy.localProcessing')}
            value={tool.privacy.localProcessing ? t(language, 'common.yes') : t(language, 'common.no')}
          />
          <ToolFactRow label={t(language, 'tool.detail.privacy.dataRetention')} value={retention} />
          <ToolFactRow label={t(language, 'tool.detail.privacy.updatedAt')} value={formatDate(privacyUpdatedAt, language)} />
        </dl>
        {tool.privacy.policyUrl && (
          <div className="mt-4 text-sm">
            <a
              className="text-primary underline underline-offset-4"
              href={tool.privacy.policyUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              {t(language, 'tool.detail.privacy.policy')}
            </a>
          </div>
        )}
        {tool.privacy.enterpriseCompliance.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tool.privacy.enterpriseCompliance.map((item) => (
              <Badge key={item} className="bg-muted">
                {item}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

function ToolOfficialInfoDisclosure({
  tool,
  language,
  id,
  defaultOpen,
}: {
  tool: IToolFrontmatter;
  language: 'zh' | 'en';
  id?: string;
  defaultOpen?: boolean;
}) {
  const purchaseUpdatedAt = tool.purchase?.updatedAt ?? tool.updatedAt;
  const privacyUpdatedAt = tool.privacy.updatedAt ?? tool.updatedAt;
  const sources = tool.purchase?.sources ?? [];
  const summaryText =
    sources.length > 0
      ? language === 'en'
        ? `${sources.length} sources`
        : `${sources.length} 条来源`
      : language === 'en'
        ? 'Website · Pricing · Privacy'
        : '官网 · 定价 · 隐私';

  return (
    <details id={id} open={defaultOpen} className="group rounded-xl border border-border bg-card">
      <summary className="cursor-pointer list-none px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <DisclosureSummary title={t(language, 'tool.detail.official.title')} subtitle={summaryText} />
      </summary>
      <div className="px-5 pb-5">
        <p className="text-sm text-muted-foreground">{t(language, 'tool.detail.official.desc')}</p>
        <dl className="mt-4 grid gap-3 text-sm">
          <ToolExternalLinkRow label={t(language, 'tool.detail.official.website')} href={tool.website} language={language} />
          <ToolExternalLinkRow
            label={t(language, 'tool.detail.official.pricing')}
            href={tool.purchase?.officialUrl ?? tool.website}
            language={language}
          />
          {tool.purchase?.authorizedUrl ? (
            <ToolExternalLinkRow
              label={t(language, 'tool.detail.official.authorized')}
              href={tool.purchase.authorizedUrl}
              language={language}
            />
          ) : null}
          {tool.privacy.policyUrl ? (
            <ToolExternalLinkRow
              label={t(language, 'tool.detail.official.privacyPolicy')}
              href={tool.privacy.policyUrl}
              language={language}
            />
          ) : null}
          <ToolFactRow
            label={t(language, 'tool.detail.official.updatedAt')}
            value={formatDate(maxIsoDate(purchaseUpdatedAt, privacyUpdatedAt), language)}
          />
        </dl>

        {sources.length > 0 ? (
          <div className="mt-4">
            <div className="text-sm font-medium text-card-foreground">{t(language, 'tool.detail.official.sources')}</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {sources.slice(0, 6).map((source) => (
                <li key={source.url}>
                  <a className="text-primary underline underline-offset-4" href={source.url} target="_blank" rel="noreferrer noopener">
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </details>
  );
}

function DisclosureSummary({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="font-semibold text-card-foreground">{title}</div>
        <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>
      </div>
      <svg
        className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
      </svg>
    </div>
  );
}

function ToolBadges({ tool, language }: { tool: IToolFrontmatter; language: 'zh' | 'en' }) {
  const visibleCapabilities = tool.capabilities.filter((cap) => cap !== 'mcp-server' && cap !== 'skills-plugins');
  if (tool.productType.length === 0 && tool.category.length === 0 && visibleCapabilities.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tool.productType.map((type) => (
        <Badge key={type}>{getToolProductTypeLabel(language, type)}</Badge>
      ))}
      {tool.category.map((category) => (
        <Badge key={category}>{getToolCategoryLabel(language, category)}</Badge>
      ))}
      {visibleCapabilities.map((capability) => (
        <Badge key={capability} className="bg-muted">
          {getToolCapabilityLabel(language, capability)}
        </Badge>
      ))}
    </div>
  );
}

function ToolRelatedContent({ tool, language, id }: { tool: IToolFrontmatter; language: 'zh' | 'en'; id?: string }) {
  const tools = getAllTools();
  const compares = getAllCompares();
  const tutorials = getAllTutorials();

  const toolBySlug = new Map(tools.map((t) => [t.slug, t]));
  const compareBySlug = new Map(compares.map((c) => [c.slug, c]));
  const tutorialBySlug = new Map(tutorials.map((t) => [t.slug, t]));

  const relatedToolCards = tool.relatedTools
    .map((slug) => toolBySlug.get(slug))
    .filter(isDefined)
    .slice(0, 4)
    .map((item) => {
      const firstCategory = item.frontmatter.category[0];
      return {
        href: `/tools/${item.slug}`,
        title: getToolDisplayTitle(item.frontmatter, language),
        description: item.frontmatter.description,
        badge: (
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-muted">{language === 'en' ? 'Alternative' : '替代工具'}</Badge>
            {firstCategory ? <Badge>{getToolCategoryLabel(language, firstCategory)}</Badge> : null}
          </div>
        ),
      };
    });

  const relatedCompareCards = tool.relatedCompares
    .map((slug) => compareBySlug.get(slug))
    .filter(isDefined)
    .slice(0, 4)
    .map((item) => ({
      href: `/compare/${item.slug}`,
      title: item.frontmatter.title,
      description: item.frontmatter.description,
      badge: (
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-muted">{language === 'en' ? 'Compare' : '对比'}</Badge>
          <Badge className="bg-muted">
            {item.frontmatter.toolA.name} vs {item.frontmatter.toolB.name}
          </Badge>
        </div>
      ),
    }));

  const relatedTutorialCards = tool.relatedTutorials
    .map((slug) => tutorialBySlug.get(slug))
    .filter(isDefined)
    .slice(0, 4)
    .map((item) => ({
      href: `/tutorials/${item.slug}`,
      title: item.frontmatter.title,
      description: item.frontmatter.description,
      badge: (
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-muted">{language === 'en' ? 'Guide' : '教程'}</Badge>
          <Badge>
            {getTutorialTypeLabel(language, item.frontmatter.type)} · {getTutorialDifficultyLabel(language, item.frontmatter.difficulty)}
          </Badge>
        </div>
      ),
    }));

  const combined = [...relatedToolCards, ...relatedCompareCards, ...relatedTutorialCards].slice(0, 10);

  if (combined.length === 0) return null;

  return (
    <SectionCard id={id} className="mt-10" title={t(language, 'tool.detail.related.title')}>
      <RelatedContentCards title={t(language, 'tool.detail.related.title')} items={combined} showTitle={false} />
    </SectionCard>
  );
}

/**
 * 生成工具介绍内容（统一结构）
 * 核心原则：不编造能力，只基于 frontmatter 生成“定位/场景/边界/上手”。
 */
function buildToolIntroMdx(tool: IToolFrontmatter, language: 'zh' | 'en', extraContent: string): string {
  const isZh = language !== 'en';
  const lines: string[] = [];

  const productTypeLabel =
    tool.productType.length > 0
      ? tool.productType.map((type) => getToolProductTypeLabel(language, type)).join(' / ')
      : isZh
        ? '未知'
        : 'Unknown';
  const categoryLabel =
    tool.category.length > 0
      ? tool.category.map((category) => getToolCategoryLabel(language, category)).join(' / ')
      : isZh
        ? '未知'
        : 'Unknown';

  const processingLabel = tool.privacy.localProcessing
    ? (isZh ? '本地处理' : 'Local processing')
    : (isZh ? '云端处理' : 'Cloud processing');
  const retentionLabel = tool.privacy.dataRetention || (isZh ? '详见隐私政策' : 'See privacy policy');

  const highLevelCapabilities: Array<Exclude<
    IToolFrontmatter['capabilities'][number],
    'read-only' | 'read-write' | 'execute'
  >> = ['repo-context', 'agent-execution', 'mcp-server', 'skills-plugins', 'local-command', 'external-system'];
  const enabledHighLevelCapabilities = highLevelCapabilities.filter((capability) => tool.capabilities.includes(capability));
  const enabledHighLevelCapabilityLabel =
    enabledHighLevelCapabilities.length > 0
      ? enabledHighLevelCapabilities.map((capability) => getToolCapabilityLabel(language, capability)).join(' / ')
      : isZh
        ? '以官方为准'
        : 'See official docs';

  const permission = derivePermissionLevel(tool.capabilities);
  const permissionLabel = permission ? getToolCapabilityLabel(language, permission) : (isZh ? '未知' : 'Unknown');

  // 0. 适合用它的一个判断（尽量短，不做营销口号）
  lines.push(`### ${isZh ? '适合用它的一个判断' : 'A quick fit check'}`);
  const primaryUseCase = tool.useCases[0] ? `“${normalizeMdInline(tool.useCases[0])}”` : null;
  const fitLineA = primaryUseCase
    ? isZh
      ? `如果你主要想用它来${primaryUseCase}，并且你愿意在「${productTypeLabel}」里引入 AI 工作流，它通常值得先试跑一个小任务。`
      : `If your main goal is ${primaryUseCase} and you’re happy to adopt an AI workflow in “${productTypeLabel}”, it’s worth trialing with one small task first.`
    : isZh
      ? `如果你想在「${productTypeLabel}」里做「${categoryLabel}」相关工作，它通常值得先试跑一个小任务。`
      : `If you want “${categoryLabel}” in a “${productTypeLabel}” workflow, it’s worth running one small trial task first.`;
  lines.push(fitLineA);
  if (tool.notFor[0]) {
    const notFor = normalizeMdInline(tool.notFor[0]);
    lines.push(isZh ? `如果你属于「${notFor}」，建议先核对隐私/权限边界再决定。` : `If you are “${notFor}”, verify privacy and permission boundaries before committing.`);
  }
  lines.push('');

  // 1. 核心信息（抓重点）
  lines.push(`### ${isZh ? '核心信息（抓重点）' : 'Key facts (fast read)'}`);
  lines.push(`- ${isZh ? '形态' : 'Form factor'}：${productTypeLabel}`);
  lines.push(`- ${isZh ? '主打' : 'Focus'}：${categoryLabel}`);
  lines.push(`- ${isZh ? '能力' : 'Capabilities'}：${enabledHighLevelCapabilityLabel}`);
  lines.push(`- ${isZh ? '权限与数据' : 'Permissions & data'}：${permissionLabel} · ${processingLabel}（${retentionLabel}）`);
  lines.push('');

  // 2. 使用场景（限制 4 个，直接回答"能用来做什么"）
  if (tool.useCases.length > 0) {
    lines.push(`### ${isZh ? '能用来做什么' : 'What can it do'}`);
    lines.push(tool.useCases.slice(0, 4).map((item) => `- ${normalizeMdInline(item)}`).join('\n'));
    lines.push('');
  }

  // 3. 适合谁用（限制 4 个）
  if (tool.targetUsers.length > 0) {
    lines.push(`### ${isZh ? '适合谁用' : 'Who is it for'}`);
    lines.push(tool.targetUsers.slice(0, 4).map((item) => `- ${normalizeMdInline(item)}`).join('\n'));
    lines.push('');
  }

  // 4. 不适合谁（限制 3 个）
  if (tool.notFor.length > 0) {
    lines.push(`### ${isZh ? '不太适合谁' : 'Who should skip it'}`);
    lines.push(tool.notFor.slice(0, 3).map((item) => `- ${normalizeMdInline(item)}`).join('\n'));
    lines.push('');
  }

  // 5. 优点（限制 3 个）
  if (tool.pros.length > 0) {
    lines.push(`### ${isZh ? '优点' : 'Pros'}`);
    lines.push(tool.pros.slice(0, 3).map((item) => `- ${normalizeMdInline(item)}`).join('\n'));
    lines.push('');
  }

  // 6. 局限（限制 3 个）
  if (tool.cons.length > 0) {
    lines.push(`### ${isZh ? '局限' : 'Limitations'}`);
    lines.push(tool.cons.slice(0, 3).map((item) => `- ${normalizeMdInline(item)}`).join('\n'));
    lines.push('');
  }

  // 7. 权限与风险提示（基于能力推导，不写具体功能细节）
  const riskTips = buildToolRiskTips(tool, language);
  if (riskTips.length > 0) {
    lines.push(`### ${isZh ? '权限与风险提示' : 'Permissions & risk notes'}`);
    lines.push(riskTips.map((tip) => `- ${tip}`).join('\n'));
    lines.push('');
  }

  // 8. 最快上手路径（始终给出一个可执行的起点）
  lines.push(`### ${isZh ? '最快上手路径' : 'Fastest way to get started'}`);
  lines.push(buildToolQuickStartSteps(tool, language).join('\n'));
  if (tool.dependencies.length > 0) {
    lines.push('');
    lines.push(isZh ? `**前置依赖**：${tool.dependencies.slice(0, 4).map(normalizeMdInline).join(' / ')}` : `**Prereqs**: ${tool.dependencies.slice(0, 4).map(normalizeMdInline).join(' / ')}`);
  }
  lines.push('');

  // 9. 能力支持进一步阅读
  lines.push(isZh ? `想确认“能不能接进真实工作流”，直接下滑到「[能力支持](#capability)」。` : `For workflow fit, jump to “[Capability support](#capability)”.`);

  // 5. 额外内容（来自 MDX 文件）
  const trimmedExtra = extraContent.trim();
  if (trimmedExtra) {
    lines.push('---');
    lines.push('');
    lines.push(trimmedExtra);
  }

  return lines.join('\n');
}

function normalizeMdInline(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function escapeMarkdownTableCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, '<br />').trim();
}

function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

function buildToolRiskTips(tool: IToolFrontmatter, language: 'zh' | 'en'): string[] {
  const isZh = language !== 'en';
  const tips: string[] = [];
  const permission = derivePermissionLevel(tool.capabilities);

  if (permission === 'execute') {
    tips.push(
      isZh
        ? '具备执行权限：默认开启“执行前确认”，不要在生产/CI 里无审计地自动执行。'
        : 'Has execution permissions: keep “confirm before run” on; avoid unattended auto-run in prod/CI without auditing.'
    );
  } else if (permission === 'read-write') {
    tips.push(
      isZh
        ? '具备写入权限：所有改动都要走 code review 与测试验证，避免大范围误改。'
        : 'Has write permissions: route every change through code review and tests to avoid broad unintended edits.'
    );
  } else if (permission === 'read-only') {
    tips.push(isZh ? '只读权限：适合先用来跑通一个 SOP，再决定是否开放写入/执行。' : 'Read-only: good for a first SOP run before enabling write/execute (if applicable).');
  }

  if (!tool.privacy.localProcessing) {
    tips.push(
      isZh ? '云端处理：先核对隐私政策、数据保留与合规要求，必要时做脱敏/最小化上下文。' : 'Cloud processing: verify privacy, retention, and compliance; consider redaction and minimal context.'
    );
  }

  if (tool.capabilities.includes('external-system')) {
    tips.push(
      isZh
        ? '外部系统集成：遵循最小权限原则（优先只读 Token），明确哪些数据会被读取/写入。'
        : 'External system integrations: follow least privilege (prefer read-only tokens) and clarify what data is read/written.'
    );
  }

  if (tool.capabilities.includes('mcp-server')) {
    tips.push(
      isZh
        ? 'MCP Server：审计 server/工具能力与权限边界；除非你非常确定，否则不要开启自动执行模式。'
        : 'MCP server: audit server/tool capabilities and permission boundaries; avoid auto-execution unless you are very sure.'
    );
  }

  if (tool.capabilities.includes('agent-execution')) {
    tips.push(
      isZh
        ? 'Agent 多步任务：建议拆分验收点；把“提交前的测试/格式化/静态检查”作为默认环节。'
        : 'Multi-step agents: break work into checkpoints; treat tests/formatting/static checks as a default pre-merge step.'
    );
  }

  return tips;
}

function buildToolQuickStartSteps(tool: IToolFrontmatter, language: 'zh' | 'en'): string[] {
  const isZh = language !== 'en';
  const productTypeLabel =
    tool.productType.length > 0
      ? tool.productType.map((type) => getToolProductTypeLabel(language, type)).join(' / ')
      : isZh
        ? '以官网为准'
        : 'See website';

  const officialUrl = tool.purchase?.officialUrl ?? tool.website;

  const steps: string[] = [
    `1. ${isZh ? '从官网确认入口/安装方式与计费信息' : 'Start from the website for setup and pricing'}：[${isZh ? '打开链接' : 'Open'}](${tool.website})`,
    `2. ${isZh ? '选择你的使用入口' : 'Pick your entry point'}：${productTypeLabel}（${isZh ? '按官方指引安装/登录' : 'install/sign in per official docs'}）`,
    `3. ${isZh ? '用一个小任务跑通闭环' : 'Run one small end-to-end task'}（${isZh ? '预计' : 'ETA: '}${normalizeMdInline(tool.onboardingTime || (isZh ? '以官网为准' : 'see docs'))}）`,
  ];

  if (tool.capabilities.includes('repo-context')) {
    steps.push(`4. ${isZh ? '再接入真实仓库上下文' : 'Then connect real repo context'}（${isZh ? '从小范围文件开始' : 'start with a small scope'}）`);
  } else {
    steps.push(`4. ${isZh ? '用真实代码片段验证输出质量' : 'Validate with real code snippets'}（${isZh ? '再逐步扩大范围' : 'expand scope gradually'}）`);
  }

  if (officialUrl && officialUrl !== tool.website) {
    steps.push(`5. ${isZh ? '核对官方购买/定价入口' : 'Verify official pricing/purchase'}：[${isZh ? '打开链接' : 'Open'}](${officialUrl})`);
  }

  if (tool.relatedTutorials.length > 0) {
    steps.push(`6. ${isZh ? '按页面底部“关联教程”跑一个 SOP' : 'Follow one SOP in “Related guides” below'}`);
  }

  return steps;
}

function ToolFactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

function ToolExternalLinkRow({ label, href, language }: { label: string; href: string; language: 'zh' | 'en' }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">
        <a className="text-primary underline underline-offset-4" href={href} target="_blank" rel="noreferrer noopener">
          {t(language, 'common.open')}
        </a>
      </dd>
    </div>
  );
}

function derivePermissionLevel(
  capabilities: IToolFrontmatter['capabilities']
): Extract<IToolFrontmatter['capabilities'][number], 'read-only' | 'read-write' | 'execute'> | null {
  if (capabilities.includes('execute')) return 'execute';
  if (capabilities.includes('read-write')) return 'read-write';
  if (capabilities.includes('read-only')) return 'read-only';
  return null;
}

function maxIsoDate(a: string, b: string): string {
  const aTime = Date.parse(a);
  const bTime = Date.parse(b);
  if (!Number.isFinite(aTime)) return b;
  if (!Number.isFinite(bTime)) return a;
  return aTime >= bTime ? a : b;
}

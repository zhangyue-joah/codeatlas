import Link from 'next/link';
import type { ITemplateFrontmatter, TTemplateType } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { TemplateCopyBox } from '@/components/templates/TemplateCopyBox';
import { MdxRenderer } from '@/components/mdx/MdxRenderer';
import { getAllTutorials } from '@/lib/content';
import { SectionCard } from '@/components/ui/SectionCard';
import { BackLink } from '@/components/ui/BackLink';
import { buildTutorialTitleIndex } from '@/utils/contentIndex';
import { getRequestLanguage } from '@/i18n/server';
import { t } from '@/i18n/messages';
import { getTemplateTypeLabel } from '@/i18n/labels';
import { formatDate } from '@/lib/utils';

interface ITemplateDetailViewProps {
  template: ITemplateFrontmatter;
  content: string;
}

export function TemplateDetailView({ template, content }: ITemplateDetailViewProps) {
  const language = getRequestLanguage();
  const isZh = language !== 'en';
  const tutorials = getAllTutorials();
  const tutorialTitleIndex = buildTutorialTitleIndex(tutorials);
  const relatedTutorialSlugs = template.relatedTutorials.filter((slug) => Boolean(tutorialTitleIndex[slug])).slice(0, 12);
  const hasRelatedTutorials = relatedTutorialSlugs.length > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 返回链接 */}
      <div className="mb-6">
        <BackLink href="/templates" label={t(language, 'template.detail.back')} />
      </div>

      {/* 头部区域 - 借鉴 openmcp.store 设计 */}
      <TemplateDetailHeader template={template} language={language} isZh={isZh} />

      {/* Tab 导航 */}
      <TemplateDetailTabs language={language} isZh={isZh} hasRelatedTutorials={hasRelatedTutorials} />

      {/* 内容区域 */}
      <div className="mt-8 space-y-8">
        {/* 概览区块 */}
        <section id="overview" className="scroll-mt-24">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            {isZh ? `什么是 ${template.title}` : `What is ${template.title}`}
          </h2>
          <p className="text-muted-foreground leading-relaxed">{template.description}</p>

          {/* 关键功能列表 */}
          {template.scenarios && template.scenarios.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                {isZh ? '适用场景' : 'Use Cases'}
              </h3>
              <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
                {template.scenarios.map((scenario, index) => (
                  <li key={index}>{scenario}</li>
                ))}
              </ol>
            </div>
          )}
        </section>

        {/* 使用指南区块 */}
        <section id="guide" className="scroll-mt-24">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            {isZh ? '使用指南' : 'Usage Guide'}
          </h2>

          <div className="grid gap-6 lg:grid-cols-2">
            <div id="copy" className="scroll-mt-24">
              <TemplateCopyBox template={template.template} />
            </div>
            <div id="notes" className="scroll-mt-24">
              <TemplateNotes template={template} />
            </div>
          </div>
        </section>

        {/* 详细说明区块 */}
        <section id="details" className="scroll-mt-24">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            {isZh ? '详细说明' : 'Details'}
          </h2>
          <div className="rounded-2xl border border-border/70 bg-card shadow-card">
            <MdxRenderer source={content} />
          </div>
        </section>

        {/* 相关教程区块 */}
        {hasRelatedTutorials && (
          <TemplateRelatedTutorials tutorialTitleIndex={tutorialTitleIndex} slugs={relatedTutorialSlugs} />
        )}
      </div>
    </div>
  );
}

/**
 * 详情页头部组件 - 借鉴 openmcp.store 设计
 * 大图标 + 标题/标签 + 元信息 + 收藏按钮
 */
function TemplateDetailHeader({
  template,
  language,
  isZh,
}: {
  template: ITemplateFrontmatter;
  language: 'zh' | 'en';
  isZh: boolean;
}) {
  const typeLabel = getTemplateTypeLabel(language, template.type);

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border/70 bg-card p-6 shadow-card sm:flex-row sm:items-start sm:justify-between">
      {/* 左侧：图标 + 信息 */}
      <div className="flex gap-5">
        {/* 大图标 */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-muted/40">
          <TemplateTypeIconLarge type={template.type} />
        </div>

        {/* 信息区 */}
        <div className="min-w-0 flex-1">
          {/* 标题行 */}
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {template.title}
            </h1>
            <Badge variant="outline" className="border-primary/50 text-primary">
              {typeLabel}
            </Badge>
            {template.featured && (
              <Badge variant="success" size="sm">
                {isZh ? '精选' : 'Featured'}
              </Badge>
            )}
          </div>

          {/* 元信息行 */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {template.applicableTools.length > 0 && (
              <>
                <span className="flex items-center gap-1.5">
                  <ToolIcon />
                  {template.applicableTools.slice(0, 3).join(', ')}
                  {template.applicableTools.length > 3 && ` +${template.applicableTools.length - 3}`}
                </span>
                <span className="text-border">|</span>
              </>
            )}
            <span>{isZh ? '更新：' : 'Updated: '}{formatDate(template.updatedAt, language)}</span>
            {template.version && (
              <>
                <span className="text-border">|</span>
                <span>{isZh ? '版本：' : 'Version: '}{template.version}</span>
              </>
            )}
          </div>

          {/* 标签区 */}
          <div className="mt-3 flex flex-wrap gap-2">
            {template.applicableTools.map((tool) => (
              <Badge key={tool} variant="secondary" size="sm">
                {tool}
              </Badge>
            ))}
          </div>

          {/* 描述 */}
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        </div>
      </div>

      {/* 右侧：收藏按钮（占位） */}
      <div className="shrink-0 sm:self-start">
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          title={isZh ? '收藏' : 'Favorite'}
        >
          <HeartIcon />
          <span>{isZh ? '收藏' : 'Favorite'}</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Tab 导航组件 - 借鉴 openmcp.store 设计
 */
function TemplateDetailTabs({
  language,
  isZh,
  hasRelatedTutorials,
}: {
  language: 'zh' | 'en';
  isZh: boolean;
  hasRelatedTutorials: boolean;
}) {
  const tabs = [
    { id: 'overview', label: isZh ? '概览' : 'Overview' },
    { id: 'guide', label: isZh ? '使用指南' : 'Usage Guide' },
    { id: 'details', label: isZh ? '详细说明' : 'Details' },
    ...(hasRelatedTutorials ? [{ id: 'related-tutorials', label: isZh ? '相关教程' : 'Related Tutorials' }] : []),
  ];

  return (
    <div className="mt-6 border-b border-border">
      <nav className="-mb-px flex gap-6" aria-label={isZh ? '内容导航' : 'Content navigation'}>
        {tabs.map((tab, index) => (
          <a
            key={tab.id}
            href={`#${tab.id}`}
            className={`inline-flex items-center border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
              index === 0
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

function TemplateNotes({ template }: { template: ITemplateFrontmatter }) {
  const language = getRequestLanguage();
  return (
    <div className="space-y-4">
      <TemplateSection title={t(language, 'template.detail.notes.usage')} items={[template.description]} />
      <TemplateSection title={t(language, 'template.detail.notes.cautions')} items={template.notes} />
      {template.variables && template.variables.length > 0 && (
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
          <h3 className="font-semibold text-card-foreground">{t(language, 'template.detail.variables')}</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {template.variables.map((v) => (
              <li key={v.name} className="rounded-lg border border-border bg-muted px-3 py-2">
                <div className="font-mono text-xs text-foreground">{v.name}</div>
                <div className="mt-1 text-muted-foreground">{v.description}</div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">{t(language, 'template.detail.example', { example: v.example })}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TemplateSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <SectionCard title={title}>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </SectionCard>
  );
}

function TemplateRelatedTutorials({ slugs, tutorialTitleIndex }: { slugs: string[]; tutorialTitleIndex: Record<string, string> }) {
  const language = getRequestLanguage();
  const isZh = language !== 'en';
  if (slugs.length === 0) return null;

  return (
    <section id="related-tutorials" className="scroll-mt-24">
      <h2 className="mb-4 text-xl font-semibold text-foreground">
        {isZh ? '相关教程' : 'Related Tutorials'}
      </h2>
      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
        <div className="flex flex-wrap gap-3">
          {slugs.map((slug) => (
            <Link
              key={slug}
              href={`/tutorials/${slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:text-primary"
            >
              <BookIcon />
              {tutorialTitleIndex[slug] ?? slug}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========== 图标组件 ========== */

/** 大尺寸模版类型图标 */
function TemplateTypeIconLarge({ type }: { type: TTemplateType }) {
  const iconClassName = 'h-10 w-10 text-muted-foreground';

  switch (type) {
    case 'mcp-config':
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      );
    case 'prompt-recipe':
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      );
    case 'agent-instruction':
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      );
    case 'skill':
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      );
    default:
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      );
  }
}

/** 工具图标 */
function ToolIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
    </svg>
  );
}

/** 收藏心形图标 */
function HeartIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}

/** 书本图标 */
function BookIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

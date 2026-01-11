'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn, formatDate } from '@/lib/utils';
import { buildSearchHref } from '@/utils/query';
import { PillMultiSelect } from '@/components/ui/PillMultiSelect';
import { Badge } from '@/components/ui/Badge';
import { CopyToClipboardButton } from '@/components/ui/CopyToClipboardButton';
import type { ITemplateFrontmatter, TLanguage, TTemplateType } from '@/types';
import { getTemplateTypeLabel } from '@/i18n/labels';

export type TTemplatesListItem = {
  slug: string;
  frontmatter: ITemplateFrontmatter;
};

export type TTemplatesSelectOption = { value: string; label: string };

interface ITemplatesListViewProps {
  language: TLanguage;
  tools: string[];
  type?: string;
  query: string;
  typeOptions: TTemplatesSelectOption[];
  toolOptions: TTemplatesSelectOption[];
  totalCount: number;
  resultCount: number;
  items: TTemplatesListItem[];
}

/**
 * 模版列表页交互视图：筛选工具栏 + 卡片列表。
 * 遵循产品列表页的设计模式。
 */
export function TemplatesListView({
  language,
  tools,
  type,
  query,
  typeOptions,
  toolOptions,
  totalCount,
  resultCount,
  items,
}: ITemplatesListViewProps) {
  const router = useRouter();
  const isZh = language !== 'en';

  const [draftQuery, setDraftQuery] = useState(query);

  useEffect(() => {
    setDraftQuery(query);
  }, [query]);

  const resultsLabel =
    totalCount > resultCount
      ? isZh
        ? `${resultCount} / ${totalCount} 个结果`
        : `${resultCount}/${totalCount} ${resultCount === 1 ? 'result' : 'results'}`
      : isZh
        ? `${resultCount} 个结果`
        : `${resultCount} ${resultCount === 1 ? 'result' : 'results'}`;

  const activeCount =
    (tools.length > 0 ? 1 : 0) +
    (type ? 1 : 0) +
    (draftQuery.trim() ? 1 : 0);

  const pushFilters = (
    next: Partial<{
      tools: string[];
      type: string;
      q: string;
    }>,
    replace = false
  ) => {
    const nextTools = next.tools ?? tools;
    const nextType = next.type ?? type;
    const nextQuery = next.q ?? draftQuery;

    const href = buildSearchHref('/templates', {
      tools: nextTools.length > 0 ? nextTools : undefined,
      type: nextType || undefined,
      q: nextQuery.trim() || undefined,
    });

    if (replace) router.replace(href);
    else router.push(href);
  };

  // 搜索框防抖
  useEffect(() => {
    const normalized = draftQuery.trim();
    const current = query.trim();
    if (normalized === current) return;
    const id = window.setTimeout(() => {
      router.replace(
        buildSearchHref('/templates', {
          tools: tools.length > 0 ? tools : undefined,
          type: type || undefined,
          q: normalized || undefined,
        })
      );
    }, 250);
    return () => window.clearTimeout(id);
  }, [draftQuery, query, router, tools, type]);

  /** 点击工具标签时添加到筛选 */
  const handleFilterByTool = (toolSlug: string) => {
    if (!tools.includes(toolSlug)) {
      pushFilters({ tools: [...tools, toolSlug] });
    }
  };

  /** 点击类型标签时添加到筛选 */
  const handleFilterByType = (templateType: string) => {
    if (type !== templateType) {
      pushFilters({ type: templateType });
    }
  };

  return (
    <div className="space-y-1.5">
      {/* 筛选区域 - 与产品列表页保持一致 */}
      <div className="rounded-2xl bg-muted/30 p-4 ring-1 ring-border/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* 左侧：筛选器组 */}
          <div className="flex flex-wrap items-center gap-2">
            <PillMultiSelect
              label={isZh ? '类型' : 'Type'}
              values={type ? [type] : []}
              options={typeOptions}
              emptyLabel={isZh ? '全部' : 'Any'}
              clearLabel={isZh ? '清空' : 'Clear'}
              maxSelected={1}
              onChange={(values) => pushFilters({ type: values[0] || '' })}
              active={!!type}
            />
            <PillMultiSelect
              label={isZh ? '工具' : 'Tools'}
              values={tools}
              options={toolOptions}
              emptyLabel={isZh ? '不限' : 'Any'}
              clearLabel={isZh ? '清空' : 'Clear'}
              onChange={(values) => pushFilters({ tools: values })}
              active={tools.length > 0}
            />
            {/* 搜索框 */}
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <SearchIcon />
              </span>
              <input
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                placeholder={isZh ? '搜索模版...' : 'Search templates...'}
                aria-label={isZh ? '搜索模版' : 'Search templates'}
                className="h-9 w-full rounded-full border border-input bg-background pl-9 pr-8 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring sm:w-[200px]"
              />
              {draftQuery.trim() && (
                <button
                  type="button"
                  onClick={() => setDraftQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={isZh ? '清空搜索' : 'Clear search'}
                >
                  <ClearIcon />
                </button>
              )}
            </div>
          </div>

          {/* 右侧：结果信息 + 重置按钮 */}
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 items-center px-1 text-xs font-medium text-muted-foreground select-none">
              {resultsLabel}
            </span>
            {/* 重置按钮 - 仅在有筛选时显示 */}
            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setDraftQuery('');
                  pushFilters({ tools: [], type: '', q: '' });
                }}
                className="inline-flex h-8 items-center justify-center rounded-full px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {isZh ? '重置' : 'Reset'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 模版列表 */}
      <ul role="list" className="space-y-4">
        {items.map((item) => (
          <li key={item.slug}>
            <TemplatesListItemCard
              language={language}
              templateSlug={item.slug}
              template={item.frontmatter}
              onFilterByTool={handleFilterByTool}
              onFilterByType={handleFilterByType}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ITemplatesListItemCardProps {
  language: TLanguage;
  templateSlug: string;
  template: ITemplateFrontmatter;
  /** 点击工具标签时的筛选回调 */
  onFilterByTool?: (tool: string) => void;
  /** 点击类型标签时的筛选回调 */
  onFilterByType?: (type: string) => void;
}

/**
 * 模版列表项卡片 - 遵循产品列表页卡片设计。
 */
function TemplatesListItemCard({
  language,
  templateSlug,
  template,
  onFilterByTool,
  onFilterByType,
}: ITemplatesListItemCardProps) {
  const isZh = language !== 'en';
  const typeLabel = getTemplateTypeLabel(language, template.type);
  const applicableTools = template.applicableTools ?? [];
  const firstTool = applicableTools[0];

  /** 处理标签点击，阻止事件冒泡到父级 Link */
  const handleBadgeClick = (e: React.MouseEvent, callback?: () => void) => {
    if (callback) {
      e.preventDefault();
      e.stopPropagation();
      callback();
    }
  };

  const cardClassName = cn(
    'relative block rounded-2xl border border-border/70 bg-card p-5 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:p-6'
  );

  return (
    <Link href={`/templates/${templateSlug}`} className={cardClassName}>
      {/* 头部区域：标题 + 类型标签 */}
      <div className="flex items-start gap-3.5">
        {/* 图标容器 - 使用模版类型图标 */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-muted/60">
          <TemplateTypeIcon type={template.type} />
        </div>
        <div className="min-w-0 flex-1">
          {/* 标题行：标题 + 类型标签在同一行 */}
          <div className="flex items-center gap-2.5">
            <h3 className="truncate text-base font-semibold tracking-tight text-card-foreground sm:text-lg">
              {template.title}
            </h3>
            <Badge
              variant="secondary"
              size="sm"
              onClick={(e) => handleBadgeClick(e, () => onFilterByType?.(template.type))}
              title={onFilterByType ? (isZh ? `筛选：${typeLabel}` : `Filter: ${typeLabel}`) : undefined}
            >
              {typeLabel}
            </Badge>
          </div>
          {/* 描述 */}
          <p className="mt-1.5 min-h-[2.75rem] text-sm leading-relaxed text-muted-foreground/90 line-clamp-2">
            {template.description}
          </p>
        </div>
      </div>

      {/* 标签区域 */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        {firstTool && (
          <Badge
            variant="primary"
            onClick={(e) => handleBadgeClick(e, () => onFilterByTool?.(firstTool))}
            title={onFilterByTool ? (isZh ? `筛选：${firstTool}` : `Filter: ${firstTool}`) : undefined}
          >
            {firstTool}
          </Badge>
        )}
        {applicableTools.length > 1 && (
          <Badge variant="default" size="sm">
            +{applicableTools.length - 1} {isZh ? '工具' : 'tools'}
          </Badge>
        )}
        {template.featured && (
          <Badge variant="success" size="sm">
            {isZh ? '精选' : 'Featured'}
          </Badge>
        )}
      </div>

      {/* 元信息区域 */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-2.5 gap-y-1.5 border-t border-border/50 pt-3.5 text-xs">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span className="text-foreground/60">
            {isZh ? '更新：' : 'Updated: '}
            {formatDate(template.updatedAt, language)}
          </span>
          {template.scenarios && template.scenarios.length > 0 && (
            <>
              <span className="text-border/80" aria-hidden="true">|</span>
              <span className="text-foreground/50">
                {template.scenarios.slice(0, 2).join(isZh ? '、' : ', ')}
              </span>
            </>
          )}
        </div>
        {/* 快速复制按钮 */}
        <div onClick={(e) => e.preventDefault()}>
          <CopyToClipboardButton
            text={template.template}
            copyLabel={isZh ? '复制模版' : 'Copy template'}
            size="sm"
          />
        </div>
      </div>
    </Link>
  );
}

/** 模版类型图标 */
function TemplateTypeIcon({ type }: { type: TTemplateType }) {
  const iconClassName = 'h-5 w-5 text-muted-foreground';

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

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 16.5 21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn, formatDate } from '@/lib/utils';
import { buildSearchHref } from '@/utils/query';
import { PillMultiSelect } from '@/components/ui/PillMultiSelect';
import { PillSelect } from '@/components/ui/PillSelect';
import { Badge } from '@/components/ui/Badge';
import type { ITutorialFrontmatter, TLanguage } from '@/types';
import { getTutorialDifficultyLabel, getTutorialTypeLabel } from '@/i18n/labels';

const DEFAULT_SORT = 'hot';

export type TTutorialsListItem = {
  slug: string;
  frontmatter: ITutorialFrontmatter;
};

export type TTutorialsSelectOption = { value: string; label: string };

interface ITutorialsListViewProps {
  language: TLanguage;
  tools: string[];
  task?: string;
  type?: string;
  sort: string;
  toolOptions: TTutorialsSelectOption[];
  taskOptions: TTutorialsSelectOption[];
  typeOptions: TTutorialsSelectOption[];
  sortOptions: TTutorialsSelectOption[];
  totalCount: number;
  resultCount: number;
  items: TTutorialsListItem[];
}

/**
 * 新手引导卡片 - 在教程列表顶部显示
 */
function NewbieGuideCard({ language }: { language: TLanguage }) {
  const isZh = language !== 'en';

  return (
    <Link
      href="/use"
      className="group mb-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-5 py-4 ring-1 ring-primary/20 transition-all hover:from-primary/15 hover:via-primary/10 hover:ring-primary/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {isZh ? '新手？从这里开始' : 'New here? Start here'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isZh ? '5 分钟入门指南，带你快速上手 AI 编程' : 'Get started with AI coding in 5 minutes'}
          </p>
        </div>
      </div>
      <svg className="h-5 w-5 text-primary transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
      </svg>
    </Link>
  );
}

/**
 * 教程列表页交互视图：筛选工具栏 + 卡片列表。
 * 遵循产品列表页的设计模式。
 */
export function TutorialsListView({
  language,
  tools,
  task,
  type,
  sort,
  toolOptions,
  taskOptions,
  typeOptions,
  sortOptions,
  totalCount,
  resultCount,
  items,
}: ITutorialsListViewProps) {
  const router = useRouter();
  const isZh = language !== 'en';

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
    (task ? 1 : 0) +
    (type ? 1 : 0) +
    (sort && sort !== DEFAULT_SORT ? 1 : 0);

  const pushFilters = (
    next: Partial<{
      tools: string[];
      task: string;
      type: string;
      sort: string;
    }>
  ) => {
    const nextTools = next.tools ?? tools;
    const nextTask = next.task ?? task;
    const nextType = next.type ?? type;
    const nextSort = next.sort ?? sort;

    router.push(
      buildSearchHref('/tutorials', {
        tools: nextTools.length > 0 ? nextTools : undefined,
        task: nextTask || undefined,
        type: nextType || undefined,
        sort: nextSort && nextSort !== DEFAULT_SORT ? nextSort : undefined,
      })
    );
  };

  /** 点击工具标签时添加到筛选 */
  const handleFilterByTool = (toolSlug: string) => {
    if (!tools.includes(toolSlug)) {
      pushFilters({ tools: [...tools, toolSlug] });
    }
  };

  /** 点击类型标签时添加到筛选 */
  const handleFilterByType = (tutorialType: string) => {
    if (type !== tutorialType) {
      pushFilters({ type: tutorialType });
    }
  };

  return (
    <div className="space-y-1.5">
      {/* 新手引导卡片 - 仅在无筛选条件时显示 */}
      {activeCount === 0 && <NewbieGuideCard language={language} />}

      {/* 筛选区域 - 与产品列表页保持一致 */}
      <div className="rounded-2xl bg-muted/30 p-4 ring-1 ring-border-subtle">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* 左侧：筛选器组 */}
          <div className="flex flex-wrap items-center gap-2">
            <PillMultiSelect
              label={isZh ? '工具' : 'Tools'}
              values={tools}
              options={toolOptions}
              emptyLabel={isZh ? '全部' : 'Any'}
              clearLabel={isZh ? '清空' : 'Clear'}
              onChange={(values) => pushFilters({ tools: values })}
              active={tools.length > 0}
            />
            <PillMultiSelect
              label={isZh ? '任务' : 'Task'}
              values={task ? [task] : []}
              options={taskOptions}
              emptyLabel={isZh ? '不限' : 'Any'}
              clearLabel={isZh ? '清空' : 'Clear'}
              maxSelected={1}
              onChange={(values) => pushFilters({ task: values[0] || '' })}
              active={!!task}
            />
            <PillMultiSelect
              label={isZh ? '类型' : 'Type'}
              values={type ? [type] : []}
              options={typeOptions}
              emptyLabel={isZh ? '不限' : 'Any'}
              clearLabel={isZh ? '清空' : 'Clear'}
              maxSelected={1}
              onChange={(values) => pushFilters({ type: values[0] || '' })}
              active={!!type}
            />
            {/* 排序下拉框 */}
            <PillSelect
              label={isZh ? '排序' : 'Sort'}
              value={sort || DEFAULT_SORT}
              options={sortOptions}
              onChange={(value) => pushFilters({ sort: value })}
            />
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
                onClick={() => pushFilters({ tools: [], task: '', type: '', sort: DEFAULT_SORT })}
                className="inline-flex h-8 items-center justify-center rounded-full px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {isZh ? '重置' : 'Reset'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 教程列表 */}
      <ul role="list" className="space-y-4">
        {items.map((item) => (
          <li key={item.slug}>
            <TutorialsListItemCard
              language={language}
              tutorialSlug={item.slug}
              tutorial={item.frontmatter}
              onFilterByTool={handleFilterByTool}
              onFilterByType={handleFilterByType}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ITutorialsListItemCardProps {
  language: TLanguage;
  tutorialSlug: string;
  tutorial: ITutorialFrontmatter;
  /** 点击工具标签时的筛选回调 */
  onFilterByTool?: (tool: string) => void;
  /** 点击类型标签时的筛选回调 */
  onFilterByType?: (type: string) => void;
}

/**
 * 教程列表项卡片 - 遵循产品列表页卡片设计。
 */
function TutorialsListItemCard({
  language,
  tutorialSlug,
  tutorial,
  onFilterByTool,
  onFilterByType,
}: ITutorialsListItemCardProps) {
  const isZh = language !== 'en';
  const typeLabel = getTutorialTypeLabel(language, tutorial.type);
  const difficultyLabel = getTutorialDifficultyLabel(language, tutorial.difficulty);
  const relatedTools = tutorial.relatedTools ?? [];
  const firstTool = relatedTools[0];

  /** 处理标签点击，阻止事件冒泡到父级 Link */
  const handleBadgeClick = (e: React.MouseEvent, callback?: () => void) => {
    if (callback) {
      e.preventDefault();
      e.stopPropagation();
      callback();
    }
  };

  const cardClassName = cn(
    'relative block rounded-2xl border border-border bg-card p-5 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:p-6'
  );

  return (
    <Link href={`/tutorials/${tutorialSlug}`} className={cardClassName}>
      {/* 头部区域：标题 + 类型标签 */}
      <div className="flex items-start gap-3.5">
        {/* 图标容器 - 使用教程类型图标 */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border-subtle bg-muted/60">
          <TutorialTypeIcon type={tutorial.type} />
        </div>
        <div className="min-w-0 flex-1">
          {/* 标题行：标题 + 难度标签在同一行 */}
          <div className="flex items-center gap-2.5">
            <h3 className="truncate text-base font-semibold tracking-tight text-card-foreground sm:text-lg">
              {tutorial.title}
            </h3>
            <Badge variant="secondary" size="sm">
              {difficultyLabel}
            </Badge>
          </div>
          {/* 描述 */}
          <p className="mt-1.5 min-h-[2.75rem] text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {tutorial.description}
          </p>
        </div>
      </div>

      {/* 标签区域 */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <Badge
          variant="primary"
          onClick={(e) => handleBadgeClick(e, () => onFilterByType?.(tutorial.type))}
          title={onFilterByType ? (isZh ? `筛选：${typeLabel}` : `Filter: ${typeLabel}`) : undefined}
        >
          {typeLabel}
        </Badge>
        {firstTool && (
          <Badge
            variant="default"
            onClick={(e) => handleBadgeClick(e, () => onFilterByTool?.(firstTool))}
            title={onFilterByTool ? (isZh ? `筛选：${firstTool}` : `Filter: ${firstTool}`) : undefined}
          >
            {firstTool}
          </Badge>
        )}
        {relatedTools.length > 1 && (
          <Badge variant="default" size="sm">
            +{relatedTools.length - 1}
          </Badge>
        )}
        {tutorial.featured && (
          <Badge variant="success" size="sm">
            {isZh ? '精选' : 'Featured'}
          </Badge>
        )}
      </div>

      {/* 元信息区域 */}
      <div className="mt-3.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-t border-border-subtle pt-3.5 text-xs">
        <span className="text-muted-foreground">
          {isZh ? '更新：' : 'Updated: '}
          {formatDate(tutorial.updatedAt, language)}
        </span>
        {tutorial.version && (
          <>
            <span className="text-border" aria-hidden="true">|</span>
            <span className="text-muted-foreground">
              {isZh ? '版本：' : 'Version: '}
              {tutorial.version}
            </span>
          </>
        )}
        {tutorial.estimatedTime && (
          <>
            <span className="text-border" aria-hidden="true">|</span>
            <span className="text-muted-foreground">
              {isZh ? '预计：' : 'Est: '}
              {tutorial.estimatedTime}
            </span>
          </>
        )}
      </div>
    </Link>
  );
}

/** 教程类型图标 */
function TutorialTypeIcon({ type }: { type: string }) {
  const iconClassName = 'h-5 w-5 text-muted-foreground';

  switch (type) {
    case 'getting-started':
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
        </svg>
      );
    case 'how-to':
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
        </svg>
      );
    case 'automation':
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      );
    case 'quality-control':
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      );
    case 'team-practice':
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      );
    default:
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      );
  }
}

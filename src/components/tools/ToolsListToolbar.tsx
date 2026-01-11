'use client';

import { cn } from '@/lib/utils';
import { PillMultiSelect } from '@/components/ui/PillMultiSelect';
import { PillSelect } from '@/components/ui/PillSelect';
import type { TLanguage } from '@/types';
import type { TToolsSelectOption } from '@/components/tools/ToolsListView';

const DEFAULT_SORT = 'trending';

interface IToolsListToolbarProps {
  language: TLanguage;
  productType: string[];
  workflow: string[];
  pricing: string[];
  sort: string;
  productTypeOptions: TToolsSelectOption[];
  workflowOptions: TToolsSelectOption[];
  pricingOptions: TToolsSelectOption[];
  totalCount: number;
  resultCount: number;
  /** 是否处于对比模式 */
  isCompareMode: boolean;
  selectedCount: number;
  maxSelected: number;
  selectedTitles: string[];
  canCompare: boolean;
  /** 进入对比模式 */
  onEnterCompareMode: () => void;
  /** 退出对比模式 */
  onExitCompareMode: () => void;
  onClearSelected: () => void;
  onOpenCompare: () => void;
  onReset: () => void;
  onChangeProductType: (values: string[]) => void;
  onChangeWorkflow: (values: string[]) => void;
  onChangePricing: (values: string[]) => void;
  onChangeSort: (value: string) => void;
}

export function ToolsListToolbar({
  language,
  productType,
  workflow,
  pricing,
  sort,
  productTypeOptions,
  workflowOptions,
  pricingOptions,
  totalCount,
  resultCount,
  isCompareMode,
  selectedCount,
  maxSelected,
  selectedTitles,
  canCompare,
  onEnterCompareMode,
  onExitCompareMode,
  onClearSelected,
  onOpenCompare,
  onReset,
  onChangeProductType,
  onChangeWorkflow,
  onChangePricing,
  onChangeSort,
}: IToolsListToolbarProps) {
  const isZh = language !== 'en';
  const resultsLabel =
    totalCount > resultCount
      ? isZh
        ? `${resultCount} / ${totalCount} 个结果`
        : `${resultCount}/${totalCount} ${totalCount === 1 ? 'result' : 'results'}`
      : isZh
        ? `${resultCount} 个结果`
        : `${resultCount} ${resultCount === 1 ? 'result' : 'results'}`;
  const activeCount =
    (productType.length > 0 ? 1 : 0) +
    (workflow.length > 0 ? 1 : 0) +
    (pricing.length > 0 ? 1 : 0);
  const secondaryButtonClassName =
    'inline-flex h-9 items-center justify-center rounded-full border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';
  const tertiaryButtonClassName =
    'inline-flex h-9 items-center justify-center rounded-full bg-transparent px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

  const sortOptions = isZh
    ? [
        { value: 'trending', label: '热度' },
        { value: 'github', label: 'GitHub' },
        { value: 'updated', label: '更新' },
        { value: 'name', label: '名称' },
      ]
    : [
        { value: 'trending', label: 'Trending' },
        { value: 'github', label: 'GitHub' },
        { value: 'updated', label: 'Updated' },
        { value: 'name', label: 'Name' },
      ];

  const sortHint = (() => {
    if (sort === 'github') return isZh ? '排序：GitHub 提及 → 热度 → 更新时间' : 'Sort: GitHub mentions → heat → updated';
    if (sort === 'updated') return isZh ? '排序：更新时间 → 热度 → GitHub 提及' : 'Sort: updated → heat → GitHub mentions';
    if (sort === 'name') return isZh ? '排序：名称 → 热度 → GitHub 提及' : 'Sort: name → heat → GitHub mentions';
    return isZh ? '默认排序：热度（公众号文章数）→ GitHub 提及 → 更新时间' : 'Default: heat (WeChat) → GitHub mentions → updated';
  })();

  return (
    <div className="space-y-3">
      {/* 筛选区域 - 优化视觉层次 */}
      <div className="rounded-2xl bg-muted/30 p-4 ring-1 ring-border/50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ToolbarFilters
            isZh={isZh}
            productType={productType}
            workflow={workflow}
            pricing={pricing}
            sort={sort}
            sortOptions={sortOptions}
            sortHint={sortHint}
            productTypeOptions={productTypeOptions}
            workflowOptions={workflowOptions}
            pricingOptions={pricingOptions}
            resultsBadge={<ToolbarMetaText>{resultsLabel}</ToolbarMetaText>}
            canReset={activeCount > 0}
            isCompareMode={isCompareMode}
            onEnterCompareMode={onEnterCompareMode}
            onReset={onReset}
            onChangeProductType={onChangeProductType}
            onChangeWorkflow={onChangeWorkflow}
            onChangePricing={onChangePricing}
            onChangeSort={onChangeSort}
          />
        </div>
      </div>

      {/* 对比区域 - 仅在对比模式下显示 */}
      {isCompareMode && (
        <CompareBar
          isZh={isZh}
          selectedCount={selectedCount}
          maxSelected={maxSelected}
          canCompare={canCompare}
          selectedTitles={selectedTitles}
          secondaryButtonClassName={secondaryButtonClassName}
          tertiaryButtonClassName={tertiaryButtonClassName}
          onExitCompareMode={onExitCompareMode}
          onClearSelected={onClearSelected}
          onOpenCompare={onOpenCompare}
        />
      )}
    </div>
  );
}

function ToolbarFilters({
  isZh,
  productType,
  workflow,
  pricing,
  sort,
  sortOptions,
  sortHint,
  productTypeOptions,
  workflowOptions,
  pricingOptions,
  resultsBadge,
  canReset,
  isCompareMode,
  onEnterCompareMode,
  onReset,
  onChangeProductType,
  onChangeWorkflow,
  onChangePricing,
  onChangeSort,
}: {
  isZh: boolean;
  productType: string[];
  workflow: string[];
  pricing: string[];
  sort: string;
  sortOptions: { value: string; label: string }[];
  sortHint: string;
  productTypeOptions: TToolsSelectOption[];
  workflowOptions: TToolsSelectOption[];
  pricingOptions: TToolsSelectOption[];
  resultsBadge: React.ReactNode;
  canReset: boolean;
  isCompareMode: boolean;
  onEnterCompareMode: () => void;
  onReset: () => void;
  onChangeProductType: (values: string[]) => void;
  onChangeWorkflow: (values: string[]) => void;
  onChangePricing: (values: string[]) => void;
  onChangeSort: (value: string) => void;
}) {
  const hasActiveFilters = productType.length > 0 || workflow.length > 0 || pricing.length > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* 左侧：筛选器组 */}
      <div className="flex flex-wrap items-center gap-2">
        <PillMultiSelect
          label={isZh ? '产品形态' : 'Form'}
          values={productType}
          options={productTypeOptions}
          emptyLabel={isZh ? '全部' : 'Any'}
          clearLabel={isZh ? '清空' : 'Clear'}
          onChange={onChangeProductType}
          active={productType.length > 0}
        />
        <PillMultiSelect
          label={isZh ? '能力' : 'Capability'}
          values={workflow}
          options={workflowOptions}
          emptyLabel={isZh ? '不限' : 'Any'}
          clearLabel={isZh ? '清空' : 'Clear'}
          onChange={onChangeWorkflow}
          active={workflow.length > 0}
        />
        <PillMultiSelect
          label={isZh ? '计费' : 'Pricing'}
          values={pricing}
          options={pricingOptions}
          emptyLabel={isZh ? '不限' : 'Any'}
          clearLabel={isZh ? '清空' : 'Clear'}
          onChange={onChangePricing}
          active={pricing.length > 0}
        />
        {/* 排序下拉框 */}
        <div title={sortHint}>
          <PillSelect
            label={isZh ? '排序' : 'Sort'}
            value={sort || DEFAULT_SORT}
            options={sortOptions}
            onChange={onChangeSort}
          />
        </div>
      </div>

      {/* 右侧：结果信息 + 操作按钮组 */}
      <div className="flex items-center gap-2">
        {resultsBadge}
        {/* 重置按钮 - 仅在有筛选时显示 */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-8 items-center justify-center rounded-full px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {isZh ? '重置' : 'Reset'}
          </button>
        )}
        {/* 分隔线 */}
        {!isCompareMode && (
          <div className="hidden h-5 w-px bg-border/60 sm:block" aria-hidden="true" />
        )}
        {/* 开始对比按钮 - 仅在非对比模式下显示 */}
        {!isCompareMode && (
          <button
            type="button"
            onClick={onEnterCompareMode}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <CompareIcon className="h-4 w-4" />
            {isZh ? '对比' : 'Compare'}
          </button>
        )}
      </div>
    </div>
  );
}

function ToolbarMetaText({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <span
      className="inline-flex h-9 items-center px-1 text-xs font-medium text-muted-foreground select-none"
      title={title}
    >
      {children}
    </span>
  );
}

/** 对比操作栏 - 仅在对比模式下显示 */
function CompareBar({
  isZh,
  selectedCount,
  maxSelected,
  canCompare,
  selectedTitles,
  secondaryButtonClassName,
  tertiaryButtonClassName,
  onExitCompareMode,
  onClearSelected,
  onOpenCompare,
}: {
  isZh: boolean;
  selectedCount: number;
  maxSelected: number;
  canCompare: boolean;
  selectedTitles: string[];
  secondaryButtonClassName: string;
  tertiaryButtonClassName: string;
  onExitCompareMode: () => void;
  onClearSelected: () => void;
  onOpenCompare: () => void;
}) {
  const selectedTitleText = selectedTitles.join(' · ');
  const progressPercent = (selectedCount / maxSelected) * 100;

  return (
    <div className="rounded-2xl bg-primary/5 p-4 ring-1 ring-primary/20 transition-all">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* 左侧：说明和进度 */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <CompareIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {isZh ? '对比模式' : 'Compare Mode'}
              </span>
              <span className="text-xs text-muted-foreground">
                {selectedCount}/{maxSelected}
              </span>
            </div>
            {selectedCount === 0 ? (
              <p className="text-xs text-muted-foreground">
                {isZh ? '点击卡片左上角 + 按钮选择工具' : 'Click + button on cards to select tools'}
              </p>
            ) : selectedCount === 1 ? (
              <p className="text-xs text-muted-foreground">
                {isZh ? '再选 1 个即可对比' : 'Select 1 more to compare'}
              </p>
            ) : (
              <p className="truncate text-xs text-muted-foreground" title={selectedTitleText}>
                {selectedTitleText}
              </p>
            )}
          </div>
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-2">
          {/* 进度条 - 仅在有选择时显示 */}
          {selectedCount > 0 && (
            <div className="hidden w-24 sm:block">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {selectedCount > 0 && (
            <button type="button" onClick={onClearSelected} className={tertiaryButtonClassName}>
              {isZh ? '清空' : 'Clear'}
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCompare}
            disabled={!canCompare}
            className={cn(
              'inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              canCompare
                ? 'bg-primary text-primary-foreground hover:opacity-90'
                : cn(secondaryButtonClassName, 'h-10 cursor-not-allowed border-border/60 text-muted-foreground opacity-70')
            )}
            title={
              canCompare
                ? undefined
                : isZh
                  ? '先选择至少 2 个工具'
                  : 'Select at least 2 tools first'
            }
          >
            {canCompare && <ArrowRightIcon className="h-4 w-4" />}
            {isZh ? '开始对比' : 'Compare'}
          </button>

          {/* 退出对比模式按钮 */}
          <button
            type="button"
            onClick={onExitCompareMode}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            title={isZh ? '退出对比模式' : 'Exit compare mode'}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CompareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

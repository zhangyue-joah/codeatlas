'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn, formatDate } from '@/lib/utils';
import { getToolDisplayTitle } from '@/lib/toolDisplay';
import { formatToolStartingPrice } from '@/lib/toolPricing';
import { buildSearchHref } from '@/utils/query';
import { PillMultiSelect } from '@/components/ui/PillMultiSelect';
import { Badge } from '@/components/ui/Badge';
import type { IToolFrontmatter, TLanguage } from '@/types';
import { getPricingModelLabel } from '@/i18n/labels';

export type TBuyListItem = {
  slug: string;
  frontmatter: IToolFrontmatter;
};

export type TBuySelectOption = { value: string; label: string };

interface IBuyListViewProps {
  language: TLanguage;
  pricing: string[];
  procurement: string[];
  compliance: string[];
  query: string;
  pricingOptions: TBuySelectOption[];
  procurementOptions: TBuySelectOption[];
  complianceOptions: TBuySelectOption[];
  totalCount: number;
  resultCount: number;
  items: TBuyListItem[];
}

/**
 * 购买列表页交互视图：筛选工具栏 + 卡片列表。
 * 遵循产品列表页的设计模式。
 */
export function BuyListView({
  language,
  pricing,
  procurement,
  compliance,
  query,
  pricingOptions,
  procurementOptions,
  complianceOptions,
  totalCount,
  resultCount,
  items,
}: IBuyListViewProps) {
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
    (pricing.length > 0 ? 1 : 0) +
    (procurement.length > 0 ? 1 : 0) +
    (compliance.length > 0 ? 1 : 0) +
    (draftQuery.trim() ? 1 : 0);

  const pushFilters = (
    next: Partial<{
      pricing: string[];
      procurement: string[];
      compliance: string[];
      q: string;
    }>,
    replace = false
  ) => {
    const nextPricing = next.pricing ?? pricing;
    const nextProcurement = next.procurement ?? procurement;
    const nextCompliance = next.compliance ?? compliance;
    const nextQuery = next.q ?? draftQuery;

    const href = buildSearchHref('/buy', {
      pricing: nextPricing.length > 0 ? nextPricing : undefined,
      procurement: nextProcurement.length > 0 ? nextProcurement : undefined,
      compliance: nextCompliance.length > 0 ? nextCompliance : undefined,
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
        buildSearchHref('/buy', {
          pricing: pricing.length > 0 ? pricing : undefined,
          procurement: procurement.length > 0 ? procurement : undefined,
          compliance: compliance.length > 0 ? compliance : undefined,
          q: normalized || undefined,
        })
      );
    }, 250);
    return () => window.clearTimeout(id);
  }, [draftQuery, query, router, pricing, procurement, compliance]);

  /** 点击计费模式标签时添加到筛选 */
  const handleFilterByPricing = (pricingModel: string) => {
    if (!pricing.includes(pricingModel)) {
      pushFilters({ pricing: [...pricing, pricingModel] });
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
              label={isZh ? '计费' : 'Pricing'}
              values={pricing}
              options={pricingOptions}
              emptyLabel={isZh ? '全部' : 'Any'}
              clearLabel={isZh ? '清空' : 'Clear'}
              onChange={(values) => pushFilters({ pricing: values })}
              active={pricing.length > 0}
            />
            <PillMultiSelect
              label={isZh ? '采购路径' : 'Procurement'}
              values={procurement}
              options={procurementOptions}
              emptyLabel={isZh ? '不限' : 'Any'}
              clearLabel={isZh ? '清空' : 'Clear'}
              onChange={(values) => pushFilters({ procurement: values })}
              active={procurement.length > 0}
            />
            <PillMultiSelect
              label={isZh ? '合规' : 'Compliance'}
              values={compliance}
              options={complianceOptions}
              emptyLabel={isZh ? '不限' : 'Any'}
              clearLabel={isZh ? '清空' : 'Clear'}
              onChange={(values) => pushFilters({ compliance: values })}
              active={compliance.length > 0}
            />
            {/* 搜索框 */}
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <SearchIcon />
              </span>
              <input
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                placeholder={isZh ? '搜索工具...' : 'Search tools...'}
                aria-label={isZh ? '搜索工具' : 'Search tools'}
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
                  pushFilters({ pricing: [], procurement: [], compliance: [], q: '' });
                }}
                className="inline-flex h-8 items-center justify-center rounded-full px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {isZh ? '重置' : 'Reset'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 购买列表 */}
      <ul role="list" className="space-y-4">
        {items.map((item) => (
          <li key={item.slug}>
            <BuyListItemCard
              language={language}
              toolSlug={item.slug}
              tool={item.frontmatter}
              onFilterByPricing={handleFilterByPricing}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

interface IBuyListItemCardProps {
  language: TLanguage;
  toolSlug: string;
  tool: IToolFrontmatter;
  /** 点击计费模式标签时的筛选回调 */
  onFilterByPricing?: (pricing: string) => void;
}

/**
 * 购买列表项卡片 - 遵循产品列表页卡片设计。
 */
function BuyListItemCard({
  language,
  toolSlug,
  tool,
  onFilterByPricing,
}: IBuyListItemCardProps) {
  const isZh = language !== 'en';
  const displayTitle = getToolDisplayTitle(tool, language);
  const pricingModelLabel = getPricingModelLabel(language, tool.pricing.model);
  const startingPriceLabel = formatToolStartingPrice(tool, language);
  const officialUrl = tool.purchase?.officialUrl ?? tool.website;

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
    <Link href={`/buy/${toolSlug}`} className={cardClassName}>
      {/* 头部区域：图标 + 标题 + 计费标签 */}
      <div className="flex items-start gap-3.5">
        {/* 统一图标容器样式 */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-muted/60">
          <Image
            src={tool.logo || '/logos/default.svg'}
            alt=""
            aria-hidden="true"
            width={26}
            height={26}
            className="h-[26px] w-[26px] object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          {/* 标题行：标题 + 计费标签在同一行 */}
          <div className="flex items-center gap-2.5">
            <h3 className="truncate text-base font-semibold tracking-tight text-card-foreground sm:text-lg">
              {displayTitle}
            </h3>
            <Badge
              variant="secondary"
              size="sm"
              onClick={(e) => handleBadgeClick(e, () => onFilterByPricing?.(tool.pricing.model))}
              title={onFilterByPricing ? (isZh ? `筛选：${pricingModelLabel}` : `Filter: ${pricingModelLabel}`) : undefined}
            >
              {pricingModelLabel}
            </Badge>
          </div>
          {/* 描述 */}
          <p className="mt-1.5 min-h-[2.75rem] text-sm leading-relaxed text-muted-foreground/90 line-clamp-2">
            {tool.description}
          </p>
        </div>
      </div>

      {/* 标签区域 - 价格和合规信息 */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <Badge variant="primary">
          {startingPriceLabel ? startingPriceLabel : isZh ? '价格以官方为准' : 'Pricing: refer to official'}
        </Badge>
        {tool.pricing.free && (
          <Badge variant="success" size="sm">
            {isZh ? '免费层' : 'Free tier'}
          </Badge>
        )}
        <Badge variant="default" size="sm">
          {isZh ? '发票：' : 'Invoice: '}
          {tool.pricing.supportsInvoice ? (isZh ? '支持' : 'Yes') : (isZh ? '不支持' : 'No')}
        </Badge>
        <Badge variant="default" size="sm">
          {isZh ? '合同：' : 'Contract: '}
          {tool.pricing.supportsContract ? (isZh ? '支持' : 'Yes') : (isZh ? '不支持' : 'No')}
        </Badge>
      </div>

      {/* 元信息区域 */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-2.5 gap-y-1.5 border-t border-border/50 pt-3.5 text-xs">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span className="text-foreground/60">
            {isZh ? '更新：' : 'Updated: '}
            {formatDate(tool.purchase?.updatedAt ?? tool.updatedAt, language)}
          </span>
          {tool.pricing.hasEnterprise && (
            <>
              <span className="text-border/80" aria-hidden="true">|</span>
              <span className="text-foreground/50">
                {isZh ? '支持企业采购' : 'Enterprise available'}
              </span>
            </>
          )}
        </div>
        {/* 快速访问官网按钮 */}
        {officialUrl && (
          <a
            href={officialUrl}
            target="_blank"
            rel="noreferrer noopener"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {isZh ? '官网定价' : 'Official pricing'} ↗
          </a>
        )}
      </div>
    </Link>
  );
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

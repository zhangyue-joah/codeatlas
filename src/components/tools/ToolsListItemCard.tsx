'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn, formatDate } from '@/lib/utils';
import { getToolDisplayTitle } from '@/lib/toolDisplay';
import { Badge } from '@/components/ui/Badge';
import type { IToolFrontmatter, TLanguage, TToolCapability, TToolProductType } from '@/types';
import { getPricingModelLabel, getToolCapabilityLabel, getToolCategoryLabel, getToolProductTypeLabel } from '@/i18n/labels';
import { formatToolStartingPrice } from '@/lib/toolPricing';

interface IToolsListItemCardProps {
  language: TLanguage;
  toolSlug: string;
  tool: IToolFrontmatter;
  heatScore: number;
  /** 是否处于对比模式 */
  isCompareMode: boolean;
  selected: boolean;
  disabled?: boolean;
  onToggle: () => void;
  /** 点击分类标签时的筛选回调 */
  onFilterByCategory?: (category: string) => void;
  /** 点击计费模式标签时的筛选回调 */
  onFilterByPricing?: (pricing: string) => void;
  /** 点击产品形态标签时的筛选回调 */
  onFilterByProductType?: (productType: string) => void;
}

/** 根据热度分数计算热度等级 (1-5) */
function getHeatLevel(score: number): number {
  if (score >= 800) return 5;
  if (score >= 400) return 4;
  if (score >= 200) return 3;
  if (score >= 100) return 2;
  if (score > 0) return 1;
  return 0;
}

/** 热度指标组件 */
function HeatIndicator({ score, language }: { score: number; language: TLanguage }) {
  const level = getHeatLevel(score);
  if (level === 0) return null;

  const isZh = language !== 'en';
  const labels = isZh
    ? ['', '较少关注', '有一定关注', '中等热度', '较高热度', '非常热门']
    : ['', 'Low', 'Some interest', 'Moderate', 'Popular', 'Very popular'];

  return (
    <div
      className="flex items-center gap-1"
      title={isZh ? `热度指数（公众号）：${score}` : `Heat index (WeChat): ${score}`}
    >
      <FireIcon className={cn(
        'h-3.5 w-3.5',
        level >= 4 ? 'text-orange-500' : level >= 2 ? 'text-amber-400' : 'text-muted-foreground'
      )} />
      <span className={cn(
        'text-xs',
        level >= 4 ? 'text-orange-500 font-medium' : 'text-muted-foreground'
      )}>
        {labels[level]}
      </span>
      <span className="text-xs tabular-nums text-muted-foreground">· {score}</span>
    </div>
  );
}

export function ToolsListItemCard({
  language,
  toolSlug,
  tool,
  heatScore,
  isCompareMode,
  selected,
  disabled,
  onToggle,
  onFilterByCategory,
  onFilterByPricing,
  onFilterByProductType,
}: IToolsListItemCardProps) {
  const isZh = language !== 'en';
  const displayTitle = getToolDisplayTitle(tool, language);
  const productType = tool.productType[0] as TToolProductType | undefined;
  const productTypeLabel = productType ? getToolProductTypeLabel(language, productType) : undefined;
  const category = tool.category[0];
  const categoryLabel = category ? getToolCategoryLabel(language, category) : undefined;
  const pricingModelLabel = getPricingModelLabel(language, tool.pricing.model);
  const permission = derivePermissionLevel(tool.capabilities);
  const permissionLabel = permission ? getToolCapabilityLabel(language, permission) : (isZh ? '未知权限' : 'Unknown permissions');
  const processingLabel = tool.privacy.localProcessing ? (isZh ? '本地处理' : 'Local processing') : (isZh ? '云端处理' : 'Cloud processing');
  const startingPriceLabel = formatToolStartingPrice(tool, language);

  /** 处理标签点击，阻止事件冒泡到父级 Link */
  const handleBadgeClick = (e: React.MouseEvent, callback?: () => void) => {
    if (callback) {
      e.preventDefault();
      e.stopPropagation();
      callback();
    }
  };

  const cardClassName = cn(
    'relative block rounded-2xl border border-border bg-card p-5 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:p-6',
    selected && 'ring-2 ring-primary'
  );

  const compareToggleLabel =
    language === 'en'
      ? `${selected ? 'Remove' : 'Add'} ${displayTitle} to compare`
      : `${selected ? '取消' : '加入'}对比：${displayTitle}`;

  return (
    <div className="relative">
      {/* 对比选择按钮 - 仅在对比模式下显示 */}
      {isCompareMode && (
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-pressed={selected}
          aria-label={compareToggleLabel}
          title={compareToggleLabel}
          className={cn(
            'absolute left-5 top-5 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:left-6 sm:top-6',
            selected
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            disabled && 'cursor-not-allowed opacity-60 hover:bg-background hover:text-muted-foreground'
          )}
        >
          {selected ? <CheckIcon /> : <PlusIcon />}
        </button>
      )}

      <Link href={`/tools/${toolSlug}`} className={cardClassName}>
        {/* 根据是否在对比模式调整内容区域的左边距 */}
        <div className={isCompareMode ? 'pl-10' : ''}>
          {/* 头部区域：图标 + 标题 + 类型标签 */}
          <div className="flex items-start gap-3.5">
            {/* 统一图标容器样式 - 使用一致的浅灰背景 */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border-subtle bg-muted/60">
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
              {/* 标题行：标题 + 类型标签在同一行 */}
              <div className="flex items-center gap-2.5">
                <h3 className="truncate text-base font-semibold tracking-tight text-card-foreground sm:text-lg">
                  {displayTitle}
                </h3>
                {productTypeLabel ? (
                  <Badge
                    variant="secondary"
                    size="sm"
                    onClick={(e) => handleBadgeClick(e, productType ? () => onFilterByProductType?.(productType) : undefined)}
                    title={onFilterByProductType ? (isZh ? `筛选：${productTypeLabel}` : `Filter: ${productTypeLabel}`) : undefined}
                  >
                    {productTypeLabel}
                  </Badge>
                ) : null}
              </div>
              {/* 描述 */}
              <p className="mt-1.5 min-h-[2.75rem] text-sm leading-relaxed text-muted-foreground line-clamp-2">
                {tool.description}
              </p>
            </div>
          </div>

          {/* 标签区域 - 增强视觉层次 */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            {categoryLabel ? (
              <Badge
                variant="primary"
                onClick={(e) => handleBadgeClick(e, category ? () => onFilterByCategory?.(category) : undefined)}
                title={onFilterByCategory ? (isZh ? `筛选：${categoryLabel}` : `Filter: ${categoryLabel}`) : undefined}
              >
                {categoryLabel}
              </Badge>
            ) : null}
            <Badge
              variant="default"
              onClick={(e) => handleBadgeClick(e, () => onFilterByPricing?.(tool.pricing.model))}
              title={onFilterByPricing ? (isZh ? `筛选：${pricingModelLabel}` : `Filter: ${pricingModelLabel}`) : undefined}
            >
              {pricingModelLabel}
              {startingPriceLabel ? ` · ${startingPriceLabel}` : ''}
            </Badge>
            {tool.pricing.free && (
              <Badge variant="success" size="sm">
                {isZh ? '免费层' : 'Free tier'}
              </Badge>
            )}
          </div>

          {/* 元信息区域 - 提高对比度 */}
          <div className="mt-3.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-t border-border-subtle pt-3.5 text-xs">
            <HeatIndicator score={heatScore} language={language} />
            {heatScore > 0 && <span className="text-border/80" aria-hidden="true">|</span>}
            <span className="text-muted-foreground">{processingLabel}</span>
            <span className="text-border" aria-hidden="true">|</span>
            <span className="text-muted-foreground">
              {isZh ? '权限：' : 'Permissions: '}
              {permissionLabel}
            </span>
            <span className="text-border" aria-hidden="true">|</span>
            <span className="text-muted-foreground">
              {isZh ? '更新：' : 'Updated: '}
              {formatDate(tool.updatedAt, language)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FireIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function derivePermissionLevel(capabilities: TToolCapability[]): Extract<TToolCapability, 'read-only' | 'read-write' | 'execute'> | null {
  if (capabilities.includes('execute')) return 'execute';
  if (capabilities.includes('read-write')) return 'read-write';
  if (capabilities.includes('read-only')) return 'read-only';
  return null;
}

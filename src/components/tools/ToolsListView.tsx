'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { IToolFrontmatter, TLanguage } from '@/types';
import { buildSearchHref } from '@/utils/query';
import { ToolsListToolbar } from '@/components/tools/ToolsListToolbar';
import { ToolsListItemCard } from '@/components/tools/ToolsListItemCard';
import { CompareResultModal } from '@/components/tools/CompareResultModal';
import { getToolDisplayTitle } from '@/lib/toolDisplay';

const MAX_COMPARE_SELECTION = 4;
const DEFAULT_SORT = 'trending';

export type TToolsListItem = {
  slug: string;
  frontmatter: IToolFrontmatter;
  wechatHeatScore: number;
};

export type TToolsSelectOption = { value: string; label: string };

interface IToolsListViewProps {
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
  items: TToolsListItem[];
  /** 点击分类标签时的筛选回调 */
  onFilterByCategory?: (category: string) => void;
  /** 点击计费模式标签时的筛选回调 */
  onFilterByPricing?: (pricing: string) => void;
  /** 点击产品形态标签时的筛选回调 */
  onFilterByProductType?: (productType: string) => void;
}

/**
 * 产品列表页交互视图：下拉筛选 + 对比模式 + 对比结果弹窗。
 */
export function ToolsListView({
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
  items,
}: IToolsListViewProps) {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  /** 是否处于对比模式 */
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedTools, setSelectedTools] = useState<
    { slug: string; title: string; frontmatter: IToolFrontmatter }[]
  >([]);

  const selectedCount = selectedTools.length;
  const canCompare = selectedCount >= 2;
  const reachedMax = selectedCount >= MAX_COMPARE_SELECTION;

  const selectedSlugs = useMemo(() => selectedTools.map((tool) => tool.slug), [selectedTools]);
  const selectedTitles = useMemo(() => selectedTools.map((tool) => tool.title), [selectedTools]);

  /** 进入对比模式 */
  const enterCompareMode = () => setIsCompareMode(true);

  /** 退出对比模式并清空选择 */
  const exitCompareMode = () => {
    setIsCompareMode(false);
    setSelectedTools([]);
  };

  useEffect(() => {
    if (!isModalOpen) return;
    if (selectedCount >= 2) return;
    setIsModalOpen(false);
  }, [isModalOpen, selectedCount]);

  const toggleSelected = (tool: { slug: string; title: string; frontmatter: IToolFrontmatter }) => {
    setSelectedTools((prev) => {
      const exists = prev.some((item) => item.slug === tool.slug);
      if (exists) return prev.filter((item) => item.slug !== tool.slug);
      if (prev.length >= MAX_COMPARE_SELECTION) return prev;
      return [...prev, tool];
    });
  };

  const clearSelected = () => setSelectedTools([]);

  const pushFilters = (
    next: Partial<{
      productType: string[];
      workflow: string[];
      pricing: string[];
      sort: string;
    }>
  ) => {
    const nextProductType = next.productType ?? productType;
    const nextWorkflow = next.workflow ?? workflow;
    const nextPricing = next.pricing ?? pricing;
    const nextSort = next.sort ?? sort;

    router.push(
      buildSearchHref('/tools', {
        productType: nextProductType,
        workflow: nextWorkflow,
        pricing: nextPricing,
        sort: nextSort && nextSort !== DEFAULT_SORT ? nextSort : undefined,
      })
    );
  };

  /** 点击分类标签时添加到筛选 */
  const handleFilterByCategory = (category: string) => {
    if (!workflow.includes(category)) {
      pushFilters({ workflow: [...workflow, category] });
    }
  };

  /** 点击计费模式标签时添加到筛选 */
  const handleFilterByPricing = (pricingModel: string) => {
    if (!pricing.includes(pricingModel)) {
      pushFilters({ pricing: [...pricing, pricingModel] });
    }
  };

  /** 点击产品形态标签时添加到筛选 */
  const handleFilterByProductType = (type: string) => {
    if (!productType.includes(type)) {
      pushFilters({ productType: [...productType, type] });
    }
  };

  return (
    <div className="space-y-1.5">
      <ToolsListToolbar
        language={language}
        productType={productType}
        workflow={workflow}
        pricing={pricing}
        sort={sort}
        productTypeOptions={productTypeOptions}
        workflowOptions={workflowOptions}
        pricingOptions={pricingOptions}
        totalCount={totalCount}
        resultCount={resultCount}
        isCompareMode={isCompareMode}
        selectedCount={selectedCount}
        maxSelected={MAX_COMPARE_SELECTION}
        selectedTitles={selectedTitles}
        canCompare={canCompare}
        onEnterCompareMode={enterCompareMode}
        onExitCompareMode={exitCompareMode}
        onClearSelected={clearSelected}
        onOpenCompare={() => setIsModalOpen(true)}
        onReset={() => pushFilters({
          productType: [],
          workflow: [],
          pricing: [],
        })}
        onChangeProductType={(values) => pushFilters({ productType: values })}
        onChangeWorkflow={(values) => pushFilters({ workflow: values })}
        onChangePricing={(values) => pushFilters({ pricing: values })}
        onChangeSort={(value) => pushFilters({ sort: value })}
      />

      <ul role="list" className="space-y-4">
        {items.map((item) => (
          <li key={item.slug}>
            <ToolsListItemCard
              language={language}
              toolSlug={item.slug}
              tool={item.frontmatter}
              heatScore={item.wechatHeatScore}
              isCompareMode={isCompareMode}
              selected={selectedSlugs.includes(item.slug)}
              disabled={reachedMax && !selectedSlugs.includes(item.slug)}
              onToggle={() =>
                toggleSelected({
                  slug: item.slug,
                  title: getToolDisplayTitle(item.frontmatter, language),
                  frontmatter: item.frontmatter,
                })
              }
              onFilterByCategory={handleFilterByCategory}
              onFilterByPricing={handleFilterByPricing}
              onFilterByProductType={handleFilterByProductType}
            />
          </li>
        ))}
      </ul>

      {isModalOpen && (
        <CompareResultModal
          language={language}
          tools={selectedTools.map((tool) => ({ slug: tool.slug, frontmatter: tool.frontmatter }))}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

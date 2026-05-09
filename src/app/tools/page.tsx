import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { PageShell } from '@/components/layout/PageShell';
import { getAllTools } from '@/lib/content';
import type { TPricingModel, TToolCategory, TToolProductType } from '@/types';
import { buildSearchHref, getPositiveIntParam, getStringArrayParam, getStringParam } from '@/utils/query';
import { getRequestLanguage, tServer } from '@/i18n/server';
import { t } from '@/i18n/messages';
import {
  getPricingModelEntries,
  getToolCategoryEntries,
  getToolProductTypeEntries,
} from '@/i18n/labels';
import { ToolsListView } from '@/components/tools/ToolsListView';
import { AI_CODING_WORKFLOWS, isToolWorkflowCategory } from '@/config/filterConfig';
import { getToolGithubAppearanceScore } from '@/config/toolPopularity';
import { getToolWeChatHeatScore } from '@/config/toolWeChatHeat';
import { getToolDisplayTitle } from '@/lib/toolDisplay';

const PAGE_SIZE = 12;

type TToolsSort = 'trending' | 'github' | 'wechat' | 'updated' | 'name';
const DEFAULT_SORT: TToolsSort = 'trending';

function isToolsSort(value: string): value is TToolsSort {
  return value === 'trending' || value === 'github' || value === 'wechat' || value === 'updated' || value === 'name';
}

function isToolProductType(value: string): value is TToolProductType {
  return getToolProductTypeEntries('zh').some(([key]) => key === value);
}

// AI_CODING_WORKFLOWS 和 isToolWorkflowCategory 从 @/config/filterConfig 导入

function isPricingModel(value: string): value is TPricingModel {
  return getPricingModelEntries('zh').some(([key]) => key === value);
}

export function generateMetadata(): Metadata {
  const language = getRequestLanguage();
  return {
    title: t(language, 'tools.page.title'),
    description: t(language, 'tools.page.desc'),
  };
}

export default function ToolsPage({
  searchParams,
}: {
  searchParams?: {
    productType?: string | string[];
    workflow?: string | string[];
    pricing?: string | string[];
    sort?: string | string[];
    page?: string | string[];
    hasTutorials?: string | string[];
    hasTemplates?: string | string[];
  };
}) {
  const language = getRequestLanguage();
  const tools = getAllTools();

  const productType = getStringArrayParam(searchParams?.productType).filter(isToolProductType);
  const workflow = getStringArrayParam(searchParams?.workflow).filter(isToolWorkflowCategory);
  const pricingRaw = getStringArrayParam(searchParams?.pricing);
  const freeTier = pricingRaw.includes('free');
  const pricing = pricingRaw
    .filter(isPricingModel)
    .filter((model): model is Exclude<TPricingModel, 'free'> => model !== 'free');

  const sortParam = getStringParam(searchParams?.sort);
  const sort = sortParam && isToolsSort(sortParam) ? sortParam : DEFAULT_SORT;

  const hasTutorialsParam = getStringParam(searchParams?.hasTutorials);
  const hasTemplatesParam = getStringParam(searchParams?.hasTemplates);
  const filterHasTutorials = hasTutorialsParam === 'true';
  const filterHasTemplates = hasTemplatesParam === 'true';

  const filtered = tools.filter((item) => {
    if (productType.length > 0 && !productType.some((t) => item.frontmatter.productType.includes(t))) return false;
    if (workflow.length > 0 && !workflow.some((c) => item.frontmatter.category.includes(c))) return false;
    const model = item.frontmatter.pricing.model;
    if (pricing.length > 0) {
      if (model === 'free') {
        if (!freeTier) return false;
      } else {
        if (!pricing.includes(model)) return false;
      }
    }
    if (freeTier && !item.frontmatter.pricing.free) return false;

    if (filterHasTutorials) {
      const relatedTutorials = item.frontmatter.relatedTutorials ?? [];
      if (!Array.isArray(relatedTutorials) || relatedTutorials.length === 0) return false;
    }

    if (filterHasTemplates) {
      const relatedTemplates = item.frontmatter.relatedTemplates ?? [];
      if (!Array.isArray(relatedTemplates) || relatedTemplates.length === 0) return false;
    }

    return true;
  });

  const scored = filtered.map((item) => {
    const wechatHeatScore = getToolWeChatHeatScore(item.slug);
    const githubAppearanceScore = getToolGithubAppearanceScore(item.slug);
    const combinedHeatScore = wechatHeatScore + githubAppearanceScore;

    return {
      slug: item.slug,
      frontmatter: item.frontmatter,
      displayTitle: getToolDisplayTitle(item.frontmatter, language),
      wechatHeatScore,
      githubAppearanceScore,
      combinedHeatScore,
    };
  });

  const productTypeOptions = getToolProductTypeEntries(language).map(([key, label]) => ({ value: key, label }));
  const workflowOptions = getToolCategoryEntries(language)
    .filter(([key]) => AI_CODING_WORKFLOWS.includes(key))
    .map(([key, label]) => ({ value: key, label }));
  const pricingOptions: { value: string; label: string }[] = [
    { value: 'free', label: language === 'en' ? 'Free' : '免费' },
    ...getPricingModelEntries(language)
      .filter(([key]) => key !== 'free')
      .map(([key, label]) => ({ value: key, label })),
  ];

  const sorted = scored
    .slice()
    .sort((a, b) => {
      const titleDiff = a.displayTitle.localeCompare(b.displayTitle);
      const wechatDiff = b.wechatHeatScore - a.wechatHeatScore;
      const githubDiff = b.githubAppearanceScore - a.githubAppearanceScore;
      const combinedDiff = b.combinedHeatScore - a.combinedHeatScore;
      const dateDiff = b.frontmatter.updatedAt.localeCompare(a.frontmatter.updatedAt);

      if (sort === 'name') {
        if (titleDiff !== 0) return titleDiff;
        if (combinedDiff !== 0) return combinedDiff;
        if (dateDiff !== 0) return dateDiff;
        return githubDiff;
      }

      if (sort === 'updated') {
        if (dateDiff !== 0) return dateDiff;
        if (combinedDiff !== 0) return combinedDiff;
        if (titleDiff !== 0) return titleDiff;
        return githubDiff;
      }

      if (sort === 'github') {
        if (githubDiff !== 0) return githubDiff;
        if (wechatDiff !== 0) return wechatDiff;
        if (dateDiff !== 0) return dateDiff;
        return titleDiff;
      }

      if (sort === 'wechat') {
        if (wechatDiff !== 0) return wechatDiff;
        if (githubDiff !== 0) return githubDiff;
        if (dateDiff !== 0) return dateDiff;
        return titleDiff;
      }

      // Default: trending (combined heat score -> updatedAt -> title)
      if (combinedDiff !== 0) return combinedDiff;
      if (dateDiff !== 0) return dateDiff;
      return titleDiff;
    });

  const resultCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(resultCount / PAGE_SIZE));
  const currentPage = Math.min(getPositiveIntParam(searchParams?.page), totalPages);
  const pagedItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <PageShell
      header={
        <PageHeader
          title={tServer('tools.page.title')}
          description={tServer('tools.page.desc')}
          align="center"
          density="minimal"
          headline="title"
        />
      }
    >
      <div className="space-y-6">
        {resultCount === 0 ? (
          <EmptyState title={tServer('tools.empty.title')} description={tServer('tools.empty.desc')} />
        ) : (
          <>
            <ToolsListView
              language={language}
              productType={productType}
              workflow={workflow}
              pricing={pricingRaw}
              sort={sort}
              productTypeOptions={productTypeOptions}
              workflowOptions={workflowOptions}
              pricingOptions={pricingOptions}
              totalCount={tools.length}
              resultCount={resultCount}
              items={pagedItems.map((item) => ({
                slug: item.slug,
                frontmatter: item.frontmatter,
                wechatHeatScore: item.wechatHeatScore,
              }))}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              labels={{ previous: tServer('common.prev'), next: tServer('common.next') }}
              buildHref={(page) =>
                buildSearchHref('/tools', {
                  productType,
                  workflow,
                  pricing: pricingRaw,
                  sort: sort === DEFAULT_SORT ? undefined : sort,
                  page: page > 1 ? String(page) : undefined,
                  hasTutorials: filterHasTutorials ? 'true' : undefined,
                  hasTemplates: filterHasTemplates ? 'true' : undefined,
                })
              }
            />
          </>
        )}

      </div>
    </PageShell>
  );
}

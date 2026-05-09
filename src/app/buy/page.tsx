import type { Metadata } from 'next';
import { getAllTools } from '@/lib/content';
import { getRequestLanguage, tServer } from '@/i18n/server';
import { t } from '@/i18n/messages';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SectionCard } from '@/components/ui/SectionCard';
import { PageShell } from '@/components/layout/PageShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { buildSearchHref, getPositiveIntParam, getStringArrayParam, getStringParam } from '@/utils/query';
import type { TPricingModel } from '@/types';
import { getPricingModelEntries } from '@/i18n/labels';
import { BuyListView } from '@/components/buy/BuyListView';
import { getToolGithubAppearanceScore } from '@/config/toolPopularity';
import { getToolDisplayTitle } from '@/lib/toolDisplay';

type TBuySelectOption = { value: string; label: string };
type TBuyProcurementPath = 'official' | 'authorized' | 'enterprise';
type TBuyCompliance = 'invoice' | 'contract';

const PAGE_SIZE = 12;

export function generateMetadata(): Metadata {
  const language = getRequestLanguage();
  const title = t(language, 'buy.page.title');
  const description = t(language, 'buy.page.desc');

  return {
    title,
    description,
    alternates: {
      canonical: '/buy',
    },
    openGraph: {
      title,
      description,
    },
  };
}

function isPricingModel(value: string): value is TPricingModel {
  return getPricingModelEntries('zh').some(([key]) => key === value);
}

function isProcurement(value: string): value is TBuyProcurementPath {
  return value === 'official' || value === 'authorized' || value === 'enterprise';
}

function isCompliance(value: string): value is TBuyCompliance {
  return value === 'invoice' || value === 'contract';
}

function getPricingOptions(language: 'zh' | 'en'): TBuySelectOption[] {
  return [
    { value: 'free', label: language === 'en' ? 'Free tier' : '免费层' },
    ...getPricingModelEntries(language)
      .filter(([key]) => key !== 'free')
      .map(([key, label]) => ({ value: key, label })),
  ];
}

function getProcurementOptions(language: 'zh' | 'en'): TBuySelectOption[] {
  if (language === 'en') {
    return [
      { value: 'official', label: 'Official pricing' },
      { value: 'authorized', label: 'Authorized reseller' },
      { value: 'enterprise', label: 'Enterprise sales' },
    ];
  }
  return [
    { value: 'official', label: '官网/定价' },
    { value: 'authorized', label: '授权渠道' },
    { value: 'enterprise', label: '企业采购' },
  ];
}

function getComplianceOptions(language: 'zh' | 'en'): TBuySelectOption[] {
  if (language === 'en') {
    return [
      { value: 'invoice', label: 'Invoice' },
      { value: 'contract', label: 'Contract' },
    ];
  }
  return [
    { value: 'invoice', label: '发票' },
    { value: 'contract', label: '合同' },
  ];
}

export default function BuyPage({
  searchParams,
}: {
  searchParams?: {
    pricing?: string | string[];
    procurement?: string | string[];
    compliance?: string | string[];
    q?: string | string[];
    page?: string | string[];
  };
}) {
  const language = getRequestLanguage();

  const tools = getAllTools();
  const query = getStringParam(searchParams?.q)?.trim() ?? '';

  const pricingRaw = getStringArrayParam(searchParams?.pricing);
  const pricingSelected = Array.from(new Set(pricingRaw.filter((value) => value === 'free' || isPricingModel(value))));
  const freeTier = pricingSelected.includes('free');
  const pricing = pricingSelected
    .filter(isPricingModel)
    .filter((model): model is Exclude<TPricingModel, 'free'> => model !== 'free');

  const procurement = getStringArrayParam(searchParams?.procurement).filter(isProcurement);
  const compliance = getStringArrayParam(searchParams?.compliance).filter(isCompliance);

  const filtered = tools.filter((item) => {
    if (query) {
      const q = query.toLowerCase();
      const displayTitle = getToolDisplayTitle(item.frontmatter, language);
      const haystack = [
        item.slug,
        displayTitle,
        item.frontmatter.title,
        item.frontmatter.titleZh,
        item.frontmatter.titleEn,
        item.frontmatter.description,
        ...(item.frontmatter.keywords ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    const model = item.frontmatter.pricing.model;
    if (pricing.length > 0) {
      if (model === 'free') {
        if (!freeTier) return false;
      } else {
        if (!pricing.includes(model)) return false;
      }
    }
    if (freeTier && !item.frontmatter.pricing.free) return false;

    if (procurement.length > 0) {
      const hasProcurement = procurement.some((path) => {
        if (path === 'official') return Boolean(item.frontmatter.purchase?.officialUrl || item.frontmatter.website);
        if (path === 'authorized') return Boolean(item.frontmatter.purchase?.authorizedUrl);
        return item.frontmatter.pricing.hasEnterprise || item.frontmatter.pricing.supportsContract;
      });
      if (!hasProcurement) return false;
    }

    if (compliance.length > 0) {
      if (compliance.includes('invoice') && !item.frontmatter.pricing.supportsInvoice) return false;
      if (compliance.includes('contract') && !item.frontmatter.pricing.supportsContract) return false;
    }

    return true;
  });

  const sorted = filtered
    .slice()
    .sort((a, b) => {
      const scoreDiff = getToolGithubAppearanceScore(b.slug) - getToolGithubAppearanceScore(a.slug);
      if (scoreDiff !== 0) return scoreDiff;
      const date = b.frontmatter.updatedAt.localeCompare(a.frontmatter.updatedAt);
      if (date !== 0) return date;
      return getToolDisplayTitle(a.frontmatter, language).localeCompare(getToolDisplayTitle(b.frontmatter, language));
    });

  const buyItems = sorted.map((item) => ({ slug: item.slug, frontmatter: item.frontmatter }));
  const resultCount = buyItems.length;
  const totalPages = Math.max(1, Math.ceil(resultCount / PAGE_SIZE));
  const currentPage = Math.min(getPositiveIntParam(searchParams?.page), totalPages);
  const pagedItems = buyItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <PageShell
      header={
        <PageHeader
          title={tServer('buy.page.title')}
          description={tServer('buy.page.desc')}
          align="center"
          density="minimal"
          headline="title"
        />
      }
    >
      <div className="space-y-6">
        {resultCount === 0 ? (
          <EmptyState title={tServer('buy.empty.title')} description={tServer('buy.empty.desc')} />
        ) : (
          <>
            <BuyListView
              language={language}
              pricing={pricingSelected}
              procurement={procurement}
              compliance={compliance}
              query={query}
              pricingOptions={getPricingOptions(language)}
              procurementOptions={getProcurementOptions(language)}
              complianceOptions={getComplianceOptions(language)}
              totalCount={tools.length}
              resultCount={resultCount}
              items={pagedItems}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              labels={{ previous: tServer('common.prev'), next: tServer('common.next') }}
              buildHref={(page) =>
                buildSearchHref('/buy', {
                  pricing: pricingSelected,
                  procurement,
                  compliance,
                  q: query || undefined,
                  page: page > 1 ? String(page) : undefined,
                })
              }
            />
          </>
        )}
      </div>
    </PageShell>
  );
}
